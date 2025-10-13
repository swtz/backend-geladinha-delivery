export function formatBrPostalCode(parsedPostalCode: string) {
  if (!parsedPostalCode.includes('-')) {
    const start = parsedPostalCode.substring(0, 5);
    const end = parsedPostalCode.substring(5);
    return `${start}-${end}`;
  }
  return parsedPostalCode;
}
