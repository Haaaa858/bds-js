/**
 * @description: Blob 下载
 * @author: liubaochang@iie.ac.cn
 * @create: 2021/03/04
 */

export interface DownloadOptions {
  // 数据源
  blob: Blob;
  // 导出文件名
  filename: string;
}

function downloadBlob(options: DownloadOptions) {
  const { blob, filename } = options;
  const URL = window.URL || window.webkitURL;
  const bloburl: string = URL.createObjectURL(blob);
  const anchor: HTMLAnchorElement = document.createElement('a');
  if ('download' in anchor) {
    anchor.style.visibility = 'hidden';
    anchor.href = bloburl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    const evt = document.createEvent('MouseEvents');
    evt.initEvent('click', true, true);
    anchor.dispatchEvent(evt);
    document.body.removeChild(anchor);
  } else if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    location.href = bloburl;
  }
  URL.revokeObjectURL(bloburl);
}

export default downloadBlob;
