export const essencial = {
  motorcycle: true,
};

export const full = {
  ...essencial,
  user: { roles: true, vouchers: true },
  tips: true,
};
