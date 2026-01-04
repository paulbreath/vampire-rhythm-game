# Sprite Sheet 帧动画实现方案

## 研究总结

经过对GitHub和技术文章的研究，发现**没有现成的轻量级JavaScript库**适合我们的纯Canvas项目。但找到了两个经典的实现方案，可以直接参考实现。

## 方案一：James Long的Sprite类（2013年经典方案）

### 核心思路
使用一个`Sprite`类封装sprite sheet的动画逻辑，通过`ctx.drawImage`的9参数形式切割sprite sheet。

### 关键代码结构
```javascript
function Sprite(url, pos, size, speed, frames, dir, once) {
    this.pos = pos;           // sprite sheet中的起始位置 [x, y]
    this.size = size;         // 单帧大小 [width, height]
    this.speed = speed;       // 动画速度（帧/秒）
    this.frames = frames;     // 帧序列数组，如 [0, 1, 2, 1]
    this._index = 0;          // 当前帧索引
    this.dir = dir;           // 方向：'horizontal' 或 'vertical'
    this.once = once;         // 是否只播放一次
}

Sprite.prototype.update = function(dt) {
    this._index += this.speed * dt;
}

Sprite.prototype.render = function(ctx) {
    var frame = this.frames[Math.floor(this._index) % this.frames.length];
    var x = this.pos[0];
    var y = this.pos[1];
    
    if(this.dir == 'vertical') {
        y += frame * this.size[1];
    } else {
        x += frame * this.size[0];
    }
    
    ctx.drawImage(resources.get(this.url),
                  x, y, this.size[0], this.size[1],  // 源区域
                  0, 0, this.size[0], this.size[1]); // 目标区域
}
```

### 优点
- 支持基于时间的动画（与帧率无关）
- 支持帧序列自定义（可以做往返动画）
- 支持横向和纵向sprite sheet
- 代码简洁，易于理解

### 缺点
- 需要配合资源加载器使用
- 需要在游戏循环中手动调用update和render

---

## 方案二：Dev.to教程方案（2018年，更简单）

### 核心思路
直接在游戏循环中使用`requestAnimationFrame`和帧计数器控制动画。

### 关键代码结构
```javascript
const cycleLoop = [0, 1, 0, 2];  // 动画帧序列
let currentLoopIndex = 0;
let frameCount = 0;
const framesPerStep = 15;  // 每15帧切换一次

function drawFrame(frameX, frameY, canvasX, canvasY) {
    ctx.drawImage(img,
                  frameX * width, frameY * height, width, height,
                  canvasX, canvasY, scaledWidth, scaledHeight);
}

function step() {
    frameCount++;
    if (frameCount < framesPerStep) {
        window.requestAnimationFrame(step);
        return;
    }
    
    frameCount = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFrame(cycleLoop[currentLoopIndex], 0, 0, 0);
    
    currentLoopIndex++;
    if (currentLoopIndex >= cycleLoop.length) {
        currentLoopIndex = 0;
    }
    
    window.requestAnimationFrame(step);
}
```

### 优点
- 极其简单，代码量少
- 不需要额外的类或库
- 易于理解和修改

### 缺点
- 基于帧计数而非时间，可能在不同设备上速度不一致
- 不够灵活，每个动画需要单独处理

---

## 推荐方案：混合方案

结合两种方案的优点，为我们的游戏设计一个轻量级的`SpriteAnimation`类：

### 设计要点

1. **基于时间的动画**（方案一）
   - 使用`dt`（delta time）确保不同帧率下动画速度一致

2. **简单的API**（方案二）
   - 提供简单的`drawFrame(frameX, frameY)`方法
   - 自动处理帧切换逻辑

3. **支持多种动画状态**
   - idle（待机）
   - attack（攻击）
   - hit（受击）
   - 每种状态有独立的帧序列

4. **集成到现有GameEngine**
   - 在Player接口中添加`currentAnimation`和`animationState`
   - 在update()中更新动画
   - 在render()中绘制当前帧

### ctx.drawImage 9参数详解

```javascript
ctx.drawImage(
    image,           // 源图片
    sx, sy,          // 源图片中的起始坐标
    sWidth, sHeight, // 源图片中要切割的宽高
    dx, dy,          // 画布上的目标坐标
    dWidth, dHeight  // 画布上的目标宽高（可缩放）
)
```

这是实现sprite sheet动画的核心API。

---

## 实现计划

1. 创建`SpriteAnimation`类（参考方案一的结构）
2. 定义主角的动画配置（idle、attack等状态）
3. 修改GameEngine的Player接口
4. 在update()中更新动画状态
5. 在render()中使用SpriteAnimation绘制

---

## 参考资源

- James Long文章：https://archive.jlongster.com/Making-Sprite-based-Games-with-Canvas
- Dev.to教程：https://dev.to/martyhimmel/animating-sprite-sheets-with-javascript-ag3
- MDN drawImage文档：https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

---

## 关于Sprite Sheet资源

当前主角图片是单帧静态图，需要：
1. 使用像素艺术编辑器（如Aseprite、Pixelorama）创建多帧动画
2. 或者使用AI生成工具创建动画帧
3. 或者在网上找免费的sprite sheet资源（如OpenGameArt.org）

推荐格式：横向排列，每帧大小一致（如80x120像素）
- 待机动画：2-4帧
- 攻击动画：3-6帧
- 受击动画：2-3帧
