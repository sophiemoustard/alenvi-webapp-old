import gdrive from '../api/GoogleDrive';

export const downloadDocxFile = async (params, data, filename) => {
  const file = await gdrive.generateDocx(params, data);
  const blob = new Blob([file.data]);
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
};

export const downloadPdf = async (pdf, filename) => {
  const blob = new Blob([pdf.data], { type: 'application/pdf' })
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
