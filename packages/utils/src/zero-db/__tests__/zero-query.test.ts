import * as SEPARATOR from '../separator';
import groupBy from 'lodash.groupby';
import { generateZeroLogicQuery, generateOffsetSize } from '../index';
import { GenerateOptions, ZeroField } from '../types';

describe('zero-db generateZeroLogicQuery', function () {
  const DICT: { [field: string]: ZeroField } = {
    keyword: {
      queryType: SEPARATOR.LIKE,
      fieldSeparator: 'or',
      fields: ['content', 'mediaText'],
    },
    excludeWord: {
      queryType: SEPARATOR.NO_LIKE,
      fieldSeparator: 'and',
      fields: ['content', 'mediaText'],
    },
    client: {
      queryType: SEPARATOR.IN,
      fields: ['client'],
    },
    accountId: {
      queryType: SEPARATOR.IS,
      fields: ['accountId'],
    },
    groupId: {
      queryType: SEPARATOR.NOT,
      fields: ['groupId'],
    },
    uName: {
      queryType: SEPARATOR.IN,
      fields: ['uName'],
    },
    rmtClient: {
      fieldSeparator: 'and',
      fields: ['client', 'uName'],
    },
    xwmtClient: {
      fieldSeparator: 'or',
      fields: ['rmtClient', 'client'],
    },
  };
  it('base', function () {
    const conditions = {
      uName: '融媒体1,融媒体2',
      client: [1, 2, 3],
      keyword: '你好&&我好',
      accountId: ['12312', '21321'],
      groupId: '1,2,3||5|6|8',
    };
    const expectResult = {
      logic: '0 and 1 and 2 and (3 or 4) and 5',
      query: [
        { field: 'accountId', is: '12312||21321' },
        { field: 'client', in: [1, 2, 3] },
        { field: 'groupId', not: '1||2||3||5||6||8' },
        { field: 'content', like: '你好&&我好' },
        { field: 'mediaText', like: '你好&&我好' },
        { field: 'uName', in: ['融媒体1', '融媒体2'] },
      ],
    };
    expect(generateZeroLogicQuery({ conditions, dict: DICT })).toEqual(expectResult);
  });

  it('compound field', function () {
    const expectResult = {
      logic: '(0 or (1 and 2))',
      query: [
        { field: 'client', in: ['2', '3', '4'] },
        { field: 'client', in: ['1'] },
        { field: 'uName', in: ['融媒体1', '融媒体2'] },
      ],
    };
    expect(
      generateZeroLogicQuery({
        conditions: {
          xwmtClient: {
            rmtClient: {
              client: '1',
              uName: '融媒体1,融媒体2',
            },
            client: '2,3,4',
          },
        },
        dict: DICT,
      }),
    ).toEqual(expectResult);
  });

  it('batch rules', function () {
    const newDict: { [field: string]: ZeroField } = {
      ...DICT,
      textRuleKeyword: {
        queryType: SEPARATOR.LIKE,
        fieldSeparator: 'or',
        fields: ['content'],
        // 关键字规则同时匹配 文本和OCR两个字段
        //fields: ['content', 'mediaText'],
      },
      textRuleExcludeWord: {
        queryType: SEPARATOR.NO_LIKE,
        fieldSeparator: 'and',
        fields: ['content'],
        // 关键字规则同时匹配 文本和OCR两个字段
        //fields: ['content', 'mediaText'],
      },
      ocrRuleKeyword: {
        queryType: SEPARATOR.LIKE,
        fieldSeparator: 'or',
        fields: ['mediaText'],
      },
      ocrRuleExcludeWord: {
        queryType: SEPARATOR.NO_LIKE,
        fieldSeparator: 'and',
        fields: ['mediaText'],
      },
    };

    //格式化后的规则
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

    // 动态生成规则 DICT
    const topicRuleValuesDict: ZeroField = {
      fieldSeparator: 'or',
      fields: ['accountId'],
    };
    const topicRuleValues = {};
    const groupRules = groupBy(rules, 'type');

    const textRuleDict: ZeroField = {
      fieldSeparator: 'and',
      fields: ['textRuleKeyword', 'textRuleExcludeWord'],
    };
    groupRules.text.forEach((textRule) => {
      topicRuleValues[textRule.id] = {
        textRuleKeyword: textRule.content.keyword,
        textRuleExcludeWord: textRule.content.excludeWord,
      };
      newDict[textRule.id.toString()] = textRuleDict;
      topicRuleValuesDict.fields.push(textRule.id.toString());
    });

    const ocrRuleDict: ZeroField = {
      fieldSeparator: 'and',
      fields: ['ocrRuleKeyword', 'ocrRuleExcludeWord'],
    };
    groupRules.ocr.forEach((ocrRule) => {
      topicRuleValues[ocrRule.id.toString()] = {
        ocrRuleKeyword: ocrRule.content.keyword,
        ocrRuleExcludeWord: ocrRule.content.excludeWord,
      };
      newDict[ocrRule.id.toString()] = ocrRuleDict;
      topicRuleValuesDict.fields.push(ocrRule.id.toString());
    });

    topicRuleValues['accountId'] = groupRules.account.map((item) => item.content);
    newDict['topicRuleValues'] = topicRuleValuesDict;

    // 筛选器条件
    const conditions = {
      // 检索关键字 同时匹配 文本和OCR两个字段
      keyword: '你好&&我好',
      accountId: ['筛选器账号ID1', '筛选器账号ID2'],
      topicRuleValues,
    };
    const expectResult = {
      query: [
        { field: 'accountId', is: '筛选器账号ID1||筛选器账号ID2' },
        { field: 'content', like: '你好&&我好' },
        { field: 'mediaText', like: '你好&&我好' },
        { field: 'content', noLike: '规则1&&排除a1&&(排除b1||排除c1)' },
        { field: 'content', like: '规则1&&((你好1&&(我好1||大家好1)))' },
        { field: 'content', noLike: '规则2&&排除2&&(排除2||排2)' },
        { field: 'content', like: '规则2&&((你好2&&(我好2||大家好2)))' },
        { field: 'mediaText', noLike: 'ocr规则3&&排除3&&(排除3||排3)' },
        { field: 'mediaText', like: 'ocr规则3&&((你好3&&(我好3||大家好3)))' },
        { field: 'mediaText', noLike: 'ocr规则4&&排除4&&(排除4||排4)' },
        { field: 'mediaText', like: 'ocr规则4&&((你好4&&(我好4||大家好4)))' },
        { field: 'accountId', is: 'account111111||account2222222' },
      ],
      logic: '0 and (1 or 2) and ((3 and 4) or (5 and 6) or (7 and 8) or (9 and 10) or 11)',
    };

    expect(
      generateZeroLogicQuery({
        conditions,
        dict: newDict,
      }),
    ).toEqual(expectResult);
  });
});

describe('zero-db generateOffsetSize', function () {
  it('generateOffsetSize', function () {
    expect(generateOffsetSize(1, 100)).toEqual({ offset: 1, size: 100 });
  });
});
