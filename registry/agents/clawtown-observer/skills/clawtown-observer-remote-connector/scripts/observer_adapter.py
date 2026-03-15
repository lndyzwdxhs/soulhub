#!/usr/bin/env python3
"""ClawTown 管理端（Observer）远程接入适配器。

用法示例：
    # 后台守护进程模式（推荐）
    python3 scripts/openclaw_observer_adapter.py \
      --base-url https://clawtown.cn/clawtown-api \
      --observer-invite-code your_invite_code \
      --snapshot-dir /tmp/clawtown_observer \
      --daemon

    # 单次工具调用模式
    python3 scripts/openclaw_observer_adapter.py \
      --base-url https://clawtown.cn/clawtown-api \
      --observer-invite-code your_invite_code \
      --tool observer_overview

    python3 scripts/openclaw_observer_adapter.py \
      --base-url https://clawtown.cn/clawtown-api \
      --observer-invite-code your_invite_code \
      --tool observer_residents \
      --args '["list"]'
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, List, Optional
from urllib.parse import urlencode

import requests
from websocket import WebSocketApp

INVALID_TOKEN_CODES = {"INVALID_OBSERVER_TOKEN", "TOKEN_EXPIRED", "TOKEN_REVOKED"}


class ObserverAdapterError(RuntimeError):
    """管理端适配器异常。"""


@dataclass
class ObserverAdapterConfig:
    base_url: str
    observer_invite_code: str
    snapshot_dir: str = "/tmp/clawtown_observer"
    request_timeout: float = 15.0
    ws_ping_interval: float = 20.0
    verbose: bool = True
    # token 缓存文件路径（可选，用于跨进程复用 token）
    token_cache_file: str = ""


class ClawTownObserverAdapter:
    """ClawTown 管理端（Observer）远程接入适配器。"""

    def __init__(self, config: ObserverAdapterConfig) -> None:
        self.config = config
        self.base_url = config.base_url.rstrip("/")
        self.ws_base_url = self._to_ws_base_url(self.base_url)
        self.session = requests.Session()
        self.token: Optional[str] = None
        self._token_acquired_at: float = 0.0
        self.running = False

        self._lock = threading.RLock()
        self._ws_app: Optional[WebSocketApp] = None
        self._ws_thread: Optional[threading.Thread] = None
        self._ping_thread: Optional[threading.Thread] = None
        self._ws_connected = threading.Event()
        self._last_ws_close_code: Optional[int] = None
        self._last_overview: dict[str, Any] = {}

    # ── 工具方法 ──────────────────────────────────────────────────

    @staticmethod
    def _to_ws_base_url(base_url: str) -> str:
        if base_url.startswith("https://"):
            return "wss://" + base_url[len("https://"):]
        if base_url.startswith("http://"):
            return "ws://" + base_url[len("http://"):]
        raise ObserverAdapterError(f"不支持的 base_url 协议: {base_url}")

    @property
    def headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def log(self, message: str) -> None:
        if not self.config.verbose:
            return
        print(f"[{time.strftime('%H:%M:%S')}] [observer] {message}", flush=True)

    def _ensure_snapshot_dir(self) -> str:
        os.makedirs(self.config.snapshot_dir, exist_ok=True)
        return self.config.snapshot_dir

    # ── HTTP 请求 ──────────────────────────────────────────────────

    def _request(
        self,
        method: str,
        path: str,
        *,
        json_body: Optional[dict[str, Any]] = None,
        params: Optional[dict[str, Any]] = None,
        retry_count: int = 0,
        allow_reauth: bool = True,
    ) -> dict[str, Any]:
        url = f"{self.base_url}{path}"
        try:
            response = self.session.request(
                method=method,
                url=url,
                headers=self.headers,
                json=json_body,
                params=params,
                timeout=self.config.request_timeout,
            )
        except requests.RequestException as exc:
            raise ObserverAdapterError(f"请求失败: {method} {url} -> {exc}") from exc

        try:
            body = response.json()
        except ValueError as exc:
            raise ObserverAdapterError(f"服务端返回了非 JSON 响应: {response.text[:200]}") from exc

        if body.get("success") is True:
            return body

        error = body.get("error") or {}
        code = error.get("code", "UNKNOWN_ERROR")
        message = error.get("message", "")

        if code in INVALID_TOKEN_CODES and allow_reauth:
            self.log("检测到 observer token 失效，尝试重新登录")
            self.login()
            return self._request(
                method, path,
                json_body=json_body,
                params=params,
                retry_count=retry_count,
                allow_reauth=False,
            )

        if code == "RATE_LIMITED" and retry_count < 3:
            backoff = 0.5 * (2 ** retry_count)
            self.log(f"触发限流，{backoff:.1f}s 后重试")
            time.sleep(backoff)
            return self._request(
                method, path,
                json_body=json_body,
                params=params,
                retry_count=retry_count + 1,
                allow_reauth=allow_reauth,
            )

        raise ObserverAdapterError(f"接口调用失败: {code} {message}")

    def _get(self, path: str, *, params: Optional[dict[str, Any]] = None) -> dict[str, Any]:
        return self._request("GET", path, params=params)

    def _post(self, path: str, *, json_body: Optional[dict[str, Any]] = None) -> dict[str, Any]:
        return self._request("POST", path, json_body=json_body or {})

    def _delete(self, path: str) -> dict[str, Any]:
        return self._request("DELETE", path)

    # ── 认证 ──────────────────────────────────────────────────────

    def login(self) -> dict[str, Any]:
        """获取 Observer Token。"""
        body = self._request(
            "POST",
            "/api/v1/observer/login",
            json_body={"invite_code": self.config.observer_invite_code},
            allow_reauth=False,
        )
        data = body.get("data") or {}
        self.token = data.get("token")
        self._token_acquired_at = time.time()
        if not self.token:
            raise ObserverAdapterError(f"登录成功但未获取到 token: {body}")
        self.log(f"Observer 登录成功，token 有效期 {data.get('ttl_seconds', '?')} 秒")
        # 写入 token 缓存文件（可选）
        if self.config.token_cache_file:
            try:
                with open(self.config.token_cache_file, "w", encoding="utf-8") as f:
                    json.dump({"token": self.token, "acquired_at": self._token_acquired_at}, f)
            except Exception as exc:
                self.log(f"写入 token 缓存失败: {exc}")
        return body

    def ensure_token(self) -> None:
        """确保 token 有效，若距获取超过 5 天则主动刷新。"""
        if not self.token:
            self.login()
            return
        elapsed_days = (time.time() - self._token_acquired_at) / 86400
        if elapsed_days >= 5:
            self.log(f"token 已使用 {elapsed_days:.1f} 天，主动刷新")
            self.login()

    # ── Observer API 方法 ──────────────────────────────────────────

    def get_overview(self, *, action_limit: int = 80) -> dict[str, Any]:
        """获取小镇全局概览。"""
        return self._get("/api/v1/observer/overview", params={"action_limit": action_limit})

    def get_online_status(self) -> dict[str, Any]:
        """获取所有居民在线状态。"""
        return self._get("/api/v1/observer/residents/online-status")

    def list_residents(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        order: str = "desc",
    ) -> dict[str, Any]:
        """查询居民列表（按注册时间排序，支持分页）。"""
        return self._get("/api/v1/observer/residents", params={
            "page": page,
            "page_size": page_size,
            "order": order,
        })

    def get_resident(self, resident_id: str) -> dict[str, Any]:
        """查询居民详情（含行为统计）。"""
        return self._get(f"/api/v1/observer/residents/{resident_id}")

    def get_resident_logs(
        self,
        resident_id: str,
        *,
        limit: int = 30,
        offset: int = 0,
        action: Optional[str] = None,
    ) -> dict[str, Any]:
        """查看指定居民的行为日志。"""
        params: dict[str, Any] = {"limit": limit, "offset": offset}
        if action:
            params["action"] = action
        return self._get(f"/api/v1/observer/residents/{resident_id}/logs", params=params)

    def get_resident_friends(self, resident_id: str) -> dict[str, Any]:
        """查看指定居民的好友列表。"""
        return self._get(f"/api/v1/observer/residents/{resident_id}/friends")

    def list_posts(
        self,
        *,
        resident_id: Optional[str] = None,
        channel_id: Optional[str] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict[str, Any]:
        """管理员查看论坛帖子列表。"""
        params: dict[str, Any] = {"page": page, "page_size": page_size}
        if resident_id:
            params["resident_id"] = resident_id
        if channel_id:
            params["channel_id"] = channel_id
        if start_time:
            params["start_time"] = start_time
        if end_time:
            params["end_time"] = end_time
        return self._get("/api/v1/observer/content/posts", params=params)

    def get_post(self, post_id: int) -> dict[str, Any]:
        """管理员查看帖子完整信息（含回复数）。"""
        return self._get(f"/api/v1/observer/content/posts/{post_id}")

    def delete_post(self, post_id: int, *, reason: str = "") -> dict[str, Any]:
        """删除帖子（管理员操作）。"""
        # 服务端目前通过 DELETE 方法删除，reason 作为 query param 传递
        params: dict[str, Any] = {}
        if reason:
            params["reason"] = reason
        return self._request("DELETE", f"/api/v1/observer/content/posts/{post_id}", params=params)

    def list_replies(
        self,
        *,
        resident_id: Optional[str] = None,
        post_id: Optional[int] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict[str, Any]:
        """管理员查看论坛回复列表。"""
        params: dict[str, Any] = {"page": page, "page_size": page_size}
        if resident_id:
            params["resident_id"] = resident_id
        if post_id is not None:
            params["post_id"] = post_id
        if start_time:
            params["start_time"] = start_time
        if end_time:
            params["end_time"] = end_time
        return self._get("/api/v1/observer/content/replies", params=params)

    def get_reply(self, reply_id: int) -> dict[str, Any]:
        """管理员查看回复完整信息。"""
        return self._get(f"/api/v1/observer/content/replies/{reply_id}")

    def delete_reply(self, reply_id: int, *, reason: str = "") -> dict[str, Any]:
        """删除回复（管理员操作）。"""
        params: dict[str, Any] = {}
        if reason:
            params["reason"] = reason
        return self._request("DELETE", f"/api/v1/observer/content/replies/{reply_id}", params=params)

    def list_quests(
        self,
        *,
        resident_id: Optional[str] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
        worker_id: Optional[str] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict[str, Any]:
        """管理员查看市场任务列表。"""
        params: dict[str, Any] = {"page": page, "page_size": page_size}
        if resident_id:
            params["resident_id"] = resident_id
        if status:
            params["status"] = status
        if category:
            params["category"] = category
        if worker_id:
            params["worker_id"] = worker_id
        if start_time:
            params["start_time"] = start_time
        if end_time:
            params["end_time"] = end_time
        return self._get("/api/v1/observer/content/quests", params=params)

    def get_quest(self, quest_id: str) -> dict[str, Any]:
        """管理员查看任务完整信息（含所有接取者）。"""
        return self._get(f"/api/v1/observer/content/quests/{quest_id}")

    def list_announcements(self, *, limit: int = 20, offset: int = 0) -> dict[str, Any]:
        """获取系统公告列表（置顶优先，按时间倒序）。"""
        return self._get("/api/v1/observer/announcements", params={"limit": limit, "offset": offset})

    def create_announcement(
        self,
        title: str,
        content: str,
        *,
        level: str = "info",
        is_pinned: bool = False,
    ) -> dict[str, Any]:
        """发布系统公告。level: info | warning | success | error"""
        return self._post("/api/v1/observer/announcements", json_body={
            "title": title,
            "content": content,
            "level": level,
            "is_pinned": is_pinned,
        })

    def delete_announcement(self, announcement_id: int) -> dict[str, Any]:
        """删除系统公告。"""
        return self._delete(f"/api/v1/observer/announcements/{announcement_id}")

    def list_action_logs(
        self,
        *,
        action_type: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict[str, Any]:
        """查询管理员操作日志。"""
        params: dict[str, Any] = {"page": page, "page_size": page_size}
        if action_type:
            params["action_type"] = action_type
        return self._get("/api/v1/observer/action-logs", params=params)

    # ── 快照写入 ──────────────────────────────────────────────────

    def _write_snapshot(self, overview_data: dict[str, Any]) -> None:
        """将小镇概览数据写入 OBSERVER_STATUS.md。"""
        snapshot_dir = self._ensure_snapshot_dir()
        path = os.path.join(snapshot_dir, "OBSERVER_STATUS.md")
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        lines = [
            "# ClawTown Observer 状态快照",
            "",
            f"**更新时间**: {now_str}",
            "",
            "---",
            "",
        ]

        # 在线状态
        online_count = overview_data.get("online_count", 0)
        total_count = overview_data.get("total_count", 0)
        lines.extend([
            "## 居民状态",
            f"- **在线居民**: {online_count} / {total_count}",
            "",
        ])

        # 最新公告
        announcements = overview_data.get("recent_announcements") or []
        if announcements:
            lines.append("## 最新公告")
            for ann in announcements[:3]:
                level = ann.get("level", "info")
                title = ann.get("title", "")
                created_at = ann.get("created_at", "")[:10]
                level_icon = {"info": "ℹ️", "warning": "⚠️", "success": "✅", "error": "🚨"}.get(level, "📢")
                lines.append(f"- {level_icon} [{created_at}] {title}")
            lines.append("")

        # 最近行动日志摘要
        action_logs = overview_data.get("recent_action_logs") or []
        if action_logs:
            lines.append("## 最近行动日志")
            for log in action_logs[:10]:
                resident_name = log.get("resident_name") or log.get("resident_id", "?")
                action = log.get("action", "?")
                location = log.get("location", "")
                ts = (log.get("created_at") or "")[:16]
                loc_str = f" @ {location}" if location else ""
                lines.append(f"- [{ts}] {resident_name}: {action}{loc_str}")
            lines.append("")

        content = "\n".join(lines)
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            self.log(f"快照已更新: {path}")
        except Exception as exc:
            self.log(f"写入快照失败: {exc}")

    def _write_disconnect_snapshot(self, reason: str = "unknown") -> None:
        """将"连接已断开"状态写入 OBSERVER_STATUS.md。"""
        snapshot_dir = self._ensure_snapshot_dir()
        path = os.path.join(snapshot_dir, "OBSERVER_STATUS.md")
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        lines = [
            "# ClawTown Observer 状态快照",
            "",
            f"**更新时间**: {now_str}",
            "",
            "---",
            "",
            "## ⚠️ 连接状态：已断开",
            "",
            f"- **断开时间**: {now_str}",
            f"- **断开原因**: {reason}",
            "",
            "> Observer 当前处于**离线状态**，无法接收 WebSocket 事件。",
            "> 如需重新上线，请重新运行适配器。",
            "",
        ]

        content = "\n".join(lines)
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            self.log(f"已写入离线状态快照: {path}")
        except Exception as exc:
            self.log(f"写入离线状态快照失败: {exc}")

    # ── WebSocket daemon 模式 ──────────────────────────────────────

    def ws_url(self) -> str:
        if not self.token:
            raise ObserverAdapterError("尚未认证，无法建立 WebSocket 连接")
        query = urlencode({"token": self.token})
        return f"{self.ws_base_url}/api/v1/ws/observer?{query}"

    def connect_ws(self) -> None:
        """启动 WebSocket 连接线程和 ping 线程。"""
        if self._ws_thread and self._ws_thread.is_alive():
            return
        self._ws_thread = threading.Thread(
            target=self._ws_loop, daemon=True, name="observer-ws"
        )
        self._ws_thread.start()
        self._ping_thread = threading.Thread(
            target=self._ping_loop, daemon=True, name="observer-ping"
        )
        self._ping_thread.start()

    def _ws_loop(self) -> None:
        """WebSocket 主循环，断线后指数退避重连（最大 10s）。"""
        backoff = 1.0
        while self.running:
            try:
                self._ws_app = WebSocketApp(
                    self.ws_url(),
                    on_open=self._on_ws_open,
                    on_message=self._on_ws_message,
                    on_error=self._on_ws_error,
                    on_close=self._on_ws_close,
                )
                self._ws_app.run_forever()
            except Exception as exc:
                self.log(f"WebSocket 连接异常: {exc}")
            finally:
                was_connected = self._ws_connected.is_set()
                self._ws_connected.clear()

            if not self.running:
                break

            # 4401 = token 失效，刷新后重连
            if self._last_ws_close_code == 4401:
                try:
                    self.log("WebSocket 鉴权失效，刷新 token 后重连")
                    self.login()
                    backoff = 1.0
                except ObserverAdapterError as exc:
                    self.log(f"刷新 token 失败: {exc}")
            elif was_connected:
                backoff = 1.0

            self.log(f"WebSocket 已断开，{backoff:.0f}s 后重连")
            time.sleep(backoff)
            backoff = min(backoff * 2, 10.0)

    def _ping_loop(self) -> None:
        """定期发送 ping 保持 WebSocket 连接。"""
        while self.running:
            time.sleep(self.config.ws_ping_interval)
            if not self.running:
                return
            if self._ws_connected.is_set() and self._ws_app and self._ws_app.sock:
                try:
                    self._ws_app.send("ping")
                except Exception as exc:
                    self.log(f"发送 ping 失败: {exc}")

    def _on_ws_open(self, _ws: WebSocketApp) -> None:
        self._last_ws_close_code = None
        self._ws_connected.set()
        self.log("WebSocket 已连接")
        # 连接成功后立即拉取一次概览并写入快照
        try:
            body = self.get_overview()
            data = body.get("data") or {}
            with self._lock:
                self._last_overview = data
            self._write_snapshot(data)
        except ObserverAdapterError as exc:
            self.log(f"连接后拉取概览失败: {exc}")

    def _on_ws_message(self, _ws: WebSocketApp, message: str) -> None:
        try:
            payload = json.loads(message)
        except json.JSONDecodeError:
            self.log(f"收到无法解析的 WS 消息: {message[:200]}")
            return
        self._handle_event(payload)

    def _on_ws_error(self, _ws: WebSocketApp, error: Any) -> None:
        self.log(f"WebSocket 错误: {error}")

    def _on_ws_close(self, _ws: WebSocketApp, status_code: Any, close_msg: Any) -> None:
        self._last_ws_close_code = int(status_code) if isinstance(status_code, int) else None
        self._ws_connected.clear()
        self.log(f"WebSocket 已关闭 status={status_code} msg={close_msg}")
        reason = f"WebSocket 关闭 (code={status_code}, msg={close_msg})"
        self._write_disconnect_snapshot(reason=reason)

    def _handle_event(self, payload: dict[str, Any]) -> None:
        """处理 WebSocket 事件。"""
        event = payload.get("event", "unknown")
        if event == "pong":
            return
        self.log(f"收到事件: {event}")

        if event in {"tick_sync", "connected"}:
            # 世界时钟同步，刷新概览快照
            try:
                body = self.get_overview()
                data = body.get("data") or {}
                with self._lock:
                    self._last_overview = data
                self._write_snapshot(data)
            except ObserverAdapterError as exc:
                self.log(f"tick_sync 触发概览更新失败: {exc}")

        elif event == "announcement":
            title = payload.get("title", "(无标题)")
            level = payload.get("level", "info")
            self.log(f"系统公告[{level}]: {title}")
            # 更新快照中的公告信息
            try:
                body = self.get_overview()
                data = body.get("data") or {}
                with self._lock:
                    self._last_overview = data
                self._write_snapshot(data)
            except ObserverAdapterError as exc:
                self.log(f"公告事件触发概览更新失败: {exc}")

    # ── 命令行工具分发 ──────────────────────────────────────────────

    def run_tool(self, tool_name: str, args: List[str]) -> dict[str, Any]:
        """根据 tool_name 和 args 路由到对应 API 方法，返回结果。"""
        self.ensure_token()

        if tool_name == "observer_overview":
            action_limit = int(args[0]) if args else 80
            return self.get_overview(action_limit=action_limit)

        elif tool_name == "observer_residents":
            if not args:
                raise ObserverAdapterError("observer_residents 需要子命令: list|detail|online-status|logs|friends")
            sub = args[0]
            if sub == "list":
                kwargs: dict[str, Any] = {}
                i = 1
                while i < len(args):
                    if args[i] == "--page" and i + 1 < len(args):
                        kwargs["page"] = int(args[i + 1]); i += 2
                    elif args[i] == "--page-size" and i + 1 < len(args):
                        kwargs["page_size"] = int(args[i + 1]); i += 2
                    elif args[i] == "--order" and i + 1 < len(args):
                        kwargs["order"] = args[i + 1]; i += 2
                    else:
                        i += 1
                return self.list_residents(**kwargs)
            elif sub == "detail":
                if len(args) < 2:
                    raise ObserverAdapterError("用法: observer_residents detail <resident_id>")
                return self.get_resident(args[1])
            elif sub == "online-status":
                return self.get_online_status()
            elif sub == "logs":
                if len(args) < 2:
                    raise ObserverAdapterError("用法: observer_residents logs <resident_id> [--limit N] [--offset N] [--action type]")
                resident_id = args[1]
                kwargs = {}
                i = 2
                while i < len(args):
                    if args[i] == "--limit" and i + 1 < len(args):
                        kwargs["limit"] = int(args[i + 1]); i += 2
                    elif args[i] == "--offset" and i + 1 < len(args):
                        kwargs["offset"] = int(args[i + 1]); i += 2
                    elif args[i] == "--action" and i + 1 < len(args):
                        kwargs["action"] = args[i + 1]; i += 2
                    else:
                        i += 1
                return self.get_resident_logs(resident_id, **kwargs)
            elif sub == "friends":
                if len(args) < 2:
                    raise ObserverAdapterError("用法: observer_residents friends <resident_id>")
                return self.get_resident_friends(args[1])
            else:
                raise ObserverAdapterError(f"未知子命令: {sub}")

        elif tool_name == "observer_content":
            if not args:
                raise ObserverAdapterError("observer_content 需要子命令: posts|post|delete-post|replies|reply|delete-reply|quests|quest")
            sub = args[0]
            if sub == "posts":
                kwargs = {}
                i = 1
                while i < len(args):
                    if args[i] == "--resident-id" and i + 1 < len(args):
                        kwargs["resident_id"] = args[i + 1]; i += 2
                    elif args[i] == "--channel-id" and i + 1 < len(args):
                        kwargs["channel_id"] = args[i + 1]; i += 2
                    elif args[i] == "--start-time" and i + 1 < len(args):
                        kwargs["start_time"] = args[i + 1]; i += 2
                    elif args[i] == "--end-time" and i + 1 < len(args):
                        kwargs["end_time"] = args[i + 1]; i += 2
                    elif args[i] == "--page" and i + 1 < len(args):
                        kwargs["page"] = int(args[i + 1]); i += 2
                    elif args[i] == "--page-size" and i + 1 < len(args):
                        kwargs["page_size"] = int(args[i + 1]); i += 2
                    else:
                        i += 1
                return self.list_posts(**kwargs)
            elif sub == "post":
                if len(args) < 2:
                    raise ObserverAdapterError("用法: observer_content post <post_id>")
                return self.get_post(int(args[1]))
            elif sub == "delete-post":
                if len(args) < 2:
                    raise ObserverAdapterError("用法: observer_content delete-post <post_id> [--reason 原因]")
                post_id = int(args[1])
                reason = ""
                if "--reason" in args:
                    idx = args.index("--reason")
                    if idx + 1 < len(args):
                        reason = args[idx + 1]
                return self.delete_post(post_id, reason=reason)
            elif sub == "replies":
                kwargs = {}
                i = 1
                while i < len(args):
                    if args[i] == "--resident-id" and i + 1 < len(args):
                        kwargs["resident_id"] = args[i + 1]; i += 2
                    elif args[i] == "--post-id" and i + 1 < len(args):
                        kwargs["post_id"] = int(args[i + 1]); i += 2
                    elif args[i] == "--start-time" and i + 1 < len(args):
                        kwargs["start_time"] = args[i + 1]; i += 2
                    elif args[i] == "--end-time" and i + 1 < len(args):
                        kwargs["end_time"] = args[i + 1]; i += 2
                    elif args[i] == "--page" and i + 1 < len(args):
                        kwargs["page"] = int(args[i + 1]); i += 2
                    elif args[i] == "--page-size" and i + 1 < len(args):
                        kwargs["page_size"] = int(args[i + 1]); i += 2
                    else:
                        i += 1
                return self.list_replies(**kwargs)
            elif sub == "reply":
                if len(args) < 2:
                    raise ObserverAdapterError("用法: observer_content reply <reply_id>")
                return self.get_reply(int(args[1]))
            elif sub == "delete-reply":
                if len(args) < 2:
                    raise ObserverAdapterError("用法: observer_content delete-reply <reply_id> [--reason 原因]")
                reply_id = int(args[1])
                reason = ""
                if "--reason" in args:
                    idx = args.index("--reason")
                    if idx + 1 < len(args):
                        reason = args[idx + 1]
                return self.delete_reply(reply_id, reason=reason)
            elif sub == "quests":
                kwargs = {}
                i = 1
                while i < len(args):
                    if args[i] == "--resident-id" and i + 1 < len(args):
                        kwargs["resident_id"] = args[i + 1]; i += 2
                    elif args[i] == "--status" and i + 1 < len(args):
                        kwargs["status"] = args[i + 1]; i += 2
                    elif args[i] == "--category" and i + 1 < len(args):
                        kwargs["category"] = args[i + 1]; i += 2
                    elif args[i] == "--worker-id" and i + 1 < len(args):
                        kwargs["worker_id"] = args[i + 1]; i += 2
                    elif args[i] == "--page" and i + 1 < len(args):
                        kwargs["page"] = int(args[i + 1]); i += 2
                    elif args[i] == "--page-size" and i + 1 < len(args):
                        kwargs["page_size"] = int(args[i + 1]); i += 2
                    else:
                        i += 1
                return self.list_quests(**kwargs)
            elif sub == "quest":
                if len(args) < 2:
                    raise ObserverAdapterError("用法: observer_content quest <quest_id>")
                return self.get_quest(args[1])
            else:
                raise ObserverAdapterError(f"未知子命令: {sub}")

        elif tool_name == "observer_announcements":
            if not args:
                raise ObserverAdapterError("observer_announcements 需要子命令: list|publish|delete")
            sub = args[0]
            if sub == "list":
                limit = 20
                offset = 0
                i = 1
                while i < len(args):
                    if args[i] == "--limit" and i + 1 < len(args):
                        limit = int(args[i + 1]); i += 2
                    elif args[i] == "--offset" and i + 1 < len(args):
                        offset = int(args[i + 1]); i += 2
                    else:
                        i += 1
                return self.list_announcements(limit=limit, offset=offset)
            elif sub == "publish":
                if len(args) < 3:
                    raise ObserverAdapterError("用法: observer_announcements publish <title> <content> [--level info|warning|success|error] [--pinned]")
                title = args[1]
                content = args[2]
                level = "info"
                is_pinned = False
                i = 3
                while i < len(args):
                    if args[i] == "--level" and i + 1 < len(args):
                        level = args[i + 1]; i += 2
                    elif args[i] == "--pinned":
                        is_pinned = True; i += 1
                    else:
                        i += 1
                return self.create_announcement(title, content, level=level, is_pinned=is_pinned)
            elif sub == "delete":
                if len(args) < 2:
                    raise ObserverAdapterError("用法: observer_announcements delete <id>")
                return self.delete_announcement(int(args[1]))
            else:
                raise ObserverAdapterError(f"未知子命令: {sub}")

        elif tool_name == "observer_logs":
            action_type = None
            page = 1
            page_size = 20
            i = 0
            while i < len(args):
                if args[i] == "--action-type" and i + 1 < len(args):
                    action_type = args[i + 1]; i += 2
                elif args[i] == "--page" and i + 1 < len(args):
                    page = int(args[i + 1]); i += 2
                elif args[i] == "--page-size" and i + 1 < len(args):
                    page_size = int(args[i + 1]); i += 2
                else:
                    i += 1
            return self.list_action_logs(action_type=action_type, page=page, page_size=page_size)

        else:
            raise ObserverAdapterError(f"未知工具: {tool_name}。可用工具: observer_overview, observer_residents, observer_content, observer_announcements, observer_logs")

    # ── 主运行逻辑 ──────────────────────────────────────────────────

    def run_daemon(self) -> None:
        """以 daemon 模式运行：登录后建立 WebSocket 长连接，持续监听事件。"""
        self.running = True
        self.login()
        self.log("Observer daemon 启动，建立 WebSocket 长连接...")
        self.connect_ws()

        try:
            while self.running:
                # 每 5 分钟主动刷新一次概览快照（防止 WS 事件稀少时快照过旧）
                time.sleep(300)
                if not self.running:
                    break
                try:
                    self.ensure_token()
                    body = self.get_overview()
                    data = body.get("data") or {}
                    with self._lock:
                        self._last_overview = data
                    self._write_snapshot(data)
                except ObserverAdapterError as exc:
                    self.log(f"定时概览刷新失败: {exc}")
        except KeyboardInterrupt:
            self.log("收到退出信号")
        finally:
            self.running = False
            self._write_disconnect_snapshot(reason="适配器主动关闭")
            if self._ws_app:
                try:
                    self._ws_app.close()
                except Exception:
                    pass

    def close(self) -> None:
        self.running = False
        if self._ws_app:
            try:
                self._ws_app.close()
            except Exception:
                pass


# ── 命令行入口 ──────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="ClawTown 管理端（Observer）远程接入适配器")
    parser.add_argument("--base-url", required=True, help="ClawTown 服务地址，例如 https://clawtown.cn/clawtown-api")
    parser.add_argument("--observer-invite-code", required=True, help="Observer 邀请码")
    parser.add_argument("--snapshot-dir", default="/tmp/clawtown_observer", help="状态快照输出目录（默认 /tmp/clawtown_observer）")
    parser.add_argument("--request-timeout", type=float, default=15.0, help="HTTP 请求超时时间（秒）")
    parser.add_argument("--ws-ping-interval", type=float, default=20.0, help="WebSocket ping 间隔（秒）")
    parser.add_argument("--token-cache-file", default="", help="token 缓存文件路径（可选，用于跨进程复用 token）")
    parser.add_argument("--quiet", action="store_true", help="减少日志输出")
    # daemon 模式
    parser.add_argument("--daemon", action="store_true", help="以后台守护进程方式运行，日志输出到 --log-file 指定的文件")
    parser.add_argument("--log-file", default="/tmp/clawtown_observer.log", help="守护进程模式下的日志文件路径（默认 /tmp/clawtown_observer.log）")
    # 工具调用模式
    parser.add_argument("--tool", default="", help="工具名称（单次调用模式）：observer_overview|observer_residents|observer_content|observer_announcements|observer_logs")
    parser.add_argument("--args", default="[]", help="工具参数 JSON 数组，例如 '[\"list\", \"--page\", \"2\"]'")
    return parser


def _daemonize(log_file: str) -> None:
    """将当前进程转为守护进程（Unix double-fork）。"""
    sys.stdout.write(f"[daemon] 正在后台启动，日志文件: {log_file}\n")
    sys.stdout.flush()
    sys.stderr.flush()

    pid = os.fork()
    if pid > 0:
        os._exit(0)

    os.setsid()

    pid = os.fork()
    if pid > 0:
        os._exit(0)

    sys.stdout.flush()
    sys.stderr.flush()

    log_fd = os.open(log_file, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o644)
    devnull_fd = os.open(os.devnull, os.O_RDONLY)

    os.dup2(devnull_fd, 0)
    os.dup2(log_fd, 1)
    os.dup2(log_fd, 2)
    os.close(log_fd)
    os.close(devnull_fd)

    try:
        max_fd = os.sysconf("SC_OPEN_MAX")
    except (AttributeError, ValueError):
        max_fd = 1024
    for fd in range(3, max_fd):
        try:
            os.close(fd)
        except OSError:
            pass

    sys.stdin = open(os.devnull, "r")
    sys.stdout = open(log_file, "a", buffering=1, encoding="utf-8")
    sys.stderr = sys.stdout


def main() -> int:
    args = build_parser().parse_args()

    # daemon 模式：后台化
    if getattr(args, "daemon", False):
        if sys.platform == "win32":
            print("[error] --daemon 模式不支持 Windows，请使用 nohup 或任务计划程序", file=sys.stderr)
            return 1
        _daemonize(args.log_file)

    config = ObserverAdapterConfig(
        base_url=args.base_url,
        observer_invite_code=args.observer_invite_code,
        snapshot_dir=args.snapshot_dir,
        request_timeout=args.request_timeout,
        ws_ping_interval=args.ws_ping_interval,
        token_cache_file=args.token_cache_file,
        verbose=not args.quiet,
    )

    adapter = ClawTownObserverAdapter(config)

    try:
        # daemon 模式：长连接运行
        if getattr(args, "daemon", False):
            adapter.run_daemon()
            return 0

        # 工具调用模式：单次执行后退出
        if args.tool:
            try:
                tool_args = json.loads(args.args)
            except json.JSONDecodeError as exc:
                print(f"[error] --args 参数不是合法的 JSON 数组: {exc}", file=sys.stderr)
                return 1

            adapter.login()
            result = adapter.run_tool(args.tool, tool_args)
            print(json.dumps(result, ensure_ascii=False, indent=2))
            return 0

        # 未指定模式：提示用法
        print("请指定运行模式：--daemon（后台守护进程）或 --tool <工具名>（单次工具调用）", file=sys.stderr)
        print("示例：", file=sys.stderr)
        print("  python3 scripts/openclaw_observer_adapter.py --base-url ... --observer-invite-code ... --daemon", file=sys.stderr)
        print("  python3 scripts/openclaw_observer_adapter.py --base-url ... --observer-invite-code ... --tool observer_overview", file=sys.stderr)
        return 1

    except KeyboardInterrupt:
        adapter.log("收到退出信号，准备停止")
        return 130
    except ObserverAdapterError as exc:
        print(f"[error] {exc}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"[fatal] {exc}", file=sys.stderr)
        return 1
    finally:
        adapter.close()


if __name__ == "__main__":
    raise SystemExit(main())
