export const tiny = {
  user: true,
  intervalTimes: true,
};

export const essencial = {
  ...tiny,
  places: true,
};

export const full = {
  ...tiny,
  places: { workTimes: true, owners: true },
};
