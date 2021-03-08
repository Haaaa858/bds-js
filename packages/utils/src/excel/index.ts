import generateBlob from './generate-blob';
import formatExclData from './format-records';
import download from '../download';
import { ExportExcelOptions } from './types';

async function exportExcl(options: ExportExcelOptions) {
  const { bookType, filename } = options;
  const result = await generateBlob(
    [
      {
        sheetRecords: formatExclData(options),
        sheetName: 'sheet1',
      },
    ],
    bookType,
  );

  if (!result.success) {
    return result;
  }

  if ('data' in result) {
    download({ blob: result.data, filename: options.filename });
    return { success: true, filename };
  }

  return { success: false, message: '生成Blob失败' };
}

export default exportExcl;
