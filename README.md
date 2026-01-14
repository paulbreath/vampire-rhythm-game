# 🧛 Blood Rhapsody - 吸血鬼节奏游戏

**Blood Rhapsody（血色狂想曲）**是一款像素风吸血鬼主题的音乐节奏游戏。玩家扮演吸血鬼×狼人混血猎手，通过精准的节奏操作击败飞来的敌人，挑战10大场景30个关卡，最终击败强大的BOSS。

![Game Banner](client/public/images/characters/castlevania-hero.png)

---

## 🎮 游戏特色

### 核心玩法
- **音乐节奏战斗**：跟随音乐节奏，精准打击飞来的敌人
- **4轨道系统**：敌人从4条轨道飞来，需要快速反应和准确判断
- **判定系统**：Perfect、Great、Good、Miss四种判定，影响得分和连击
- **连击系统**：连续击中敌人累积连击数，触发特殊视觉效果和高分加成

### 游戏内容
- **10大场景**：废弃教堂、钟楼、地下墓穴、墓地、古墓、诅咒森林、城堡大厅、图书馆、刑讯室、王座厅
- **30个关卡**：每个场景3个关卡（2个小怪关+1个BOSS关）
- **10位BOSS**：每个场景都有独特的BOSS，拥有专属动画和战斗模式
- **20+种敌人**：包括堕落信徒、邪恶修女、吸血鬼蝙蝠、骷髅战士、木乃伊、诅咒狼人、精英吸血鬼等
- **3种难度**：Normal（1.0x）、Hard（1.3x）、Insane（1.6x），速度和密度递增

### 游戏系统
- **装备系统**：20件装备，提供攻击力、生命值、连击加成等属性
- **经验系统**：击败敌人获得经验，升级解锁新能力（最高30级）
- **能力解锁**：10种特殊能力（双重攻击、范围攻击、生命恢复等）
- **排行榜**：每个关卡独立排行榜，记录最高分和最高连击
- **成就系统**：7种成就定义，记录游戏里程碑

---

## 🎵 音乐系统

游戏包含10首原创哥特风格BGM，每首歌曲都有AI生成的节奏谱面：

| 场景 | 音乐 | 时长 | BPM | 风格 |
|------|------|------|-----|------|
| 废弃教堂 | Nocturnal Hunger | 2:37 | 140 | 黑暗管风琴 |
| 钟楼 | Crimson Chase | 3:15 | 150 | 急促追逐 |
| 地下墓穴 | Crimson Crypt Pursuit | 3:45 | 135 | 阴森恐怖 |
| 墓地 | Electric Shadows Whispering Doom | 4:00 | 125 | 电子哥特 |
| 古墓 | Crimson Cathedral Waltz | 3:30 | 120 | 华尔兹舞曲 |
| 诅咒森林 | Vampire Vortices | 3:50 | 140 | 旋涡迷幻 |
| 城堡大厅 | Eternal Bloodlust | 4:27 | 140 | 史诗交响 |
| 图书馆 | Crimson Spires | 3:20 | 130 | 神秘诡异 |
| 刑讯室 | Crimson Chapel Frenzy | 3:40 | 160 | 狂乱节奏 |
| 王座厅 | Crimson Castle Pursuit | 4:10 | 145 | 最终决战 |

### 谱面系统
- **AI生成谱面**：使用Python脚本分析音频文件，自动生成节奏谱面
- **多轨道支持**：4条轨道随机分配音符，增加游戏难度
- **节奏同步**：音符生成严格同步音乐节拍，提供流畅的游戏体验

---

## 🎨 美术风格

### 视觉设计
- **像素风哥特美术**：暗黑哥特风格的像素艺术，营造神秘恐怖氛围
- **30张场景背景**：每个关卡都有独特的高质量背景图
- **序列帧动画**：所有角色都使用序列帧动画（idle、attack、hurt、death）
- **粒子特效**：击中敌人时的粒子爆炸、连击特效、屏幕震动等

### 角色设计
- **主角**：吸血鬼×狼人混血猎手，银发、黑色长袍、细剑、恶魔翅膀
- **BOSS**：10位独特BOSS，包括蝙蝠王、墓穴守护者、墓地领主、狼人首领、古代图书管理员、魅魔女王、吸血鬼伯爵等
- **小怪**：20+种敌人类型，每个场景都有专属怪物组合

---

## 🛠️ 技术栈

