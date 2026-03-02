# Devbox Control Plane Demo

## 快速演示

```bash
cd apps/cli
./demo.sh
```

## Demo成功！

所有RFC 002功能已验证：
- ✓ VM管理 (Docker)
- ✓ Run生命周期
- ✓ 状态查询
- ✓ Steering
- ✓ 文件协议

## 切换到Incus

修改 `packages/core/src/index.ts`:
```typescript
export { IncusProvisioner as Provisioner } from './incus/provisioner';
```

## 下一步

1. Agent实现
2. 完整测试
3. 生产部署

