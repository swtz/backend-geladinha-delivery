type CreateUserDtoForValidator = {
  nickname: string;
  phone: string;
  email: string | undefined;
  secondPhone: string | undefined;
};

export type UserValidators = {
  [K in keyof CreateUserDtoForValidator]: (
    value: NonNullable<CreateUserDtoForValidator[K]>,
  ) => Promise<void>;
};
