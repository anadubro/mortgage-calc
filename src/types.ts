export type PaymentType = 'annuity' | 'diff'

export interface Params {
  price: number      // стоимость недвижимости, ₽
  downPct: number    // первоначальный взнос, %
  rate: number       // годовая ставка, %
  years: number      // срок, лет
  type: PaymentType
}

export interface Row {
  month: number
  payment: number
  principal: number  // часть платежа в тело долга
  interest: number   // часть платежа в проценты
  balance: number    // остаток долга
}

export interface YearPoint {
  year: number
  balance: number          // остаток долга на конец года
  paidInterest: number     // проценты, выплаченные нарастающим итогом
}

export interface Result {
  loan: number
  downAmount: number
  firstPayment: number
  lastPayment: number
  totalPayment: number
  totalInterest: number
  overpaymentPct: number
  schedule: Row[]
  yearly: YearPoint[]
}

export const DEFAULTS: Params = { price: 8_500_000, downPct: 20, rate: 16.5, years: 20, type: 'annuity' }
