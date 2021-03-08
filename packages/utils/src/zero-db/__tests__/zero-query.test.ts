import * as SEPARATOR from '../separator';
import { generateZeroLogicQuery, generateOffsetSize } from '../index';
import { GenerateOptions, ZeroField } from '../types';

describe('zero-db generateZeroLogicQuery', function () {
  const DICT: { [field: string]: ZeroField } = {
    keyword: {
      queryType: SEPARATOR.LIKE,
      fieldSeparator: 'or',
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
});

describe('zero-db generateOffsetSize', function () {
  it('generateOffsetSize', function () {
    expect(generateOffsetSize(1, 100)).toEqual({ offset: 1, size: 100 });
  });
});
