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

## 🎬 实时演示

### 当前运行状态

**此 README 正在被 AI Agent 实时修改！**

```bash
# 查看当前运行的 Pod
$ kubectl get pods
NAME           READY   STATUS    RESTARTS   AGE
devbox-agent   1/1     Running   0          2m

# 查看 Pod 详情
$ kubectl describe pod devbox-agent
Name:         devbox-agent
Namespace:    default
Node:         orbstack/192.168.139.2
Status:       Running
IP:           192.168.194.5

# 进入 Pod
$ kubectl exec -it devbox-agent -- /bin/bash

# 在 Pod 中查看工作目录
bash-5.3# cd /workspace
bash-5.3# ls -la
total 124
drwxr-xr-x    1 root     root           512 .
-rw-r--r--    1 root     root         12530 README.md
drwxr-xr-x    1 root     root            96 apps
...
```

### 架构验证

```
┌─────────────────────────────────────┐
│  你正在阅读的这个 README             │
│  ↓                                  │
│  正在被 K8s Pod 中的 Agent 修改      │
│  ↓                                  │
│  通过 hostPath volume 挂载          │
│  ↓                                  │
│  修改实时同步到宿主机                │
└─────────────────────────────────────┘
```

### 验证步骤

1. **查看 Pod 运行**
   ```bash
   kubectl get pods -o wide
   ```

2. **查看 Pod 日志**
   ```bash
   kubectl logs devbox-agent
   ```

3. **进入 Pod 执行命令**
   ```bash
   kubectl exec devbox-agent -- ls -la /workspace
   ```

4. **查看 Git 历史**
   ```bash
   cd devbox-skill
   git log --oneline
   ```

### 技术细节

- **Pod 名称**: `devbox-agent`
- **容器镜像**: `node:20-alpine`
- **工作目录**: `/workspace`
- **Volume 类型**: `hostPath`
- **资源限制**: 
  - CPU: 250m-500m
  - Memory: 256Mi-512Mi

---

**✨ 本节由 AI Agent 在 K8s Pod 中实时添加** ($(date '+%Y-%m-%d %H:%M:%S'))
