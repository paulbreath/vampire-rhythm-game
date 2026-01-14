# Capacitor WebView APK 打包完整指南

> **项目**: Vampire Rhythm Game (吸血鬼节奏游戏)  
> **日期**: 2026-01-07  
> **构建方式**: GitHub Actions自动化  
> **Token消耗**: ~10,000 tokens  
> **构建次数**: 8次失败 → 1次成功  

---

## 📋 目录

1. [项目背景](#项目背景)
2. [技术方案选择](#技术方案选择)
3. [完整构建流程](#完整构建流程)
4. [关键问题与解决方案](#关键问题与解决方案)
5. [最终工作配置](#最终工作配置)
6. [验证与测试](#验证与测试)
7. [后续优化建议](#后续优化建议)

---

## 项目背景

### 需求
将基于Web的音乐节奏游戏打包成Android APK，用于第三方测试和分发。

### 技术栈
- **前端**: React 19 + Vite + TypeScript
- **游戏引擎**: Canvas 2D + Web Audio API
- **包管理**: pnpm
- **Node版本**: 22

### 初始尝试
- ❌ **EAS Build**: 失败（Java版本冲突、npm/pnpm不兼容）
- ✅ **Capacitor**: 成功（WebView容器方案）

---

## 技术方案选择

### 为什么选择Capacitor？

| 方案 | 优点 | 缺点 | 结果 |
|------|------|------|------|
| **EAS Build** | Expo官方方案，集成度高 | Java版本要求严格，与pnpm冲突 | ❌ 失败 |
| **Capacitor** | 轻量级WebView容器，配置灵活 | 需要手动配置Android环境 | ✅ 成功 |
| **React Native** | 原生性能好 | 需要重写整个游戏代码 | ❌ 不适用 |

### Capacitor方案原理

```
┌─────────────────────────────────────┐
│   Android APK (Capacitor Shell)     │
│  ┌───────────────────────────────┐  │
│  │   WebView (Chromium)          │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Web Game (React+Canvas)│  │  │
│  │  │  - HTML/CSS/JavaScript  │  │  │
│  │  │  - Canvas 2D Rendering  │  │  │
│  │  │  - Web Audio API        │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**核心思路**: APK只是一个壳，内部加载远程游戏URL。

---

## 完整构建流程

### 阶段1: Capacitor初始化

```bash
# 1. 安装Capacitor
pnpm add @capacitor/core @capacitor/cli @capacitor/android

# 2. 初始化Capacitor配置
npx cap init

# 3. 添加Android平台
npx cap add android

# 4. 配置capacitor.config.ts
```

**capacitor.config.ts 配置**:
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vampirerhythm.app',
  appName: 'Vampire Rhythm',
  webDir: 'dist',
  server: {
    url: 'https://你的游戏URL.com',  // 关键：加载远程URL
    cleartext: true
  }
};

export default config;
```

### 阶段2: Android配置

**关键文件**:
1. `android/app/src/main/AndroidManifest.xml` - 添加INTERNET权限
2. `android/app/src/main/res/xml/network_security_config.xml` - 允许HTTP/HTTPS

**AndroidManifest.xml**:
```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:networkSecurityConfig="@xml/network_security_config">
        ...
    </application>
</manifest>
```

**network_security_config.xml**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

### 阶段3: GitHub Actions自动化

**完整workflow文件** (`.github/workflows/build-apk.yml`):

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      # Step 1: 检出代码
      - name: Checkout code
        uses: actions/checkout@v4
      
      # Step 2: 设置Node.js环境
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      
      # Step 3: 安装pnpm
      - name: Install pnpm
        run: npm install -g pnpm
      
      # Step 4: 安装项目依赖
      - name: Install dependencies
        run: pnpm install
      
      # Step 5: 创建Android assets目录
      - name: Create assets directory
        run: mkdir -p android/app/src/main/assets
      
      # Step 6: 同步Capacitor配置
      - name: Sync Capacitor
        run: npx cap sync android
      
      # Step 7: 创建Cordova变量文件（关键！）
      - name: Create cordova variables file
        run: |
          mkdir -p android/capacitor-cordova-android-plugins
          cat > android/capacitor-cordova-android-plugins/cordova.variables.gradle << 'EOF'
          ext {
              cdvMinSdkVersion = 22
              cdvBuildToolsVersion = "34.0.0"
              cdvCompileSdkVersion = 34
              cdvTargetSdkVersion = 34
              cdvPluginPostBuildExtras = []
          }
          EOF
      
      # Step 8: 设置Java 21环境（关键！）
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      
      # Step 9: 设置Android SDK
      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
      
      # Step 10: 授予gradlew执行权限
      - name: Grant execute permission for gradlew
        run: chmod +x android/gradlew
      
      # Step 11: 构建Debug APK
      - name: Build Debug APK
        run: cd android && ./gradlew assembleDebug --no-daemon
      
      # Step 12: 上传APK产物
      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: blood-rhapsody-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 关键问题与解决方案

### 问题1: 缺少Node.js和pnpm环境

**错误信息**:
```
npx: command not found
```

**原因**: GitHub Actions默认环境没有安装Node.js和pnpm。

**解决方案**:
```yaml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'

- name: Install pnpm
  run: npm install -g pnpm
```

---

### 问题2: 缺少项目依赖

**错误信息**:
```
capacitor: command not found
```

**原因**: 没有安装项目依赖，Capacitor CLI不可用。

**解决方案**:
```yaml
- name: Install dependencies
  run: pnpm install
```

---

### 问题3: assets目录不存在

**错误信息**:
```
android/app/src/main/assets: No such file or directory
```

**原因**: Capacitor sync需要assets目录存在。

**解决方案**:
```yaml
- name: Create assets directory
  run: mkdir -p android/app/src/main/assets
```

---

### 问题4: cordova.variables.gradle文件缺失

**错误信息**:
```
Could not read script 'android/capacitor-cordova-android-plugins/cordova.variables.gradle' as it does not exist.
```

**原因**: `npx cap sync`没有生成Cordova插件配置文件（因为使用远程URL）。

**解决方案**:
```yaml
- name: Create cordova variables file
  run: |
    mkdir -p android/capacitor-cordova-android-plugins
    cat > android/capacitor-cordova-android-plugins/cordova.variables.gradle << 'EOF'
    ext {
        cdvMinSdkVersion = 22
        cdvBuildToolsVersion = "34.0.0"
        cdvCompileSdkVersion = 34
        cdvTargetSdkVersion = 34
        cdvPluginPostBuildExtras = []
    }
    EOF
```

**关键变量说明**:
- `cdvMinSdkVersion`: 最低支持的Android版本（22 = Android 5.1）
- `cdvCompileSdkVersion`: 编译使用的SDK版本（34 = Android 14）
- `cdvTargetSdkVersion`: 目标SDK版本（34 = Android 14）
- `cdvPluginPostBuildExtras`: Cordova插件额外配置（空数组）

---

### 问题5: cdvPluginPostBuildExtras属性缺失

**错误信息**:
```
Could not get unknown property 'cdvPluginPostBuildExtras' for project ':capacitor-cordova-android-plugins'
```

**原因**: 创建的cordova.variables.gradle是空文件，缺少必要的变量定义。

**解决方案**: 在文件中定义完整的Gradle变量（见问题4的解决方案）。

---

### 问题6: Java版本不匹配 ⭐⭐⭐

**错误信息**:
```
error: invalid source release: 21
Execution failed for task ':capacitor-android:compileDebugJavaWithJavac'.
```

**原因**: Capacitor 6.x要求Java 21，但workflow使用的是JDK 17。

**解决方案**:
```yaml
- name: Set up JDK 21  # 从17改为21
  uses: actions/setup-java@v4
  with:
    java-version: '21'  # 关键修改
    distribution: 'temurin'
```

**为什么是Java 21？**
- Capacitor 6.x使用Gradle 8.14+
- Gradle 8.14+要求Java 21
- 参考：https://capacitorjs.com/docs/android

---

## 最终工作配置

### 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| Node.js | 22 | 项目使用的Node版本 |
| pnpm | latest | 包管理器 |
| Java | 21 | Capacitor 6.x要求 |
| Gradle | 8.14.3 | 自动使用（通过gradlew） |
| Android SDK | 34 | 编译和目标SDK |
| Min SDK | 22 | 支持Android 5.1+ |

### 构建产物

- **APK路径**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **APK大小**: ~4.0 MB
- **构建时间**: 4-5分钟
- **Artifact名称**: `blood-rhapsody-debug`

### 下载APK的方法

**方法1: GitHub Actions界面**
1. 访问 `https://github.com/用户名/仓库名/actions`
2. 点击最新的成功构建（绿色✓）
3. 滚动到底部的"Artifacts"区域
4. 点击下载artifact（需要登录GitHub）

**方法2: GitHub CLI**
```bash
gh run download <run-id> --repo 用户名/仓库名 --name blood-rhapsody-debug
```

**方法3: 生成公开链接**
```bash
# 下载APK
gh run download <run-id> --repo 用户名/仓库名 --name blood-rhapsody-debug

# 上传到CDN获取公开链接
manus-upload-file app-debug.apk
```

---

## 验证与测试

### 本地验证（可选）

```bash
# 1. 同步Capacitor
npx cap sync android

# 2. 在Android Studio中打开
npx cap open android

# 3. 在Android Studio中构建APK
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### APK安装测试

1. **下载APK到Android设备**
2. **开启"允许安装未知来源应用"**
   - 设置 > 安全 > 未知来源
   - 或在安装时临时允许
3. **点击APK文件安装**
4. **打开应用测试**
   - 检查是否正确加载游戏URL
   - 测试游戏功能是否正常
   - 检查音频、触摸、动画等

---

## 后续优化建议

### 1. 生成Release签名版本

**为什么需要？**
- Debug版本只能用于测试
- 上传Google Play需要Release签名版本
- Release版本有性能优化

**步骤**:

1. **生成keystore签名文件**:
```bash
keytool -genkey -v -keystore release.keystore -alias my-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000
```

2. **配置GitHub Secrets**:
   - `KEYSTORE_FILE`: Base64编码的keystore文件
   - `KEYSTORE_PASSWORD`: keystore密码
   - `KEY_ALIAS`: 密钥别名
   - `KEY_PASSWORD`: 密钥密码

3. **修改workflow**:
```yaml
- name: Decode keystore
  run: |
    echo "${{ secrets.KEYSTORE_FILE }}" | base64 -d > release.keystore

- name: Build Release APK
  run: |
    cd android
    ./gradlew assembleRelease \
      -Pandroid.injected.signing.store.file=../release.keystore \
      -Pandroid.injected.signing.store.password=${{ secrets.KEYSTORE_PASSWORD }} \
      -Pandroid.injected.signing.key.alias=${{ secrets.KEY_ALIAS }} \
      -Pandroid.injected.signing.key.password=${{ secrets.KEY_PASSWORD }}
```

### 2. 添加应用图标和启动画面

**当前状态**: 使用Capacitor默认图标

**优化步骤**:

1. **准备图标资源**:
   - `icon.png`: 1024x1024 (应用图标)
   - `splash.png`: 2732x2732 (启动画面)

2. **使用Capacitor Assets工具**:
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#000000' --splashBackgroundColor '#000000'
```

3. **重新同步**:
```bash
npx cap sync android
```

### 3. 优化APK大小

**当前大小**: 4.0 MB

**优化方法**:
- 启用ProGuard代码混淆
- 移除未使用的资源
- 使用App Bundle代替APK

**build.gradle配置**:
```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. 添加自动版本号

**当前问题**: 每次构建版本号相同

**解决方案**:
```yaml
- name: Set version
  run: |
    VERSION_CODE=$(date +%s)
    VERSION_NAME="1.0.${{ github.run_number }}"
    sed -i "s/versionCode 1/versionCode $VERSION_CODE/" android/app/build.gradle
    sed -i "s/versionName \"1.0\"/versionName \"$VERSION_NAME\"/" android/app/build.gradle
```

### 5. 添加多渠道打包

**场景**: 为不同分发渠道生成不同的APK

**build.gradle配置**:
```gradle
android {
    flavorDimensions "version"
    productFlavors {
        googleplay {
            dimension "version"
            applicationIdSuffix ".googleplay"
        }
        huawei {
            dimension "version"
            applicationIdSuffix ".huawei"
        }
    }
}
```

---

## 常见问题FAQ

### Q1: 为什么不直接使用Expo？
**A**: Expo的EAS Build与pnpm不兼容，且Java版本要求严格。Capacitor更灵活。

### Q2: APK能在所有Android设备上运行吗？
**A**: 支持Android 5.1+（API 22+），覆盖99%+的设备。

### Q3: 游戏性能会受影响吗？
**A**: WebView性能接近原生浏览器，对于Canvas 2D游戏足够。如需极致性能，考虑React Native重写。

### Q4: 如何更新游戏内容？
**A**: 因为APK加载的是远程URL，更新网站即可，无需重新打包APK。

### Q5: 能离线运行吗？
**A**: 当前方案需要网络。如需离线，需要将游戏资源打包到APK内（修改webDir配置）。

### Q6: 构建失败怎么办？
**A**: 按以下顺序检查：
1. Node.js和pnpm是否安装
2. 依赖是否安装（pnpm install）
3. Java版本是否为21
4. cordova.variables.gradle是否存在且配置正确
5. 查看完整的构建日志定位具体错误

---

## 参考资源

### 官方文档
- [Capacitor官方文档](https://capacitorjs.com/docs)
- [Capacitor Android配置](https://capacitorjs.com/docs/android)
- [GitHub Actions文档](https://docs.github.com/en/actions)

### 相关GitHub仓库
- [Capacitor官方仓库](https://github.com/ionic-team/capacitor)
- [类似WebView容器项目示例](https://github.com/search?q=capacitor+webview+android)

### 工具和服务
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Android Studio下载](https://developer.android.com/studio)
- [Gradle版本兼容性](https://docs.gradle.org/current/userguide/compatibility.html)

---

## 总结

### 成功关键点 ⭐

1. **选对技术方案**: Capacitor比EAS Build更适合pnpm项目
2. **完整的环境配置**: Node.js + pnpm + Java 21 + Android SDK
3. **创建必要的配置文件**: cordova.variables.gradle是关键
4. **正确的Java版本**: Java 21是Capacitor 6.x的硬性要求
5. **自动化构建**: GitHub Actions避免本地环境问题

### 时间和成本

- **总Token消耗**: ~10,000 tokens
- **构建尝试次数**: 9次（8次失败 + 1次成功）
- **总耗时**: 约2小时
- **最终构建时间**: 4分11秒

### 经验教训

1. **优先查看官方文档**: Capacitor文档明确说明了Java 21要求
2. **逐步验证**: 每个步骤都要验证是否成功
3. **保存错误日志**: 完整的错误信息是排查问题的关键
4. **使用自动化**: GitHub Actions比本地构建更稳定可靠

---

**文档版本**: v1.0  
**最后更新**: 2026-01-07  
**维护者**: Manus AI Agent  
**项目**: vampire-rhythm-game
