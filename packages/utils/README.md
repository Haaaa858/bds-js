# DBS 工具库

常用工具函数

## 安装

安装:

```bash
# 单次安装
yarn add @bdsjs/utils --registry=http://192.168.2.231:14873

# 全局修改镜像地址， 以后安装所有包都会走一下 镜像地址
yarn config set registry http://192.168.2.231:14873
yarn add @bdsjs/utils
```

npm 安装:

```bash
# 单次安装
npm install  @bdsjs/utils  -S  --registry=http://192.168.2.231:14873

# 全局修改镜像地址， 以后安装所有包都会走一下 镜像地址
npm config set registry http://192.168.2.231:14873
npm install  @bdsjs/utils  -S
```

## Example

```javascript
import { download } from '@bdsjs/utils';

download({ blob: new Blob(), filename: "text.txt" });
```

## Documentation
