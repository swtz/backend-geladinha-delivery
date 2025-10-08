export const START_TIME = 9;
export const END_TIME = 18;
export const CURRENT_SHORT_DATE = new Date().toLocaleString('BR', {
  dateStyle: 'short',
});
export const IS_ANOTHER_DAY = END_TIME < START_TIME;
