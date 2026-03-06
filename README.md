# Devbox - AI Agent Orchestrator

基于 [Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator) + Kubernetes 的 AI 编码 agent 编排系统，支持 Discord/Slack/Telegram 多人协作。

## 🎯 核心特性

- ✅ **Kubernetes 隔离** - 每个 agent 独立 pod，完全隔离
- ✅ **并行编排** - 多项目、多任务同时运行
- ✅ **Git Worktree** - 自动分支管理，无冲突
- ✅ **CI 自愈** - 失败自动修复，无需人工干预
- ✅ **PR 自动化** - 自动响应 review 评论
- ✅ **多频道** - Discord/Slack/Telegram 统一接入
- ✅ **长时运行** - 90 分钟超时，适合复杂任务

## 🏗️ 架构

### V2 架构（Agent Orchestrator + K8s）

```
┌─────────────────────────────────────────────────────────┐
│  Communication Layer                                    │
│  Discord / Slack / Telegram                             │
│  (@mention bot → trigger task)                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Orchestration Layer                                    │
│  Agent Orchestrator                                     │
│  • Task routing & scheduling                            │
│  • Git worktree management                              │
│  • CI/PR automation                                     │
│  • Session lifecycle                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Runtime Layer                                          │
│  Kubernetes (OrbStack)                                  │
│  • Pod isolation                                        │
│  • Resource limits                                      │
│  • Auto-restart                                         │
│  • Volume mounting                                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Agent Layer                                            │
│  Claude Agent SDK / Codex / Aider                       │
│  • Code analysis                                        │
│  • Test generation                                      │
│  • PR creation                                          │
│  • Streaming output                                     │
└─────────────────────────────────────────────────────────┘
```

### 实现细节

**通过 Agent Orchestrator 实现**：
- **编排引擎** - 管理多个 agent 会话的生命周期
- **插件系统** - Runtime/Agent/Tracker/Notifier 可插拔
- **Kubernetes Runtime 插件** - 自定义实现，位于 `agent-orchestrator/packages/plugins/runtime-k8s/`
- **Reaction 系统** - 自动响应 CI 失败和 PR 评论

**K8s 集成**：
- **OrbStack** - 本地 Kubernetes 环境
- **Pod 规格** - node:20-alpine 基础镜像
- **Volume 挂载** - 工作目录映射到 pod
- **命名空间** - 默认 `default`，可配置

## 🚀 快速开始

### 前置要求

```bash
# 1. OrbStack (包含 Kubernetes)
brew install orbstack

# 2. 验证 k8s 运行
kubectl cluster-info

# 3. Node.js 20+ 和 pnpm
node --version  # v20+
pnpm --version
```

### 安装和启动

#### 方式 A：使用 Agent Orchestrator（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/ComposioHQ/agent-orchestrator.git
git clone https://github.com/uu-z/devbox-skill.git

# 2. 安装 Agent Orchestrator
cd agent-orchestrator
pnpm install && pnpm build

# 3. 使用 devbox 配置启动
ao start --config devbox-config.yaml
```

**Dashboard**: http://localhost:3000

#### 方式 B：独立运行 nanoclaw（开发模式）

```bash
cd devbox-skill/apps/nanoclaw

# 1. 安装依赖
npm install

# 2. 配置环境
cp .env.example .env
# 编辑 .env：ANTHROPIC_API_KEY, DISCORD_TOKEN 等

# 3. 构建容器
cd container && ./build.sh

# 4. 启动
npm run dev
```

## 📖 使用指南

### 生成 Agent 任务

```bash
# 从 GitHub issue
ao spawn devbox 123

# 从 Linear ticket  
ao spawn devbox LIN-456

# 自定义任务
ao spawn devbox "实现用户认证功能"
```

### 监控和管理

```bash
# 查看所有会话
ao status

# 查看会话详情
ao session ls

# 向 agent 发送指令
ao send <session-id> "请添加单元测试"

# 终止会话
ao session kill <session-id>

# 恢复崩溃的 agent
ao session restore <session-id>
```

### Kubernetes 操作

```bash
# 查看 agent pods
kubectl get pods -l app=agent-orchestrator

