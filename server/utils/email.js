const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

const isGmailAddress = (email) => /^[a-z0-9._%+-]+@gmail\.com$/.test(normalizeEmail(email));

const isDuplicateEmailError = (error) =>
  error?.code === 11000 && String(error?.message || '').includes('email');

module.exports = { normalizeEmail, isGmailAddress, isDuplicateEmailError };
