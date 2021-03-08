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
import { generateZeroLogicQuery, ZeroSeparator } from '../index';

// 数据字典
const DICT = {
  keyword: {
    queryType: ZeroSeparator.LIKE,
    fieldSeparator: ZeroSeparator.OR,
    // 关键词同时匹配多个字段
    fields: ['content', 'mediaText'],
  },
  client: {
    queryType: ZeroSeparator.IN,
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
import { generateZeroLogicQuery, ZeroSeparator } from '@bdsjs/utils';

// 数据字典
const DICT = {
  uName: {
    queryType: ZeroSeparator.IN,
    fields: ['uName'],
  },
  client: {
    queryType: ZeroSeparator.IN,
    fields: ['client'],
  },
  // 融媒体客户端: (公众号Client and  融媒体名称)
  rmtClient: {
    fieldSeparator: ZeroSeparator.AND,
    fields: ['client', 'uName'],
  },
  // 新闻全部客户端: (普通客户端 or 融媒体)
  xwmtClient: {
    fieldSeparator: ZeroSeparator.OR,
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
//   "logic": "((0 and 1) or 2)",
//   "query": [
//     {"field": "client", "in": ["1"]},
//     {"field": "uName", "in": ["融媒体1", "融媒体2"]},
//     {"field": "client", "in": ["2", "3", "4"]}
//   ]
// }
```

### 多通道规则，按规则内容检索

```javascript
import { generateZeroLogicQuery, ZeroSeparator } from '@bdsjs/utils';

const dict = {
  // 筛选器-关键词
  keyword: {
    queryType: ZeroSeparator.LIKE,
    fieldSeparator: 'or',
    fields: ['content', 'mediaText'],
  },
  // 筛选器-排除词
  excludeWord: {
    queryType: ZeroSeparator.NO_LIKE,
    fieldSeparator: 'and',
    fields: ['content', 'mediaText'],
  },
  // 筛选器-账号
  accountId: {
    queryType: ZeroSeparator.IS,
    fields: ['accountId'],
  },
  // 文本规则-关键词
  textRuleKeyword: {
    queryType: ZeroSeparator.LIKE,
    fieldSeparator: 'or',
    fields: ['content'],
    // 关键字规则同时匹配 文本和OCR两个字段
    //fields: ['content', 'mediaText'],
  },
  // 文本规则-排除词
  textRuleExcludeWord: {
    queryType: ZeroSeparator.NO_LIKE,
    fieldSeparator: 'and',
    fields: ['content'],
    // 关键字规则同时匹配 文本和OCR两个字段
    //fields: ['content', 'mediaText'],
  },
  // OCR规则-关键词
  ocrRuleKeyword: {
    queryType: ZeroSeparator.LIKE,
    fieldSeparator: 'or',
    fields: ['mediaText'],
  },
  // OCR规则-排除词
  ocrRuleExcludeWord: {
    queryType: ZeroSeparator.NO_LIKE,
    fieldSeparator: 'and',
    fields: ['mediaText'],
  },
};

//举例 - 如 规则格式化后如下
const rules = [
  {
    id: 1,
    content: {
      keyword: '规则1&&((你好1&&(我好1||大家好1)))',
      excludeWord: '规则1&&排除a1&&(排除b1||排除c1)',
    },
    type: 'text',
  },
  {
    id: 2,
    content: {
      keyword: '规则2&&((你好2&&(我好2||大家好2)))',
      excludeWord: '规则2&&排除2&&(排除2||排2)',
    },
    type: 'text',
  },
  {
    id: 3,
    content: {
      keyword: 'ocr规则3&&((你好3&&(我好3||大家好3)))',
      excludeWord: 'ocr规则3&&排除3&&(排除3||排3)',
    },
    type: 'ocr',
  },
  {
    id: 4,
    content: {
      keyword: 'ocr规则4&&((你好4&&(我好4||大家好4)))',
      excludeWord: 'ocr规则4&&排除4&&(排除4||排4)',
    },
    type: 'ocr',
  },
  { id: 5, content: 'account111111', type: 'account' },
  { id: 6, content: 'account2222222', type: 'account' },
];
const groupRules = groupBy(rules, 'type');

// !!! 动态生成规则 dict
const topicRuleValuesDict = {
  fieldSeparator: 'or',
  fields: ['accountId'],
};

const topicRuleValues = {};

// 拼接文本规则
const textRuleDict = {
  fieldSeparator: 'and',
  fields: ['textRuleKeyword', 'textRuleExcludeWord'],
};
groupRules.text.forEach((textRule) => {
  topicRuleValues[textRule.id] = {
    textRuleKeyword: textRule.content.keyword,
    textRuleExcludeWord: textRule.content.excludeWord,
  };
  dict[textRule.id.toString()] = textRuleDict;
  topicRuleValuesDict.fields.push(textRule.id.toString());
});

// 拼接OCR规则
const ocrRuleDict = {
  fieldSeparator: 'and',
  fields: ['ocrRuleKeyword', 'ocrRuleExcludeWord'],
};
groupRules.ocr.forEach((ocrRule) => {
  topicRuleValues[ocrRule.id.toString()] = {
    ocrRuleKeyword: ocrRule.content.keyword,
    ocrRuleExcludeWord: ocrRule.content.excludeWord,
  };
  dict[ocrRule.id.toString()] = ocrRuleDict;
  topicRuleValuesDict.fields.push(ocrRule.id.toString());
});

// 拼接账号规则
topicRuleValues['accountId'] = groupRules.account.map((item) => item.content);
dict['topicRuleValues'] = topicRuleValuesDict;
const { query, logic } = generateZeroLogicQuery({
  conditions: {
    // 检索关键字 同时匹配 文本和OCR两个字段
    keyword: '你好&&我好',
    accountId: ['筛选器账号ID1', '筛选器账号ID2'],
    topicRuleValues,
  },
  dict: dict,
});
// 输出
// {
//   query: [
//     { field: 'accountId', is: '筛选器账号ID1||筛选器账号ID2' },
//     { field: 'content', like: '你好&&我好' },
//     { field: 'mediaText', like: '你好&&我好' },
//     { field: 'content', noLike: '规则1&&排除a1&&(排除b1||排除c1)' },
//     { field: 'content', like: '规则1&&((你好1&&(我好1||大家好1)))' },
//     { field: 'content', noLike: '规则2&&排除2&&(排除2||排2)' },
//     { field: 'content', like: '规则2&&((你好2&&(我好2||大家好2)))' },
//     { field: 'mediaText', noLike: 'ocr规则3&&排除3&&(排除3||排3)' },
//     { field: 'mediaText', like: 'ocr规则3&&((你好3&&(我好3||大家好3)))' },
//     { field: 'mediaText', noLike: 'ocr规则4&&排除4&&(排除4||排4)' },
//     { field: 'mediaText', like: 'ocr规则4&&((你好4&&(我好4||大家好4)))' },
//     { field: 'accountId', is: 'account111111||account2222222' },
//   ], 
//   logic: '0 and (1 or 2) and ((3 and 4) or (5 and 6) or (7 and 8) or (9 and 10) or 11)',
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

| 参数   | 说明                                                               | 类型                                      |
| ------ | ------------------------------------------------------------------ | ----------------------------------------- |
| field  | 数据字段                                                           | `string`                                  |
| in     | `number` \| `(, \| \|\|)分割的字符串` <br> `Array<string\|number>` | `string` `number` `Array<string\|number>` |
| like   | `&&` `\|\|` 表达式                                                 | string                                    |
| noLike | `&&` `\|\|` 表达式                                                 | string                                    |
| is     | `number` \| `(, \| \|\|)分割的字符串` <br> `Array<string\|number>` | `string` `number` `Array<string\|number>` |
| not    | `number` \| `(, \| \|\|)分割的字符串` <br> `Array<string\|number>` | `string` `number` `Array<string\|number>` |
