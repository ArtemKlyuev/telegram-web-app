export const isNullable = (value: any): value is undefined | null => {
  return value === undefined || value === null;
};
