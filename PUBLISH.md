# 发布和演示指南

## 发布到 npm

### 1. 准备发布

```bash
# 确保所有改动已提交
git add -A
git commit -m "chore: prepare for npm publish"

# 检查 package.json
cat package.json
```

### 2. 发布

```bash
# 登录 npm（首次）
npm login

# 发布
npm publish --access public
```

### 3. 验证发布

```bash
npm view devbox-poc
```

## 演示流程

### 给别人演示前的准备

**让观众安装**：
```bash
npm install -g devbox-poc
```

安装后自动完成：
- ✓ `devbox` 命令全局可用
- ✓ Skill 自动安装到 `~/.claude/skills/devbox`

### Demo 脚本

**1. 介绍**（30秒）
```
这是 devbox - AI 自动写代码跑回测的工具
只需要用自然语言描述策略，AI 就能自动实现、测试、出报告
```

**2. 演示**（2分钟）

在 Claude Code 中：
```
/devbox "BTC价格低于0.3时买入，高于0.5时卖出"
```

展示：
- ✓ 自然语言输入
- ✓ 后台执行（不阻塞）
- ✓ 自动返回结果
- ✓ 智能建议下一步

**3. 查看产物**（1分钟）
```bash
ls ~/.devbox/runs/
cat ~/.devbox/runs/<run_id>/workspace/output/report.md
```

**4. 再来一个**（1分钟）
```
/devbox 测试一个ETH布林带策略
```

展示动态建议的不同。

## 当前状态

- ✓ 命令行工具完成
- ✓ Skill 定义完成
- ✓ Mock runner 完成
- ✓ 自动安装脚本完成
- ⚠ 需要测试 npm 全局安装
- ⚠ 需要测试 skill 自动加载

## 注意事项

1. **首次演示前**：自己先全局安装测试一遍
2. **观众环境**：确保他们有 Claude Code
3. **网络**：npm 安装需要网络
4. **权限**：可能需要 sudo（取决于 npm 配置）
