import gdrive from '../api/GoogleDrive';

export const downloadDocxFile = async (params, data, fileName) => {
  const file = await gdrive.generateDocx(params, data);
  const url = window.URL.createObjectURL(new Blob([file.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
};
