# @byslin/umi-plugin-cordova
<a href="https://www.npmjs.com/package/@byslin/umi-plugin-cordova"><img src="https://img.shields.io/npm/v/@byslin/umi-plugin-cordova.svg?sanitize=true" alt="Version"></a>

## Installation

仅支持umi3

```
$ npm i @byslin/umi-plugin-cordova --save-dev
```

or

```
$ yarn add @byslin/umi-plugin-cordova --dev
```

安装之后

执行umi cordova init会生成相关文件

自动在package.json增加

```json
{
  "scripts": {
    "cordova:init": "umi cordova init",
    "cordova:prepare": "umi cordova prepare",
    "cordova:browser:dev": "umi dev cordova browser",
    "cordova:browser:build": "umi build cordova browser",
    "cordova:android:dev": "umi dev cordova android",
    "cordova:android:build": "umi build cordova android",
    "cordova:ios:dev": "umi dev cordova ios",
    "cordova:ios:build": "umi build cordova ios"
  }
}
```

## Usage

### 开发

```
$ umi dev cordova android
```

### 打包

```
$ umi build cordova android
```

.umirc.ts

```javascript
import {defineConfig} from 'umi';

export default defineConfig({
  cordovaConfig: {
    routerMode: 'hash',         //路由 只能是hash或memory
    src: 'src-cordova'
  },
  routes: [
    {path: '/', component: '@/pages/index'},
  ],
});
```
与cordova相关配置需要在src-cordova下配置
