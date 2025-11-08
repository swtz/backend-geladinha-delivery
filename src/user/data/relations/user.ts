export const essencialRelations = { roles: true, workTime: true };

export const allRelations = {
  ...essencialRelations,
  tips: true,
  vouchers: { user: true, createdBy: true },
};
