export const essencial = { roles: true, workTime: true };

export const full = {
  ...essencial,
  tips: true,
  vouchers: { user: true, createdBy: true },
};
