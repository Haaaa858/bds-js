/**
 * ZeroDb 公用函数
 * @author: liubaochang@iie.ac.cn
 * @create: 2021/03/07
 */
import set from 'lodash.set';
import isObject from 'lodash.isobject';
import isArray from 'lodash.isarray';
import isNumber from 'lodash.isnumber';
import isString from 'lodash.isstring';
import { GenerateOptions, DeepObjectExpress, Query, ZeroLogicQuery } from './types';
import { OR_CHAR, LIKE, OR, IN, NO_LIKE, NOT, IS, AND } from './separator';

/** 暴露的表达式 */
export const ZeroSeparator = {
  OR_CHAR,
  LIKE,
  IN,
  NO_LIKE,
  NOT,
  IS,
  AND,
  OR,
};

/** 空格 => || */
function parseSpaceToOr(value: string) {
  return `${value}`.trim().replace(/\s+/g, OR_CHAR);
}
/** 分割 字符串 空格 , | ||*/
function splitStrToArray(value: string): Array<number | string> {
  return value.split(/,|\||\|\||\s/g).filter((item) => !!item);
}

/** 解析 is not 条件 */
function parseValueToIsNot(value: string | number | Array<string | number>) {
  if (isArray(value)) {
    return (<Array<string | number>>value).join(OR_CHAR);
  }
  if (isNumber(value)) {
    return value;
  }
  if (isString(value)) {
    return splitStrToArray(<string>value).join(OR_CHAR);
  }
  throw new Error(`[is|not] no support for value: ${JSON.stringify(value)}`);
}

/** 解析 in 条件 */
function parseValueToIn(value: string | number | Array<string | number>) {
  if (isArray(value)) {
    return value;
  }
  if (isNumber(value)) {
    return [value];
  }
  if (isString(value)) {
    return splitStrToArray(<string>value);
  }
  throw new Error(`[in] no support for value: ${JSON.stringify(value)}`);
}

/** 格式化输入值 */
function parseFieldValue(queryType, value): string | number | Array<any> {
  switch (queryType) {
    case LIKE:
    case NO_LIKE:
      return parseSpaceToOr(value);
    case IS:
    case NOT:
      // is not 多个值 拼成或关系
      return parseValueToIsNot(value);
    case IN:
      return parseValueToIn(value);
    default:
      throw new Error(`no handler for queryType "${queryType}", fieldKey: "${value}"`);
  }
}

/** valid value */
function validValue(value) {
  return (isNumber(value) || (isArray(value) && value.length > 0) || (!isArray(value) && !!value));
}

/** 基于 DeepObjectExpress => } */
function generateLogic(queryMap: DeepObjectExpress, queryLength = 0): ZeroLogicQuery {
  const { fieldSeparator = AND, fields, values } = queryMap;
  let query: Array<Query> = [];
  const logicArr: Array<string | number> = [];
  let _fields = fields;
  // 输出字段 做排序， 便于测试
  if (process.env.NODE_ENV === 'test') {
    _fields = _fields.sort((field1, field2) => field1.localeCompare(field2));
  }
  _fields.forEach((field) => {
    if (values[field]?.fields?.length > 1) {
      const { query: childQuery, logic: childLogic } = generateLogic(
        values[field],
        query.length + queryLength,
      );
      if (childQuery.length > 0) {
        // 空值处理
        query = query.concat(childQuery);
        logicArr.push(`(${childLogic})`);
      }
    } else if (values[field]) {
      // 空值处理
      logicArr.push(query.length + queryLength);
      query.push({ field, ...values[field] });
    }
  });
  return { query, logic: logicArr.join(` ${fieldSeparator} `) };
}

/** 基于 检索条件 生成 对象逻辑表达式 */
function generateDeepObjectExpress(
  options: GenerateOptions,
  parentKey?: string | number,
): DeepObjectExpress {
  const { conditions, dict, fieldSeparator = AND } = options;
  const queryMap = {
    fieldSeparator,
    fields: parentKey
      ? dict[parentKey].fields
      : Object.keys(conditions).filter((key) => !!dict[key]),
    values: {},
  };
  if (process.env.NODE_ENV !== 'production') {
    const noDictKeys = Object.keys(conditions).filter((key) => !dict[key]);
    if (noDictKeys.length > 0) {
      console.warn(JSON.stringify(noDictKeys) + ',缺少Dict描述');
    }
  }
  queryMap.fields.forEach((key) => {
    const { queryType, fields, fieldSeparator = 'and' } = dict[key];
    const fieldValue = conditions[key];
    // 递归复合参数
    if (isObject(fieldValue) && !isArray(fieldValue)) {
      queryMap.values[key] = generateDeepObjectExpress(
        {
          conditions: conditions[key],
          dict,
          fieldSeparator,
        },
        key,
      );
    } else if (fields.length > 1) {
      // 同一筛选项匹配多个字段
      queryMap.values[key] = {
        fields,
        fieldSeparator,
        values: fields.reduce((memo, field) => {
          // 假值处理
          if(validValue(conditions[key])){
            set(memo, `${field}.${queryType}`, conditions[key]);
            set(memo, `${field}.field`, field);
          }
          return memo;
        }, {}),
      };
    } else if (validValue(fieldValue)) {
      set(queryMap.values, `${key}.${queryType}`, parseFieldValue(queryType, fieldValue));
      set(queryMap.values, `${key}.${queryType}`, parseFieldValue(queryType, fieldValue));
      // 缓存下当前检索的字段
      set(queryMap.values, `${key}.field`, fields[0]);
    }
  });
  return queryMap;
}

/** 基于检索query 生成 新的 query 和 logic - 检索中心 */
export function generateZeroLogicQuery(options: GenerateOptions): ZeroLogicQuery {
  const objectExpress = generateDeepObjectExpress(options);
  return generateLogic(objectExpress);
}

/** 格式化 page 参数 - 检索中心 */
export function generateOffsetSize(pageNum = 0, pageSize = 100) {
  return {
    offset: (pageNum - 1) * pageSize + 1,
    size: pageSize,
  };
}
