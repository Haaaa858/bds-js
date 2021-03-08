---
title: generateZeroLogicQuery
nav:
  title: Utils
  path: /dbs-utils
group:
  title: 函数库
  path: /func
  order: 3
---

# generateZeroLogicQuery

优雅的生成 ZeroDb 检索参数， `query` `logic`, 支持多层 与 或 关系

## 代码演示

### 基础用法

```javascript
import { generateZeroLogicQuery } from '@bdsjs/utils';

// 数据字典
const DICT = {
  keyword: {
    queryType: ZeroSeparator.LIKE,
    fieldSeparator: 'or',
    // 关键词同时匹配多个字段
    fields: ['content', 'mediaText'],
  },
  client: {
    queryType: 'in',
    fields: ['client'],
  },
};
const conditions = {
  uName: '融媒体1,融媒体2',
  client: [1, 2, 3],
  keyword: '你好&&我好',
};
const { query, logic } = generateZeroLogicQuery({ conditions, dict: DICT });
// => 输出
// {
//   logic: '0 and (1 or 2) and 4',
//   query: [
//     { field: 'client', in: [1, 2, 3] },
//     { field: 'content', like: '你好&&我好' },
//     { field: 'mediaText', like: '你好&&我好' },
//     { field: 'uName', in: ['融媒体1', '融媒体2'] },
//   ],
// };
```

### 自定义复合查询字段

```javascript
import { generateZeroLogicQuery } from '@bdsjs/utils';

// 数据字典
const DICT = {
  uName: {
    queryType: 'in',
    fields: ['uName'],
  },
  client: {
    queryType: 'in',
    fields: ['client'],
  },
  // 融媒体客户端: (公众号Client and  融媒体名称)
  rmtClient: {
    fieldSeparator: 'and',
    fields: ['client', 'uName'],
  },
  // 新闻全部客户端: (普通客户端 or 融媒体)
  xwmtClient: {
    fieldSeparator: 'or',
    fields: ['rmtClient', 'client'],
  },
};
// 检索参数
const conditions = {
  xwmtClient: {
    rmtClient: {
      client: '1',
      uName: '融媒体1,融媒体2',
    },
    client: '2,3,4',
  },
};
const { query, logic } = generateZeroLogicQuery({ conditions, dict: DICT });
// => 输出
// {
//   logic: '0 and (1 or 2) and 4',
//   query: [
//     { field: 'client', in: [1, 2, 3] },
//     { field: 'content', like: '你好&&我好' },
//     { field: 'mediaText', like: '你好&&我好' },
//     { field: 'uName', in: ['融媒体1', '融媒体2'] },
//   ],
// };
```

### Params

[`ZeroField`](#ZeroField)
| 参数 | 说明 | 类型 | 默认值 |
| ------------ | ------------------------ | --------- | ------- |
| conditions | 检索条件，支持复合字段，及多层与或关系 | `Object` | `-` |
| dict | 参数字典 | `{[field: string]:`[`ZeroField`](#zerofield)`}` | `-` |
| fieldSeparator | `最外层字段与或关系`| `and` \| `or` | `-` |

#### ZeroField

| 参数           | 说明                                                                                            | 类型                                           | 默认值 |
| -------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------ |
| queryType      | 检索条件，支持复合字段，及多层与或关系                                                          | `in` \| `is` \| `not` <br/> `like` \| `noLike` | `-`    |
| fieldSeparator | 如关键词、排除词同时匹配`文本`及`ocr识别内容`，多字段匹配关系；<br/> 或自定义的复合字段拼接关系 | `and` \| `or`                                  | `and`  |
| fields         | 筛选项检索字段,支持多个                                                                         | `Array[string]`                                | `-`    |

### Result

| 参数  | 说明                    | 类型                         |
| ----- | ----------------------- | ---------------------------- |
| query | ZeroDd 检索参数`query`  | `Array[`[`Query`](#query)`]` |
| logic | ZeroDd 检索参数 `logic` | `string`                     |

#### Query

| 参数   | 说明                     | 类型                           |
| ------ | ------------------------ | ------------------------------ |
| field  | 数据字段                 | `string`                       |
| in     | `number` \| `(,  \|  \|\|)分割的字符串` <br> `Array<string\|number>` | `string`  `number` `Array<string\|number>` |
| like   | `&&` `\|\|` 表达式 | string |
| noLike | `&&` `\|\|` 表达式 | string |
| is     | `number` \| `(,  \|  \|\|)分割的字符串` <br> `Array<string\|number>` | `string`  `number` `Array<string\|number>` |
| not    | `number` \| `(,  \|  \|\|)分割的字符串` <br> `Array<string\|number>` | `string`  `number` `Array<string\|number>` |