# 查看 pod 日志
kubectl logs <pod-name>

# 进入 pod shell
kubectl exec -it <pod-name> -- /bin/sh

# 查看资源使用
kubectl top pods
```

## ⚙️ 配置

### devbox-config.yaml

```yaml
port: 3000

defaults:
  runtime: k8s              # 使用 Kubernetes runtime
  agent: claude-code        # 或 codex, aider
  workspace: worktree       # Git worktree 模式
  notifiers: [desktop]      # 桌面通知

projects:
  devbox:
    repo: uu-z/devbox-skill
    path: ~/devbox-skill
    defaultBranch: main
    sessionPrefix: devbox
    runtime: k8s

# Kubernetes 配置
kubernetes:
  context: orbstack         # k8s context
  namespace: default        # 命名空间
  image: node:20-alpine     # 容器镜像
  resources:                # 资源限制（可选）
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "2000m"

# 自动化规则
reactions:
  ci-failed:
    auto: true              # 自动处理
    action: send-to-agent   # 发送给 agent
    retries: 2              # 重试次数
    
  changes-requested:
    auto: true
    action: send-to-agent
    escalateAfter: 30m      # 30分钟后升级
    
  approved-and-green:
    auto: false             # 手动合并
    action: notify          # 仅通知
```

## 🔄 工作流示例

### 场景：修复 Bug

```bash
# 1. 创建任务
ao spawn devbox 789  # GitHub issue #789
```

**自动执行流程**：

1. ✅ 创建 git worktree + 新分支 `fix/issue-789`
2. ✅ 启动 k8s pod `ao-devbox-789`
3. ✅ Agent 分析代码，定位 bug
4. ✅ 修复代码，运行测试
5. ✅ 创建 PR

**CI 失败自动修复**：
- Agent 获取 CI 日志
- 分析失败原因
- 修复代码
- 重新推送

**Review 自动响应**：
- Reviewer 留下评论
- Agent 读取评论
- 根据反馈修改
- 更新 PR

**最终合并**：
- CI 通过 + PR 批准
- 通知你进行合并

## 📊 对比分析

## 📊 对比分析

| 特性 | nanoclaw (独立) | Agent Orchestrator + K8s |
|------|----------------|--------------------------|
| **隔离方式** | Docker 容器 | Kubernetes Pod |
| **多项目** | ❌ 单项目 | ✅ 多项目并行 |
| **Git 管理** | 手动创建分支 | ✅ 自动 worktree |
| **CI 集成** | ❌ 无 | ✅ 自动修复失败 |
| **PR 管理** | 手动处理 review | ✅ 自动响应评论 |
| **资源管理** | 基础限制 | ✅ K8s 配额和限制 |
| **监控** | 日志 | ✅ Dashboard + K8s metrics |
| **扩展性** | 单机 | ✅ 集群级别 |
| **适用场景** | 开发/测试/原型 | 生产/团队/大规模 |

**选择建议**：
- 🧪 **开发/测试** → nanoclaw 独立模式（快速启动）
- 🏢 **生产/团队** → Agent Orchestrator + K8s（完整编排）

## 🔌 频道集成

### 添加频道支持

nanoclaw 使用 skill 系统动态添加频道：

```bash
# 在 claude CLI 中运行
/add-discord   # 添加 Discord 支持
/add-slack     # 添加 Slack 支持
/add-telegram  # 添加 Telegram 支持
```

详见 [apps/nanoclaw/README.md](apps/nanoclaw/README.md)

### 配置示例

```yaml
# Discord
channels:
  discord:
    token: YOUR_DISCORD_BOT_TOKEN
    guildId: YOUR_GUILD_ID

# Slack
channels:
  slack:
    token: YOUR_SLACK_BOT_TOKEN
    signingSecret: YOUR_SIGNING_SECRET

# Telegram
channels:
  telegram:
    token: YOUR_TELEGRAM_BOT_TOKEN
