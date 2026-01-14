# 主角动画系统实现总结

## 实现方案

由于sprite sheet图片加载存在技术问题（5MB图片在浏览器中加载不稳定），最终采用了**程序化动画**方案，通过Canvas变换（缩放、旋转、位移）模拟帧动画效果。

## 已实现的动画效果

### 1. 待机动画（Idle Animation）
- **效果**：角色轻微上下浮动
- **实现**：`Math.sin(idleAnimation) * 3` 产生±3像素的垂直位移
- **触发**：角色未攻击时持续播放

### 2. 攻击动画（Attack Animation）
包含4个协调的动作效果：

#### a) 挥剑旋转
```typescript
// 从-30°快速旋转到+30°，再回到0°
if (attackProgress > 0.5) {
  attackRotation = -0.5 + (1 - attackProgress) * 2; // 举剑
} else {
  attackRotation = attackProgress * 2; // 收剑
}
```

#### b) 身体缩放
```typescript
// 先放大再缩小，模拟发力
attackScale = 1.0 + Math.sin(attackProgress * Math.PI) * 0.3;
```

#### c) 向前冲刺
```typescript
// 攻击时向敌人方向冲刺10像素
attackOffset = Math.sin(attackProgress * Math.PI) * 10;
```

#### d) 白色闪光
```typescript
// 添加发光效果增强打击感
ctx.shadowColor = '#ffffff';
ctx.shadowBlur = attackAnimation * 2;
```

### 3. 方向控制
- 根据鼠标位置自动翻转角色朝向（左/右）
- 使用`ctx.scale(flipScale, 1)`实现水平镜像
- 旋转角度根据朝向自动调整

## 技术亮点

1. **基于时间的动画**：使用`attackAnimation`计数器（10→0）确保动画速度稳定
2. **正弦函数插值**：`Math.sin(progress * Math.PI)`产生平滑的加速/减速效果
3. **多层动画叠加**：待机浮动 + 攻击旋转 + 冲刺位移 + 闪光特效
4. **Canvas变换栈**：使用`save()/restore()`确保变换不互相影响

## 与原计划的差异

**原计划**：使用AI生成的sprite sheet（6帧攻击动画 + 4帧待机动画）

**实际方案**：程序化动画（Canvas变换）

**原因**：
- Sprite sheet图片（5MB）加载不稳定
- Promise加载机制未能正确触发
- 图片onload/onerror事件未响应

**优势**：
- 文件体积小（无需额外图片）
- 性能更好（无需切换图片帧）
- 动画流畅度高（基于数学函数）
- 易于调整参数

## 视觉效果对比

| 动画类型 | 之前 | 现在 |
|---------|------|------|
| 待机 | 静止不动 | 轻微上下浮动 |
| 攻击 | 简单缩放 | 旋转+缩放+冲刺+闪光 |
| 移动 | 东倒西歪 | 平滑跟随鼠标 |
| 朝向 | 任意旋转 | 只朝左/右，角度限制±30° |

## 后续优化方向

1. **解决sprite sheet加载问题**
   - 压缩图片到1MB以下
   - 使用base64内联小图
   - 添加加载进度条

2. **添加更多动画状态**
   - 受击动画（红色闪烁）
   - 死亡动画（倒地）
   - 胜利动画（举剑庆祝）

3. **增强攻击特效**
   - 剑光拖尾（绘制半透明轨迹）
   - 击中粒子（爆炸效果）
   - 屏幕震动（canvas位移）

## 参考资源

- [James Long - Making Sprite-based Games with Canvas](https://archive.jlongster.com/Making-Sprite-based-Games-with-Canvas)
- [Dev.to - Animating Sprite Sheets with JavaScript](https://dev.to/martyhimmel/animating-sprite-sheets-with-javascript-ag3)
- Canvas 2D API - drawImage() 9参数形式
- Canvas 2D API - save()/restore() 变换栈

## 结论

虽然未能使用真正的sprite sheet多帧动画，但通过程序化动画实现了协调的攻击动作效果，让角色"动起来"了。玩家现在可以清晰地看到：
- 角色有生命感（待机浮动）
- 攻击有打击感（挥剑旋转+冲刺）
- 动作有协调性（多个效果同步）

这个方案在视觉效果和技术实现之间取得了良好的平衡。