### 前端框架
- **React 19.2.1** + **TypeScript 5.6.3**：现代化的前端开发框架
- **Vite 7.1.7**：快速的构建工具和开发服务器
- **Wouter 3.3.5**：轻量级路由库

### UI组件
- **Radix UI**：无障碍的UI组件库（Dialog、Dropdown、Tabs等）
- **Tailwind CSS 4.1.14**：实用优先的CSS框架
- **Framer Motion 12.23.22**：流畅的动画库
- **Lucide React**：精美的图标库

### 游戏引擎
- **HTML5 Canvas**：纯Canvas API渲染，无第三方游戏框架
- **Web Audio API**：音频播放和音效生成
- **自定义动画系统**：AnimationPlayer + AnimationManager管理序列帧动画
- **自定义粒子系统**：particleEffects.ts实现粒子特效

### 数据管理
- **LocalStorage**：游戏进度、装备、经验、排行榜持久化
- **React Hooks**：状态管理和副作用处理
- **Zod 4.1.12**：数据验证和类型安全

### 移动端支持
- **Capacitor 8.0.0**：跨平台移动应用框架
- **Android/iOS支持**：可打包为原生移动应用

---

## 📁 项目结构

```
vampire-rhythm-game/
├── client/                          # 前端代码
│   ├── public/                      # 静态资源
│   │   ├── animations/              # 序列帧动画（772个文件，218MB）
│   │   ├── assets/backgrounds/      # 背景图（30张）
│   │   ├── audio/                   # 音乐文件（10首BGM）
│   │   ├── charts/                  # 节奏谱面（JSON格式）
│   │   └── images/                  # 图片资源
│   ├── src/
│   │   ├── components/              # React组件
│   │   │   ├── ui/                  # UI组件（Button、Dialog等）
│   │   │   ├── Equipment.tsx        # 装备界面
│   │   │   ├── Leaderboard.tsx      # 排行榜
│   │   │   └── MapSelection.tsx     # 地图选择
│   │   ├── data/                    # 游戏数据配置
│   │   │   ├── bossTypes.ts         # 10个BOSS配置
│   │   │   ├── enemyTypes.ts        # 20+种敌人配置
│   │   │   ├── equipmentData.ts     # 20件装备数据
│   │   │   ├── newMapSystem.ts      # 30关卡地图系统
│   │   │   ├── songs.ts             # 10首音乐配置
│   │   │   └── sizeConfig.ts        # 角色尺寸配置
│   │   ├── lib/                     # 核心游戏逻辑
│   │   │   ├── gameEngine.ts        # 主游戏引擎（101KB）
│   │   │   ├── rhythmBossSystem.ts  # 节奏BOSS系统（33KB）
│   │   │   ├── AnimationPlayer.ts   # 动画播放器
│   │   │   ├── AnimationManager.ts  # 动画管理器
│   │   │   ├── audioManager.ts      # 音频管理
│   │   │   ├── chartLoader.ts       # 谱面加载器
│   │   │   ├── experienceManager.ts # 经验系统
│   │   │   ├── newEquipmentManager.ts # 装备管理
│   │   │   ├── particleEffects.ts   # 粒子特效
│   │   │   ├── progressManager.ts   # 进度管理
│   │   │   └── soundEffects.ts      # 音效系统
│   │   ├── pages/                   # 页面组件
│   │   │   ├── Game.tsx             # 游戏主页面
│   │   │   ├── Home.tsx             # 主菜单
│   │   │   └── MapPage.tsx          # 地图选择页面
│   │   └── App.tsx                  # 应用入口
│   └── index.html                   # HTML入口
├── drizzle/                         # 数据库迁移（未使用）
├── patches/                         # 依赖补丁
├── docs/                            # 开发文档（40+个MD文件）
│   ├── BOSS_SYSTEM.md               # BOSS系统设计
│   ├── MAP_SYSTEM_SUMMARY.md        # 地图系统总结
│   ├── EQUIPMENT_SYSTEM_DESIGN.md   # 装备系统设计
│   └── ...
├── generate_rhythm_charts.py        # 谱面生成脚本
├── optimize_sprites.py              # 动画压缩脚本
├── package.json                     # 依赖配置
├── tsconfig.json                    # TypeScript配置
├── vite.config.ts                   # Vite配置
├── capacitor.config.ts              # Capacitor配置
└── README.md                        # 项目文档
```

---

## 🚀 快速开始

### 环境要求
- **Node.js**: 22.13.0+
- **pnpm**: 9.0.0+

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm run dev
```

访问 `http://localhost:3000` 开始游戏。

