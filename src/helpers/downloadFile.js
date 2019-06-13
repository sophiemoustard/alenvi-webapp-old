import gdrive from '../api/GoogleDrive';

export const downloadFile = (file, fileName) => {
  const url = window.URL.createObjectURL(new Blob([file.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
};

export const downloadDocxFile = async (params, data, fileName) => {
  const file = await gdrive.generateDocx(params, data);
  downloadFile(file, fileName);
};

export const downloadPdf = async (pdf, filename) => {
  const blob = new Blob([pdf.data], { type: 'application/pdf' })
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
