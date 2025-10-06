export function generateYesterdayDate(date: Date = new Date()) {
  const yesterday = new Date().setDate(date.getDate() - 1);
  return new Date(yesterday);
}
