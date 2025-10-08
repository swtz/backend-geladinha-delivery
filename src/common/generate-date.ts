export function generateYesterdayDate(date: Date = new Date()) {
  const auxDate = new Date(date);
  const yesterday = auxDate.setDate(date.getDate() - 1);
  return new Date(yesterday);
}

export function generateTomorrowDate(date: Date = new Date()) {
  const auxDate = new Date(date);
  const tomorrow = auxDate.setDate(date.getDate() + 1);
  return new Date(tomorrow);
}
