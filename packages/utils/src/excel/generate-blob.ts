import xlsx from 'xlsx';
import { SheetsTypes, GenerateExclBlobTypes, WorkBook, WritingOptions } from './types';

function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; i += 1) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
}

export default async function generateBlob(sheets: Array<SheetsTypes>, bookType) {
  const workbook: WorkBook = {
    SheetNames: [],
    Sheets: {},
  };

  sheets.forEach(({ sheetName, sheetRecords }) => {
    const sheet = xlsx?.utils.aoa_to_sheet(sheetRecords);
    workbook.SheetNames.push(sheetName);
    // @ts-ignore
    workbook.Sheets[sheetName] = sheet;
  });
  // 生成excel的配置项
  const wopts: WritingOptions = {
    bookType, // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary',
  };
  const wbout = xlsx?.write(workbook, wopts);
  const blob = new Blob([s2ab(wbout)], {
    type: 'application/octet-stream',
  });
  let result: GenerateExclBlobTypes;
  result = { success: true, data: blob };
  return result;
}
