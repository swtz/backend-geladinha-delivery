export enum Shift {
  Fist = 'madrugada',
  Second = 'manhã',
  Third = 'tarde',
  Forth = 'noite',
  Custom = 'personalizado',
  Default = 'padrão',
  WeekDay = 'semana',
  Weekend = 'final-de-semana',
  Holiday = 'feriado',
}

export const shifts = Object.values(Shift);
