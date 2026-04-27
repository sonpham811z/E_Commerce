export const parsePrice = (str) => {
  if (!str || typeof str !== 'string') return 0;
  return parseInt(str.replace(/\D/g, '')) || 0;
};
