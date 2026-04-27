export const essencial = {
  motorcycle: true,
  workTime: true,
};

export const full = {
  ...essencial,
  user: { roles: true, vouchers: true },
  tips: true,
};