```

## 🛠️ 技术栈

- **编排引擎**: [Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator)
- **Runtime**: Kubernetes (via OrbStack)
- **Agent SDK**: Claude Code / Codex / Aider
- **频道**: Discord / Slack / Telegram
- **语言**: TypeScript / Node.js
- **包管理**: pnpm
- **容器**: Docker / Kubernetes

## 📚 文档

## 📚 文档

### 核心文档
- [RFC 003](docs/RFC/RFC%20003:%20Nanoclaw-Based%20Orchestrator.md) - 架构规范
- [MVP 设计](docs/plans/2026-03-03-nanoclaw-mvp.md) - 实现计划
- [Agent Orchestrator 文档](https://github.com/ComposioHQ/agent-orchestrator) - 上游项目

### 集成指南
- **INTEGRATION.md** - 完整集成指南（在 workspace 根目录）
- **devbox-config.yaml** - 配置示例（在 agent-orchestrator 目录）
- **start-devbox.sh** - 快速启动脚本

### 归档
- [RFC 002](docs/RFC/RFC%20002:%20Devbox%20Control%20Plane.md) - 旧架构（Incus-based，已归档）
- `archive/` - 旧实现代码

## 🔧 故障排查

### Pod 无法启动

```bash
# 查看 pod 状态
kubectl describe pod <pod-name>

# 查看事件
kubectl get events --sort-by=.metadata.creationTimestamp

# 查看日志
kubectl logs <pod-name>
```

### Agent 无响应

```bash
# 查看 agent 日志
ao session logs <session-id>

# 重启 agent
ao session restore <session-id>

# 检查 pod 状态
kubectl get pod <pod-name>
```

### 权限问题

确保 OrbStack 可以访问工作目录：
1. 打开 OrbStack 设置
2. Volumes → 添加路径
3. 添加 workspace 目录

### 网络问题

```bash
# 测试 k8s 连接
kubectl cluster-info

# 测试 pod 网络
kubectl run test --image=busybox --rm -it -- ping google.com
```

## 🚀 下一步

- [ ] 添加 Prometheus 监控
- [ ] 集成 Grafana dashboard
- [ ] 自定义 agent 容器镜像
- [ ] 多集群支持
- [ ] Webhook 通知
- [ ] 日志聚合（ELK/Loki）

## 🤝 贡献

欢迎贡献！请查看：
- [Agent Orchestrator 贡献指南](https://github.com/ComposioHQ/agent-orchestrator/blob/main/CONTRIBUTING.md)
- [Issues](https://github.com/uu-z/devbox-skill/issues)

## 📄 License

MIT

---

**通过 [Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator) + Kubernetes 实现** 🎯


## 🐳 在 Kubernetes 中运行

### 使用 K8s Pod 隔离运行

```bash
# 创建 Pod
kubectl apply -f - <<YAML
apiVersion: v1
kind: Pod
metadata:
  name: devbox-agent
  labels:
    app: devbox-skill
spec:
  containers:
  - name: agent
    image: node:20-alpine
    command: ["/bin/sh", "-c"]
    args:
      - |
        apk add --no-cache git bash
        cd /workspace
        npm install
        npm run dev
    workingDir: /workspace
    volumeMounts:
    - name: workspace
      mountPath: /workspace
  volumes:
  - name: workspace
    hostPath:
      path: /path/to/devbox-skill
      type: Directory
  restartPolicy: Never
YAML

# 查看日志
kubectl logs -f devbox-agent

# 进入 Pod
kubectl exec -it devbox-agent -- /bin/bash
```

### 通过 Agent Orchestrator 编排

```bash
# 使用 Agent Orchestrator + K8s runtime
cd agent-orchestrator
ao spawn devbox "实现新功能"

# 查看 K8s pods
kubectl get pods -l app=agent-orchestrator

# 查看 agent 日志
kubectl logs <pod-name>
```

### 优势

- ✅ **完全隔离** - 每个任务独立 Pod
- ✅ **资源限制** - CPU/内存配额
- ✅ **自动重启** - 失败自动恢复
- ✅ **可扩展** - 支持集群部署

---

**✨ 本节由 AI Agent 在 K8s Pod 中自动添加** (2026-03-05)
