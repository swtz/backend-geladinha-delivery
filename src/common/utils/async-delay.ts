export async function asyncDelay(milliseconds: number = 0) {
  if (milliseconds <= 0) return;

  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
