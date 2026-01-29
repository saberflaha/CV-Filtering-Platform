
export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone: string) => {
  // Simple check for digits, spaces, dashes, and plus sign
  return /^[\d\s\-+]{7,15}$/.test(phone);
};

export const validateRequired = (val: string) => {
  return val.trim().length > 0;
};

export const validateSalary = (salary: string) => {
  // Basic validation to check if it has a number-like structure
  return /[0-9]/.test(salary);
};