### 构建生产版本

```bash
pnpm run build
```

构建产物在 `dist/` 目录。

### 预览生产版本

```bash
pnpm run preview
```

### 移动端打包

```bash
# Android
pnpm run android

# iOS
pnpm run ios
```

---

## 🎯 游戏玩法指南

### 基础操作
1. **移动**：鼠标/手指移动控制主角位置
2. **攻击**：主角自动攻击判定线上的敌人
3. **判定**：敌人到达判定线时自动判定（Perfect/Great/Good/Miss）
4. **连击**：连续击中敌人累积连击数，获得更高分数

### 游戏机制
- **生命值系统**：初始3颗心，Miss或击中炸弹扣1颗心，生命值归零游戏结束
- **心形道具**：连击5x时有20%概率掉落，拾取回复1颗心
- **炸弹蝙蝠**：红色炸弹蝙蝠，击中会扣血，需要小心躲避
- **BOSS战**：BOSS关只有BOSS和炸弹蝙蝠，击败BOSS即可通关
- **通关条件**：音乐结束时玩家仍存活（生命值>0）

### 进阶技巧
- **连击加成**：连击越高，得分越高（连击5x、10x、15x、20x有特殊奖励）
- **装备搭配**：合理搭配装备，提升攻击力和生命值
- **能力解锁**：升级解锁新能力，增强战斗力
- **难度挑战**：完成Normal解锁Hard，完成Hard解锁Insane

---

## 📊 游戏系统详解

### 1. 关卡系统（newMapSystem.ts）
- **30个关卡**：10个场景 × 3个关卡
- **顺序解锁**：完成前一关才能解锁下一关
- **难度选择**：每个关卡都有3种难度（Normal/Hard/Insane）
- **进度保存**：关卡进度、最高分、解锁状态自动保存

### 2. BOSS系统（bossTypes.ts）
- **10位BOSS**：每个场景的第3关是BOSS关
- **BOSS属性**：生命值、攻击力、移动速度、尺寸等
- **BOSS动画**：idle、attack、hurt、death四种状态
- **BOSS战机制**：BOSS在游戏开始时立即生成，炸弹蝙蝠随节奏出现

### 3. 敌人系统（enemyTypes.ts）
- **20+种敌人**：每个场景都有2种专属敌人
- **移动模式**：直线、波浪、正弦波、冲刺、俯冲等5种模式
- **敌人配置**：生命值、分数、速度、尺寸、动画等
- **敌人数量限制**：Normal≤300，Hard≤400，Insane≤500

### 4. 装备系统（equipmentData.ts）
- **20件装备**：武器、防具、饰品三大类
- **装备属性**：攻击力、生命值、连击加成、暴击率等
- **装备管理**：装备/卸载、过滤、排序
- **装备效果**：实时应用到游戏玩法

### 5. 经验系统（experienceManager.ts）
- **经验获取**：击败敌人、完成关卡获得经验
- **等级系统**：每100 EXP升1级，最高30级
- **能力解锁**：Lv2-30共10个能力（双重攻击、范围攻击等）
- **升级提示**：升级时显示UI提示

### 6. 排行榜系统（leaderboardManager.ts）
- **独立排行榜**：每个关卡每个难度都有独立排行榜
- **记录数据**：最高分、最高连击、通关时间、日期
- **本地存储**：使用LocalStorage持久化

### 7. 动画系统（AnimationPlayer.ts + AnimationManager.ts）
- **序列帧动画**：所有角色使用序列帧动画
- **动画状态**：idle、attack、hurt、death
- **动画管理**：预加载、缓存、播放控制
- **性能优化**：动画文件压缩（54%压缩率）

### 8. 音频系统（audioManager.ts + soundEffects.ts）
- **BGM播放**：支持循环播放、音量控制、暂停/恢复
- **音效生成**：使用Web Audio API程序生成音效
- **音乐同步**：谱面严格同步音乐节拍

---

## 🔧 开发工具

### 谱面生成脚本（generate_rhythm_charts.py）

自动分析音频文件，生成节奏谱面：

```bash
python3 generate_rhythm_charts.py
```

**功能**：
- 分析音频文件的节拍和强度
- 生成JSON格式的谱面数据
- 支持4轨道随机分配
- 自动计算音符时间戳

### 动画压缩脚本（optimize_sprites.py）

批量压缩动画文件，优化游戏性能：

```bash
python3 optimize_sprites.py
```

