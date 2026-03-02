#!/bin/bash
# Devbox Quick Demo

set -e

echo "=== Devbox Control Plane Demo ==="
echo ""
echo "默认使用Incus (RFC 002标准)"
echo ""
echo "如果Incus未安装，可以切换到Docker："
echo "  ./switch-backend.sh docker"
echo ""

# 1. 创建VM
echo "1. 创建VM..."
bun run src/devbox.ts vm create --id demo-vm --image images:alpine/3.20
echo ""

# 2. 创建任务
echo "2. 创建并启动任务..."
cat > /tmp/demo-task.json <<'EOF'
{
  "steps": [
    {"type": "bash", "command": "echo 'Hello from Devbox!'"},
    {"type": "bash", "command": "date"},
    {"type": "bash", "command": "uname -a"}
  ]
}
EOF

bun run src/devbox.ts start --task /tmp/demo-task.json --vm demo-vm --id demo-run
echo ""

# 3. 查询状态
echo "3. 查询状态..."
bun run src/devbox.ts status demo-run --vm demo-vm
echo ""

# 3.5. 执行Agent
echo "3.5. 执行Agent..."
bun run src/devbox.ts agent demo-run --vm demo-vm
echo ""

# 4. 列出所有runs
echo "4. 列出所有runs..."
bun run src/devbox.ts list --vm demo-vm
echo ""

# 5. 查看HANDOFF
echo "5. 查看HANDOFF..."
bun run src/devbox.ts handoff demo-run --vm demo-vm
echo ""

# 6. Steering
echo "6. 发送steering命令（演示）..."
echo "  (Agent已完成，steering仅作演示)"
bun run src/devbox.ts steer demo-run --vm demo-vm --cmd "pause"
echo ""

# 7. 清理
echo "7. 清理..."
bun run src/devbox.ts vm destroy demo-vm
echo ""

echo "=== Demo完成 ==="
echo ""
echo "所有RFC 002功能已演示："
echo "✓ VM管理"
echo "✓ Run生命周期"
echo "✓ Agent执行"
echo "✓ 状态查询"
echo "✓ Steering"
echo "✓ 文件协议"
echo "✓ HANDOFF生成"
echo ""
echo "当前使用Incus (RFC 002标准)，完全符合规范"
