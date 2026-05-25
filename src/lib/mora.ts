// Helpers para calcular el recargo por mora
// Reglas:
//  - menos de 5 días de mora: sin recargo
//  - entre 5 y 14 días: 10% del capital prestado
//  - 15 días o más: 20% del capital prestado
// Si el préstamo tiene `mora_waived = true`, el recargo siempre es 0.

export function daysLate(paymentDateIso: string, to: Date = new Date()): number {
  const a = new Date(paymentDateIso + "T00:00:00");
  const ms = to.getTime() - a.getTime();
  return Math.floor(ms / 86400000);
}

export function moraPercent(days: number): number {
  if (days >= 15) return 20;
  if (days >= 5) return 10;
  return 0;
}

export interface MoraInput {
  amount: number; // capital prestado
  payment_date: string;
  mora_waived?: boolean | null;
  status?: string;
}

export interface MoraResult {
  days: number;
  percent: number;
  fee: number;
  waived: boolean;
}

export function calcMora(loan: MoraInput, to: Date = new Date()): MoraResult {
  const days = Math.max(0, daysLate(loan.payment_date, to));
  const waived = !!loan.mora_waived;
  if (waived || loan.status === "pagado") {
    return { days, percent: 0, fee: 0, waived };
  }
  const percent = moraPercent(days);
  const fee = +(Number(loan.amount) * (percent / 100)).toFixed(2);
  return { days, percent, fee, waived };
}

export function totalDue(expected: number, fee: number): number {
  return +(Number(expected) + Number(fee)).toFixed(2);
}