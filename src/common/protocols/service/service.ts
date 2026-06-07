export interface Service {
  transformDtoFields(dto: Record<string, unknown>): void;
}
