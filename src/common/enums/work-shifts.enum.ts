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
export const sharedShifts = [
  Shift.Fist,
  Shift.Second,
  Shift.Third,
  Shift.Forth,
];
export const personalShifts = [
  Shift.Custom,
  Shift.Default,
  Shift.WeekDay,
  Shift.Weekend,
  Shift.Holiday,
];
