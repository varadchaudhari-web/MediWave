export const sanitizeText = (value: string, max = 120) =>
  value
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/[{}<>`$\\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, max);

export const sanitizeSearch = (value: string) =>
  sanitizeText(value, 80).replace(/[;()[\]]/g, '');

export const sanitizeName = (value: string) =>
  value.replace(/[^A-Za-z\s]/g, '').replace(/\s{2,}/g, ' ').slice(0, 50);

export const sanitizeCity = sanitizeName;

export const sanitizeMobile = (value: string) =>
  value.replace(/\D/g, '').slice(0, 10);

export const sanitizePincode = (value: string) =>
  value.replace(/\D/g, '').slice(0, 6);

export const sanitizeAge = (value: string) =>
  value.replace(/\D/g, '').slice(0, 3);

export const sanitizeMoney = (value: string) =>
  value.replace(/\D/g, '').slice(0, 9);

export const sanitizeAddress = (value: string) =>
  value
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/[^A-Za-z0-9\s,./#&()'-]/g, '')
    .replace(/([^\w\s])\1{2,}/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 160);

export const sanitizeEmail = (value: string) =>
  value.trim().replace(/\s/g, '').replace(/[<>`"'(),;:\\]/g, '').slice(0, 80).toLowerCase();

export const sanitizePassword = (value: string) =>
  value.replace(/\s/g, '').slice(0, 72);

export const isValidName = (value: string) => /^[A-Za-z][A-Za-z\s]{1,49}$/.test(value.trim());
export const isValidMobile = (value: string) => /^\d{10}$/.test(value);
export const isValidPincode = (value: string) => /^\d{6}$/.test(value);
export const isValidCity = (value: string) => /^[A-Za-z][A-Za-z\s]{1,49}$/.test(value.trim());
export const isValidEmail = (value: string) =>
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value.trim());
export const isValidAge = (value: string, min = 0, max = 120) => {
  const age = Number(value);
  return /^\d+$/.test(value) && age >= min && age <= max;
};
export const isValidPassword = (value: string) =>
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&.#_-]{8,72}$/.test(value);

export const clampPastDate = (value: string) => {
  const today = new Date().toISOString().split('T')[0];
  return value > today ? today : value;
};
