import gdrive from '../api/GoogleDrive';

export const downloadFile = async (params, data) => {
  const file = await gdrive.generateDocx(params, data);
  const url = window.URL.createObjectURL(new Blob([file.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'contrat.docx');
  document.body.appendChild(link);
  link.click();
};
