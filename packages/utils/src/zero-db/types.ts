/** ZeroField Dict*/
export interface ZeroField {
  queryType?: 'in' | 'is' | 'like' | 'noLike' | 'not';
  fieldSeparator?: 'or' | 'and';
  fields: Array<string>;
}

/** Zero Query */
export interface Query {
  field: string;
  in?: Array<string> | Array<number>;
  like?: string;
  noLike?: string;
  is?: string | number;
  not?: string | number;
}

/** DeepObjectExpress */
export interface DeepObjectExpress {
  fields: Array<string>;
  fieldSeparator: 'and' | 'or';
  values: {
    [field: string]: DeepObjectExpress;
  };
}

/** 输出结果 */
export interface ZeroLogicQuery {
  logic: string;
  query: Array<Query>;
}

/** 输出结果 */
export interface GenerateOptions {
  conditions: { [field: string]: any };
  dict: { [field: string]: ZeroField };
  logicOption?: ZeroLogicQuery;
  fieldSeparator?: 'or' | 'and';
}
