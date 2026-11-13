import type { Params, Result, Row, YearPoint } from '../types'

const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })
export const formatMoney = (n: number) => rub.format(Math.round(n))
export const formatPct = (n: number) => `${n.toFixed(1)}%`

/**
 * Аннуитетный платёж: M = P * r(1+r)^n / ((1+r)^n - 1)
 * P — сумма кредита, r — месячная ставка, n — число месяцев.
 */
export function annuityPayment(P: number, r: number, n: number): number {
  if (r === 0) return P / n
  const k = Math.pow(1 + r, n)
  return (P * r * k) / (k - 1)
}

/**
 * График платежей.
 * Аннуитет: платёж постоянный, проценты = остаток * r, тело = платёж - проценты.
 * Дифференцированный: тело постоянное (P/n), платёж = тело + остаток * r.
 */
export function buildSchedule(P: number, r: number, n: number, type: Params['type']): Row[] {
  const rows: Row[] = []
  const fixed = annuityPayment(P, r, n)
  let balance = P
  for (let month = 1; month <= n; month++) {
    const interest = balance * r
    const principal = type === 'annuity' ? fixed - interest : P / n
    const payment = principal + interest
    balance = month === n ? 0 : Math.max(0, balance - principal)
    rows.push({ month, payment, principal, interest, balance })
  }
  return rows
}

export function calc(p: Params): Result {
  const downAmount = p.price * (p.downPct / 100)
  const loan = p.price - downAmount
  const n = p.years * 12
  const r = p.rate / 100 / 12
  const schedule = buildSchedule(loan, r, n, p.type)

  const totalPayment = schedule.reduce((s, x) => s + x.payment, 0)
  const totalInterest = totalPayment - loan

  const yearly: YearPoint[] = []
  let paidInterest = 0
  schedule.forEach(row => {
    paidInterest += row.interest
    if (row.month % 12 === 0) yearly.push({ year: row.month / 12, balance: row.balance, paidInterest })
  })

  return {
    loan, downAmount, totalPayment, totalInterest,
    firstPayment: schedule[0].payment,
    lastPayment: schedule[schedule.length - 1].payment,
    overpaymentPct: loan > 0 ? (totalInterest / loan) * 100 : 0,
    schedule, yearly,
  }
}
