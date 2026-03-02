# Devbox Control Plane

AI coding agent控制平面，完全符合RFC 002规范。

## 快速开始

### 方式 1: Claude Code / OpenClaw Skill (推荐)

```bash
# 安装 skill
ln -s $(pwd)/skills/devbox ~/.claude/skills/devbox

# 使用
/devbox echo hello, date, uname -a
```

详见 [skills/devbox/INSTALL.md](skills/devbox/INSTALL.md)

### 方式 2: 直接使用 CLI

**快速测试**：
```bash
# 运行 E2E 测试（使用预定义示例）
./test-e2e.sh

# 或手动运行示例任务
bun run apps/cli/src/devbox.ts start \
  --task examples/tasks/backtest-ma.md \
  --vm devbox-default \
  --id test-001
```

查看更多示例：[examples/tasks/README.md](examples/tasks/README.md)

#### Linux环境
```bash
# 安装Incus
sudo snap install incus
incus admin init --minimal

# 运行demo
cd apps/cli
./demo.sh
```

### macOS/Windows (使用Colima)
```bash
# 安装Colima (macOS)
brew install colima

# 启动Colima with Incus
colima start --vm-type=vz --vz-rosetta --mount-type=virtiofs

# 在Colima中安装Incus
colima ssh
sudo snap install incus
sudo incus admin init --minimal
exit

# 运行demo
cd apps/cli
./demo.sh
```

## 架构

```
┌──────────────────┐ ┌──────────────────┐ ┌────────────────────┐
│ Orchestrator │ │ Control Plane │ │ Devbox VM │
│ (OpenClaw, │ CLI │ │ incus │ │
│ Claude Code, │ ──────> │ devbox (CLI) │ exec / │ /home/devbox/ │
│ human) │ │ devboxd (daemon) │ file │ runs/<id>/ │
│ │ <────── │ │ ────> │ workspace/ │
│ │ JSON / │ │ │ CONTROL/ │
│ │ notify │ │ <──── │ coding agent │
└──────────────────┘ └──────────────────┘ files └────────────────────┘
```

## RFC 002功能

| 功能 | 状态 |
|------|------|
| Incus VM管理 | ✓ |
| Run生命周期 | ✓ |
| Agent执行器 | ✓ |
| 文件协议 (TASK.md, STATUS.json, EVENTS.log, HANDOFF.md) | ✓ |
| CONTROL/ Steering | ✓ |
| 状态机 (pending, running, needs_attention, completed, failed, stopped) | ✓ |
| Daemon监控 | ✓ |
| Crash detection | ✓ |
| Webhook通知 | ✓ |
| OpenClaw集成 | ✓ |

## 命令

```bash
# VM管理
devbox vm create --id <vm_id> --image <image>
devbox vm destroy <vm_id>

# Run管理
devbox start --task <file> --vm <vm_id> --id <run_id>
devbox status <run_id> --vm <vm_id>
devbox events <run_id> --vm <vm_id> [--follow]
devbox list --vm <vm_id>
devbox stop <run_id> --vm <vm_id>

# Steering
devbox steer <run_id> --vm <vm_id> --cmd <command> [--instruction <file>]

# 调试
devbox snapshot <run_id> --vm <vm_id> [--output <file>]
devbox handoff <run_id> --vm <vm_id>
devbox get <run_id> --vm <vm_id> --output-dir <path>
```

## 为什么使用Incus

1. **RFC 002标准** - 完全符合规范
2. **完整Linux环境** - 系统容器，不是应用容器
3. **更好的隔离** - CPU/内存/网络独立
4. **生产就绪** - 稳定可靠

Incus是唯一支持的后端，提供完整的系统容器能力。

## 文档

- [RFC 002](docs/RFC/RFC%20002:%20Devbox%20Control%20Plane.md) - 完整规范
- [Incus测试指南](docs/TESTING-INCUS.md) - 详细安装和测试
- [快速开始](QUICKSTART.md) - 5分钟上手

## 下一步

1. ~~实现Agent执行逻辑~~ ✅
2. ~~与Orchestrator集成~~ ✅
3. 生产环境部署

## License

MIT
