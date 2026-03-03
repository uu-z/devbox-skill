# Nanoclaw-Based Orchestrator MVP

**日期**: 2026-03-03
**目标**: 基于 RFC 003，fork nanoclaw 实现最小可用编排系统
**范围**: Phase 1-4（本地 E2E 验证）

---

## 设计目标

用 nanoclaw 替代 RFC 002 的自定义控制平面，实现：
- Discord/Slack 多人协作
- Docker 容器隔离
- 线程级会话管理
- 最小改动，最快验证

---

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

**群组模型**：
- Discord 线程 = 1 群组 (`discord:{channel_id}:{thread_id}`)
- Slack 线程 = 1 群组 (`slack:{channel_id}:{thread_ts}`)
- 每个群组独立会话、独立容器、顺序处理

---

## 实现策略

### Fork 方式
- 完整 fork nanoclaw 到 `apps/nanoclaw/`
- 保留所有代码（WhatsApp/skills-engine 等不删除）
- Git 历史完整保留

### 最小改动（3 个文件）

**1. `src/config.ts`**
```typescript
DEFAULT_TIMEOUT: 90 * 60 * 1000  // 90min
IMAGE_NAME: 'devbox-agent'
```

**2. `container/Dockerfile`**
```dockerfile
FROM node:20-slim
# MVP: 只需 bash + curl 验证
RUN apt-get update && apt-get install -y bash curl
COPY agent-runner/ /agent-runner/
WORKDIR /workspace
ENTRYPOINT ["/entrypoint.sh"]
```

**3. `.env.example`**
```bash
DISCORD_TOKEN=your_bot_token
SLACK_TOKEN=your_app_token
ANTHROPIC_API_KEY=your_key
```

---

## 验证流程

### Phase 1: Fork & 构建
```bash
# Fork nanoclaw
git clone https://github.com/qwibitai/nanoclaw apps/nanoclaw
cd apps/nanoclaw

# 安装依赖
npm install

# 构建镜像
docker build -t devbox-agent container/
```

### Phase 2: Discord 测试
```bash
# 配置
cp .env.example .env
# 编辑 .env，填入 DISCORD_TOKEN

# 启动
node src/index.js

# 验证
# 1. Discord 频道 @bot "echo hello"
# 2. 检查容器启动: docker ps
# 3. 检查结果返回线程
```

### Phase 3: Slack 测试
```bash
# 配置 SLACK_TOKEN
# 重复 Discord 测试流程
# 验证线程隔离
```

### Phase 4: 会话持续性
```bash
# 消息 1: @bot "记住：我叫 Alice"
# 消息 2: @bot "我叫什么？"
# 验证: agent 回答 "Alice"
```

---

## 验收标准

| 验收项 | 验证命令 | 预期输出 |
|--------|----------|----------|
| 容器启动 | `docker ps` | 看到 devbox-agent 容器 |
| 命令执行 | Discord @bot "date" | 返回当前时间 |
| 线程隔离 | 两个线程同时 @bot | 各自独立响应 |
| 会话保持 | 连续两条消息 | 第二条记得第一条内容 |

---

## 目录结构

```
devbox-poc/
├── apps/
│   └── nanoclaw/              # nanoclaw fork
│       ├── src/
│       │   ├── channels/
│       │   │   ├── discord.ts
│       │   │   ├── slack.ts
│       │   │   └── whatsapp.ts  # 保留不删
│       │   ├── db.ts
│       │   ├── group-queue.ts
│       │   ├── container-runner.ts
│       │   ├── config.ts        # 微调
│       │   └── index.ts
│       ├── container/
│       │   ├── Dockerfile       # 简化
│       │   ├── entrypoint.sh
│       │   └── agent-runner/
│       ├── groups/              # 运行时
│       └── data/                # SQLite
├── archive/                     # 旧 devbox
│   ├── packages/core/
│   ├── apps/cli/
│   └── skills/devbox/
├── docs/
│   ├── RFC/
│   │   ├── RFC 002 (归档)
│   │   └── RFC 003 (当前)
│   └── plans/
│       └── 2026-03-03-nanoclaw-mvp.md
└── README.md
```

---

## 后续迭代

**Phase 5: Rust 工具链**
- Dockerfile 添加 rustup
- 验证 `cargo new` 项目

**Phase 6: 策略回测**
- 集成 trade-server
- 实现完整回测流程

**Phase 7: GCP 部署**
- VM 配置
- Systemd 服务
- 监控告警

---

## 技术栈

**不造轮子，全部复用**：
- Discord: `discord.js` (nanoclaw 已有)
- Slack: `@slack/bolt` (nanoclaw 已有)
- Docker: `dockerode` (nanoclaw 已有)
- DB: `better-sqlite3` (nanoclaw 已有)
- Claude: `@anthropic-ai/sdk` (nanoclaw 已有)

**工作量**: ~2 小时（fork + 3 文件修改 + 测试）
