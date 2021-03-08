---
title: exportExcl
nav:
  title: Utils
  path: /dbs-utils
group:
  title: 函数库
  path: /func
  order: 3
---

# exportExcl

数据导出

## 代码演示
### 基础用法
```js
import { download } from '@bdsjs/utils';

exportExcl({
    showDefaultNumber: false,
    columns: [
      { column: 'name', display: '资源名称' },
      { column: 'key', display: '资源KEY' },
      { column: 'type', display: '资源类型' },
      { column: 'value', display: '资源内容' },
    ],
    records,
    filename: '数据资源表.xlsx',
}).then(({success}) => {
  console.log("导出成功")
});
```

## API

### 参数配置 Options

| 参数  | 说明    | 类型      | 默认值  |
| ----- | ----- | ----- | ----- |
| records | 数据源 | `Array<Object>` | `-` |
| filename | 导出文件名 | `filename` | `-` |
| columns | 列配置 | `Array[`[`ExcelColumn`](#列配置excelcolumn)`]` | `-` |
| bookType | ?导出文件类型 | `xlsx` \| `csv` \| `txt` | `xlsx` |
| showDefaultNumber | ?是否填充默认序号列 | `boolean` | `true` |
| defaultNumberColumnDisplay |  ?默认序号列名称 | `string` | `序号` |
| emptyPlaceholder |  ?全局控制占位符 | `string|number` | `''` |

### 列配置ExcelColumn
| 参数  | 说明    | 类型      | 默认值  |
| ----- | ----- | ----- | ----- |
| column | 列字段，支持 lodash.get 写法 | `string` | `-` |
| display | 列表头 | `string` | `-` |
| emptyPlaceholder | 空值占位符，优先级高于options.emptyPlaceholder | `string|number` | `''` |

### 返回结果 Result
返回 `Promise` 对象
| 参数    | 说明     | 类型      |
| ------- | -------- | --------- |
| success   | 成功、失败   | `boolbean` |
| message | 成功、错误信息 | `string` |