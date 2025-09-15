export function setDecimalPlaces(number: number, fractionDigits: number) {
  return +number.toFixed(fractionDigits);
}
