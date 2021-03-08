export { WorkBook, WritingOptions } from 'xlsx/types';

/** 导出的表格列配置 */
export interface ExcelColumn {
  // 列字段，支持 lodash.get 写法
  column: string;
  // 列表头
  display: string;
  // 空值占位符，优先级高于options.emptyPlaceholder
  emptyPlaceholder: string | number;
}

/** 导出配置 */
export interface ExportExcelOptions {
  // 数据源
  records: Array<Object>;
  // 导出文件名
  filename: string;
  // 列配置
  columns: Array<ExcelColumn>;
  // 显示需要序号
  showDefaultNumber?: boolean;
  // 默认序号列名称
  defaultNumberColumnDisplay?: string;
  // 导出文件类型
  bookType?: 'xlsx' | 'csv' | 'txt';
  //全局控制占位符
  emptyPlaceholder?: string | undefined;
}

export interface SheetsTypes {
  sheetRecords: Array<any>;
  sheetName: string;
}

export interface GenerateExclBlobTypes {
  success: boolean;
  data: Blob;
}
