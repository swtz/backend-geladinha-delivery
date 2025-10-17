export function formatPhone(parsedPhone: string) {
  const cleanedPhone = parsedPhone
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll('-', '')
    .replaceAll('/', '')
    .trim()
    .split(' ')
    .join('');

  if (cleanedPhone.length === 11) {
    return `+55${cleanedPhone}`;
  }

  if (!cleanedPhone.startsWith('+')) {
    return `+${cleanedPhone}`;
  }
  return cleanedPhone;
}
