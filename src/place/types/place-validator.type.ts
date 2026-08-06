export type CreatePlaceDtoForValidator = {
  code: string;
  name: string;
  businessName: string;
  cnpj: string;
  cpf: string | undefined;
  phone: string;
  secondPhone: string | undefined;
  email: string;
};
