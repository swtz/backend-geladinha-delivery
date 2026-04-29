export const essencial = { roles: true, workTime: true };

export const full = {
  ...essencial,
  vouchers: { user: true, createdBy: true },
};
