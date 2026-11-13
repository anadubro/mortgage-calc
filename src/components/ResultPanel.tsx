import type { Params, Result } from '../types'
import { formatMoney, formatPct } from '../utils/mortgage'

interface Props {
  params: Params
  result: Result
  onShowChart: () => void
  onToggleTable: () => void
  tableOpen: boolean
}

export function ResultPanel({ params, result, onShowChart, onToggleTable, tableOpen }: Props) {
  const isDiff = params.type === 'diff'
  const label = isDiff ? 'Первый платёж' : 'Ежемесячный платёж'
  const sub = `${isDiff ? 'Дифференцированный' : 'Аннуитетный'} · ${params.years} лет · ${params.rate}%`

  return (
    <section className="card" id="result">
      <h2 className="card-title">Результат расчёта</h2>

      <div className="hero-result">
        <span>{label}</span>
        <strong>{formatMoney(result.firstPayment)}</strong>
        <small>{sub}</small>
        {isDiff && <small>Последний платёж: {formatMoney(result.lastPayment)}</small>}
      </div>

      <div className="stats">
        <div className="stat"><span>Сумма кредита</span><b>{formatMoney(result.loan)}</b></div>
        <div className="stat"><span>Переплата</span><b className="bad">{formatMoney(result.totalInterest)}</b></div>
        <div className="stat"><span>Общая выплата</span><b>{formatMoney(result.totalPayment)}</b></div>
        <div className="stat"><span>Ставка переплаты</span><b className="bad">{formatPct(result.overpaymentPct)}</b></div>
      </div>

      <p className="card-sub">Подробная информация</p>
      <button type="button" className="btn" onClick={onShowChart}>Посмотреть на графике</button>
      <button type="button" className="btn" onClick={onToggleTable}>
        {tableOpen ? 'Скрыть график платежей' : 'График платежей'}
      </button>
    </section>
  )
}
