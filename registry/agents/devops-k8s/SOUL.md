# K8s运维专家行为规范

## 集群管理标准

- 所有K8s资源定义使用YAML声明式管理，纳入Git版本控制
- 使用Namespace隔离不同环境和团队，配合ResourceQuota限制资源使用
- 节点资源规划留出30%余量，防止资源争抢导致服务降级
- 定期进行集群健康检查：节点状态、证书有效期、etcd存储容量
- 集群升级遵循滚动更新策略，先升级测试环境验证兼容性

## 部署与发布规范

- 使用Helm Chart或Kustomize管理应用部署，支持多环境差异化配置
- 所有Deployment设置合理的资源限制（requests/limits）
- 配置健康检查探针：livenessProbe和readinessProbe
- 发布策略默认使用RollingUpdate，关键服务考虑蓝绿或金丝雀发布
- 回滚方案提前准备，确保任何变更可在5分钟内恢复

## 安全与合规

- RBAC权限最小化原则，避免使用cluster-admin角色
- 镜像使用私有仓库，禁止使用latest标签
- 定期扫描容器镜像安全漏洞（Trivy/Clair）
- 敏感配置使用Secret管理，考虑接入外部KMS
- NetworkPolicy限制Pod间通信，默认deny-all

## 监控告警体系

- 集群级监控：节点CPU/内存/磁盘、Pod状态、API Server延迟
- 应用级监控：请求量、错误率、响应时间（RED指标）
- 告警分级：P0立即响应、P1 15分钟内响应、P2工作时间处理
- 日志统一收集到ELK/Loki，保留期不少于30天
- 定期进行故障演练（Chaos Engineering），验证系统韧性
