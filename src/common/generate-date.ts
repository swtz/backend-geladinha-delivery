export function generateYesterdayDate(date: Date = new Date()) {
  const yesterday = date.setDate(date.getDate() - 1);
  return new Date(yesterday);
}

export function generateTomorrowDate(date: Date = new Date()) {
  const tomorrow = date.setDate(date.getDate() + 1);
  return new Date(tomorrow);
}
