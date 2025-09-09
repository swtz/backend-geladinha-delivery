export enum PaymentMethod {
  Money = 'money',
  Credit = 'credit',
  Debit = 'debit',
  Pix = 'pix',
}

export const paymentMethods = Object.values(PaymentMethod);
