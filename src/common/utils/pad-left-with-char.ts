export function padLeftWithChar(
  value: string | number,
  char: string,
  length: number = 2,
) {
  return `${value}`.padStart(length, char);
}
