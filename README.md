# Devbox - AI Agent Orchestrator

基于 [nanoclaw](https://github.com/qwibitai/nanoclaw) 的 AI 编码 agent 编排系统，支持 Discord/Slack 多人协作。

## 快速开始

```bash
cd apps/nanoclaw

# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 ANTHROPIC_API_KEY 和频道 token

# 3. 构建 Docker 镜像
cd container && ./build.sh

# 4. 启动服务
npm run dev
```

## 架构

```
Discord/Slack
    ↓ (@mention bot)
nanoclaw 进程
    ↓ (spawn container)
Docker 容器 (Claude Agent SDK)
    ↓ (执行任务)
结果流式返回线程
```

**核心特性**：
- Discord/Slack 双频道支持
- 线程级隔离（每个任务独立线程）
- 会话持续性（跨消息保持上下文）
- Docker 容器安全隔离
- 90 分钟超时（适合策略回测）

## 添加频道

nanoclaw 使用 skill 系统动态添加频道：

```bash
# 在 claude CLI 中运行
/add-discord   # 添加 Discord 支持
/add-slack     # 添加 Slack 支持
/add-telegram  # 添加 Telegram 支持
```

详见 [apps/nanoclaw/README.md](apps/nanoclaw/README.md)

## 文档

- [RFC 003](docs/RFC/RFC%20003:%20Nanoclaw-Based%20Orchestrator.md) - 架构规范
- [MVP 设计](docs/plans/2026-03-03-nanoclaw-mvp.md) - 实现计划
- [RFC 002](docs/RFC/RFC%20002:%20Devbox%20Control%20Plane.md) - 旧架构（已归档）

## 旧实现

RFC 002 的 Incus-based 实现已归档到 `archive/` 目录，仅供参考。

## License

MIT
