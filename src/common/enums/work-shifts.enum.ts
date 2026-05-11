export enum Shift {
  Night = 'madrugada',
  Morning = 'manhã',
  Afternoon = 'tarde',
  Evening = 'noite',
  Custom = 'personalizado',
  Default = 'padrão',
  WeekDay = 'semana',
  Weekend = 'final-de-semana',
  Holiday = 'feriado',
}

export const shifts = Object.values(Shift);
