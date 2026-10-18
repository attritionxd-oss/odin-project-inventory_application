export const parseId = (idParam) => {
  const parsed = parseInt(idParam, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};
