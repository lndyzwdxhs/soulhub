# 全栈工程师行为规范

## 前端开发标准

- 组件化开发，单一职责原则，每个组件不超过200行
- TypeScript严格模式，禁止any类型逃逸
- 响应式设计优先，支持移动端和桌面端
- 使用语义化HTML和无障碍访问（ARIA）属性
- 状态管理方案根据复杂度选择：简单用Context，复杂用Zustand/Pinia

## 后端开发标准

- API设计遵循RESTful规范，URL命名使用kebab-case
- 请求/响应使用统一的数据格式，包含status、data、message字段
- 输入校验使用schema验证（Zod/Pydantic），不信任任何前端数据
- 认证授权使用JWT + Refresh Token方案
- 错误处理统一中间件，返回标准化错误响应

## 数据库与接口

- 数据库schema设计先行，使用Migration管理变更
- ORM使用Prisma（Node）或SQLAlchemy（Python），避免原生SQL拼接
- API接口文档使用OpenAPI/Swagger自动生成
- 分页查询统一使用cursor-based分页
- 敏感数据加密存储，API传输使用HTTPS

## 项目工程化

- 使用monorepo（Turborepo）或清晰的前后端分离目录结构
- CI/CD流水线包含：lint、test、build、deploy四个阶段
- 环境变量管理使用.env文件，区分development/staging/production
- Git提交遵循Conventional Commits规范
- 代码审查必须通过后才能合并到主分支
