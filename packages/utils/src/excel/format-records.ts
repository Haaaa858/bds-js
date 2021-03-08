import get from 'lodash.get';
import isUndefined from 'lodash.isundefined';
import { ExportExcelOptions } from './types';

/**
 * @description 格式化 表格数据
 * @author liubaochang@iie.ac.cn
 * @date 2020-11-05
 */

function formatRecords(options: ExportExcelOptions) {
  const {
    showDefaultNumber = true,
    defaultNumberColumnDisplay = '序号',
    emptyPlaceholder: globalEmptyPlaceholder,
    columns = [],
    records = [],
  } = options;

  // 表格头，判断是否添加默认的序号列
  const excelData: Array<Array<string | number>> = [columns.map((column) => column.display)];

  if (showDefaultNumber) {
    excelData[0].unshift(defaultNumberColumnDisplay);
  }

  // 列 占位符
  const columnPlaceholderDict = columns.map(({ emptyPlaceholder }) =>
    isUndefined(emptyPlaceholder) ? globalEmptyPlaceholder : emptyPlaceholder,
  );

  records.forEach((record, index) => {
    const rowData = showDefaultNumber ? [index + 1] : [];
    columns.forEach(({ column }, columnIndex) => {
      rowData.push(get(record, column, columnPlaceholderDict[columnIndex]));
    });
    excelData.push(rowData);
  });

  return excelData;
}

export default formatRecords;