**效果**：
- 压缩率：54%（474MB → 218MB）
- 成功率：90.6%（772个文件）
- 质量保证：无明显质量损失

---

## 📚 参考资料

### 开源项目参考

本项目在开发过程中参考了以下开源项目：

1. **[Proton](https://github.com/drawcall/Proton)** - 粒子特效系统
   - 轻量级JavaScript粒子引擎
   - 提供了粒子系统的设计思路

2. **[osu!lazer](https://github.com/ppy/osu)** - 音乐游戏框架
   - 节奏游戏的判定系统设计
   - 谱面加载和音乐同步机制

3. **[Phaser](https://github.com/photonstorm/phaser)** - 游戏框架
   - Canvas渲染优化技巧
   - 动画系统架构参考

4. **[PixiJS](https://github.com/pixijs/pixijs)** - 2D渲染引擎
   - 高性能Canvas渲染方案
   - 精灵动画管理思路

### 技术文档

- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [React 19 Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

## 📝 开发历史

### v7.0 (2026-01-13) - 节奏BOSS模式
- ✅ 实现节奏BOSS系统（4轨道、判定系统、连击系统）
- ✅ 移除装饰性UI，保留核心节奏游戏玩法

### v6.0 (2026-01-12) - 装备系统
- ✅ 实现装备系统（20件装备）
- ✅ 装备管理器和存储系统
- ✅ 装备效果集成到游戏玩法

### v5.0 (2026-01-12) - 地图系统
- ✅ 10场景30关卡地图系统
- ✅ 30张场景背景图
- ✅ 关卡解锁和进度管理

### v4.0 (2026-01-11) - 动画系统
- ✅ 序列帧动画系统（AnimationPlayer + AnimationManager）
- ✅ 40个BOSS动画 + 22个小怪动画
- ✅ 动画文件压缩优化（54%压缩率）

### v3.0 (2026-01-05) - 难度系统
- ✅ 三种难度（Normal/Hard/Insane）
- ✅ 三场景（教堂/墓地/城堡）
- ✅ Avatar系统（等级、成就、统计）

### v2.0 (2026-01-04) - BOSS系统
- ✅ 10位BOSS + BOSS战系统
- ✅ 通关系统
- ✅ 恶魔城风格主角

### v1.0 (2026-01-03) - 核心玩法
- ✅ 音乐节奏战斗系统
- ✅ 得分系统和连击系统
- ✅ 音频系统集成

---

## 🔮 未来计划

### 高优先级
- [ ] 降低游戏难度（增加grace period、扩大碰撞判定）
- [ ] 实现经验值和成就解锁系统
- [ ] 优化新手引导（手势教程、鼓励提示）
- [ ] 应用能力效果到游戏玩法（双重攻击、范围攻击等）

### 中优先级
- [ ] 使用专业音效文件替代程序生成音效
- [ ] 添加环境音效（蝙蝠叫声、风声）
- [ ] 优化地图解锁逻辑和动画效果
- [ ] 添加在线排行榜

### 低优先级
- [ ] 动态难度调整
- [ ] 在线功能（好友、分享）
- [ ] 添加更多歌曲（目标10-15首）
- [ ] 音频可视化（频谱条）

---

## 🐛 已知问题

### 待修复
- [ ] TypeScript类型错误（26个错误）
  - `input-otp.tsx`: Property 'slots' does not exist
  - `resizable.tsx`: Cannot find module 'react-resizable-panels'
  - `const.ts`: Cannot find module '@shared/const'
  - `gameEngine.ts`: Property 'maxHealth' does not exist

### 待优化
- [ ] 动画加载性能优化
- [ ] 音频解码错误处理
- [ ] 移动端触摸优化

---

## 📄 许可证

MIT License

Copyright (c) 2026 paulbreath

---

## 👨‍💻 作者

**paulbreath**

---

## 🙏 致谢

- **音乐**：AI生成的哥特风格BGM
- **美术**：AI生成的像素风哥特美术
- **动画**：序列帧动画系统
- **灵感来源**：恶魔城系列、osu!、音乐游戏

---

## 📞 联系方式

- **GitHub**: [paulbreath/vampire-rhythm-game](https://github.com/paulbreath/vampire-rhythm-game)
- **问题反馈**: [GitHub Issues](https://github.com/paulbreath/vampire-rhythm-game/issues)

---

**享受狩猎吧！🦇**

*"In the rhythm of blood, we find our symphony."*
