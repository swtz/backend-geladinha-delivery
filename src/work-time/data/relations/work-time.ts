export const tiny = {
  user: true,
};

export const essencial = {
  ...tiny,
  places: true,
};

export const full = {
  ...tiny,
  places: { workTimes: true, owners: true },
};
