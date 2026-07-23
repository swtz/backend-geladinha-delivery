export const essencial = { roles: true, workTime: true, intervalTime: true };

export const full = {
  ...essencial,
  vouchers: { user: true, createdBy: true },
};
