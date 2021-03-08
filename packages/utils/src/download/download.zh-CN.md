---
title: download
nav:
  title: Utils
  path: /dbs-utils
group:
  title: 函数库
  path: /func
  order: 3
---

# download 文件下载

`Bold` 导出文件

## 代码演示
### 基础用法
```js
import { download } from '@bdsjs/utils';

download({ blob: new Blob(), filename: "text.txt" });
```

## API

### 参数配置 Options

| 参数  | 说明    | 类型      | 默认值  |
| ----- | ----- | ----- | ----- |
| blob | 内容 | `Blob` | `-` |
| filename | 导出文件名 | `filename` | `-` |

### 返回结果 Result

无返回结果
