import html2canvas from 'html2canvas';

export const exportReportAsImage = async (elementId, fileName) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  const canvas = await html2canvas(element);
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL();
  link.click();
};
