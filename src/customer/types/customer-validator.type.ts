type CreateCustomerDtoForValidator = {
  nickname: string;
  phone: string;
  email: string | undefined;
  secondPhone: string | undefined;
};

export type CustomerValidators = {
  [K in keyof CreateCustomerDtoForValidator]: (
    value: NonNullable<CreateCustomerDtoForValidator[K]>,
  ) => Promise<void>;
};
