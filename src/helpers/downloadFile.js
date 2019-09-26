import gdrive from '../api/GoogleDrive';
// import redirect from '../router/redirect';

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

export const generateBlobUrlFromFile = async (pdf, filename) => {
  const blob = new Blob([pdf.data], { type: 'application/pdf' })
  return window.URL.createObjectURL(blob);
};
