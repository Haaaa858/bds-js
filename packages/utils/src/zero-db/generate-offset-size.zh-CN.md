---
title: generateOffsetSize
nav:
  title: Utils
  path: /dbs-utils
group:
  title: 函数库
  path: /func
  order: 3
---

# generateZeroQuery

常规 pageSize pageNum 转 offset，size

## 代码演示

```javascript
import { generateOffsetSize } from '@bdsjs/utils'

const pageNum = 1;
const pageSize = 100;

const { offset,size } = generateOffsetSize(pageNum, pageSize);

// offset => 1
// size => 100
```
## API

### Params

| 参数  | 说明    | 类型      | 默认值  |
| ----- | ----- | ----- | ----- |
| pageNum | 当前页码，必填项 | `number` | `-` |
| pageSize | 分页数，可选项 | `number` | `100` |

### Result

| 参数    | 说明     | 类型      |
| ------- | -------- | --------- |
| offset   | 读取数据起始索引   | `number` |
| size | 读取条数 | `number` |
