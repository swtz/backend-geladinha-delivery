export function generateRelativeDate(
  day: 'yesterday' | 'tomorrow',
  date: Date = new Date(),
  hour?: number,
) {
  const relativeDay =
    day === 'yesterday' ? date.getDate() - 1 : date.getDate() + 1;
  const timestamp = new Date(date).setDate(relativeDay);
  const newDate = new Date(timestamp);
  newDate.setHours(hour || date.getHours());
  return newDate;
}
