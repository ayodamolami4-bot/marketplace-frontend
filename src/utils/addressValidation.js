import countries from './countries.json';

export { countries };

export function validateAddress(address) {
  const placeName = /^(?=.*\p{L})[\p{L}\p{M} .'-]+$/u;
  for (const [field, label] of [['recipientName', 'Recipient name'], ['city', 'City'], ['state', 'State']]) {
    const value = (address[field] || '').trim();
    if (!value || value.length > 100 || !placeName.test(value)) {
      return `${label} must contain letters, spaces or name punctuation (up to 100 characters).`;
    }
  }
  const phone = (address.phoneNumber || '').trim();
  const digits = phone.replace(/\D/g, '').length;
  if (!/^\+?[0-9 ()-]+$/.test(phone) || phone.length > 30 || digits < 7 || digits > 15) {
    return 'Phone number must contain 7 to 15 digits, with optional +, spaces, parentheses or hyphens.';
  }
  const line = (address.addressLine || '').trim();
  if (line.length < 5 || line.length > 255 || !/\p{L}/u.test(line)) {
    return 'Address must contain a street or location name and be 5 to 255 characters long.';
  }
  if (!countries.includes(address.country)) return 'Choose a recognised country.';
  if ((address.postalCode || '').length > 20) return 'Postal code must be at most 20 characters.';
  return '';
}
