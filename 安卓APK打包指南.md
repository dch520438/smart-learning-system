# 智慧学习整理系统 - 安卓APK打包指南

## 前置准备

### 1. 重启电脑，解决文件锁定问题
- 重启电脑，确保没有进程锁定node_modules文件

### 2. 必需工具

#### a. Node.js (已安装)
- 确认：`node -v` (v24.15.0 或更高)

#### b. Android Studio
- 下载地址：https://developer.android.com/studio
- 安装时选择：
  - Android SDK Platform 33+
  - Android SDK Build-Tools 33+
  - Android Gradle Plugin
  - Gradle 8+

#### c. Java JDK 17+
- Android Studio已包含，无需额外安装

#### d. Git (可选)
- 用于版本控制

## 步骤一：解决依赖问题

### 1. 关闭所有可能使用项目的程序
- VS Code
- 浏览器
- 终端

### 2. 清理项目

在命令提示符(cmd)中运行：

```cmd
cd C:\Users\Administrator\Desktop\开发学习整理软件

:: 方法1：使用rd删除node_modules
rd /s /q node_modules
rd /s /q dist

:: 如果上面不行，使用方法2
rmdir /s /q node_modules
rmdir /s /q dist

:: 清理npm缓存
npm cache clean --force
```

### 3. 重新安装依赖

```cmd
:: 先安装生产依赖
npm install --production

:: 再安装开发依赖
npm install --save-dev
```

## 步骤二：安装Capacitor

```cmd
cd C:\Users\Administrator\Desktop\开发学习整理软件

:: 安装Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev
```

## 步骤三：初始化Capacitor

```cmd
npx cap init
```

按提示输入：
- App name: 智慧学习整理系统
- App ID: com.smartlearning.app
- Web Dir: dist

## 步骤四：构建Web项目

```cmd
npm run build
```

## 步骤五：添加Android平台

```cmd
npx cap add android
```

## 步骤六：同步文件

```cmd
npx cap sync
```

## 步骤七：打开Android项目

```cmd
npx cap open android
```

这会在Android Studio中打开项目。

## 步骤八：在Android Studio中构建APK

### 1. 等待Gradle同步
- Android Studio会自动同步Gradle
- 首次同步需要10-30分钟，耐心等待

### 2. 配置应用信息

打开 `android/app/src/main/AndroidManifest.xml`，确保包含：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="智慧学习整理系统"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/Theme.AppCompat.Light.DarkActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 3. 配置应用图标

1. 右键 `android/app/src/main/res` 文件夹
2. 选择 `New` → `Image Asset`
3. 选择 `Launcher Icons (Adaptive and Legacy)`
4. 上传你的图标图片
5. 点击 `Finish`

### 4. 生成签名密钥

1. 点击菜单 `Build` → `Generate Signed Bundle / APK`
2. 选择 `APK` 并点击 `Next`
3. 点击 `Create new...` 来创建新密钥库
4. 填写信息：
   - Key store path: 选择保存位置（如 `D:\smart-learning\keystore.jks`）
   - Key store password: 设置密码
   - Key alias: 密钥别名（如 `smart-learning`）
   - Key password: 设置密钥密码
   - Validity: 25年
   - Certificate信息：填写姓名、组织等
5. 点击 `OK`

### 5. 构建Release APK

1. 选择刚创建的密钥库
2. 选择 `release` 构建变体
3. 勾选 `V1` 和 `V2` 签名版本
4. 点击 `Finish`
5. 等待构建完成
6. APK文件位置：`android/app/build/outputs/apk/release/app-release.apk`

## 步骤九：安装到安卓设备

### 方法一：通过USB安装
1. 在安卓手机上开启USB调试：
   - 设置 → 关于手机 → 连续点击版本号7次
   - 返回设置 → 系统 → 开发者选项 → 开启USB调试
2. 用USB线连接手机和电脑
3. 在Android Studio中点击 `Run` 按钮（绿色三角形）
4. 选择你的设备
5. 等待安装完成

### 方法二：直接安装APK
1. 将 `app-release.apk` 复制到手机
2. 在手机上打开文件管理器
3. 点击APK文件
4. 允许安装未知来源应用
5. 点击安装

## 常见问题解决

### 问题1：node_modules无法删除
- 重启电脑
- 或者使用工具：Unlocker

### 问题2：npm install失败
```cmd
:: 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 问题3：Gradle同步失败
- 检查网络连接
- 配置Android Studio使用国内镜像
- 在 `android/gradle.properties` 中添加：
```properties
org.gradle.jvmargs=-Xmx2048m
```

### 问题4：构建时间太长
- 确保使用的是SSD硬盘
- 关闭其他占用内存的程序

## 替代方案：使用PWA

如果上述方法太复杂，可以使用PWA方式：

1. 在电脑上运行：
```cmd
npm run dev
```

2. 确保手机和电脑在同一WiFi网络

3. 在手机浏览器中访问电脑IP地址：
```
http://电脑IP:5173
```

4. 点击浏览器菜单 → "添加到主屏幕"
5. 这样就创建了一个PWA应用，体验类似原生APP

## 技术支持

如果遇到问题，请检查：
1. Node.js版本是否符合要求
2. Android Studio是否正确安装
3. 网络连接是否正常
4. 是否有足够的磁盘空间（至少10GB）

## 最终APK

成功构建后，你会得到一个APK文件，可以直接在安卓设备上安装使用！
