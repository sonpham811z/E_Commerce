export const toCamelCase = (str) =>
  str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());

export const convertKeysToCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = toCamelCase(key);
      acc[newKey] = convertKeysToCamelCase(value);
      return acc;
    }, {});
  }

  return obj;
};
