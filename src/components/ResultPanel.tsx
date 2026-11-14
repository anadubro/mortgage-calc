import type { Params, Result } from '../types'
import { formatMoney, formatPct } from '../utils/mortgage'

interface Props {
  params: Params
  result: Result
  rate2: number | null
  result2: Result | null
  onShowChart: () => void
  onShowTable: () => void
}

// Строка сравнения: разница = второй вариант минус первый. Меньше — лучше (зелёный)
function CompareRow({ label, a, b }: { label: string; a: number; b: number }) {
  const d = b - a
  const sign = d === 0 ? '' : d > 0 ? '+' : '−'
  return (
    <tr>
      <td>{label}</td>
      <td>{formatMoney(a)}</td>
      <td>{formatMoney(b)}</td>
      <td className={d < 0 ? 'good' : d > 0 ? 'bad' : ''}>{sign}{formatMoney(Math.abs(d))}</td>
    </tr>
  )
}

export function ResultPanel({ params, result, rate2, result2, onShowChart, onShowTable }: Props) {
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

      {result2 && rate2 !== null && (
        <div className="compare">
          <p className="card-sub">Сравнение ставок</p>
          <div className="compare-scroll">
            <table className="compare-table">
              <thead>
                <tr><th></th><th>{params.rate}%</th><th>{rate2}%</th><th>Разница</th></tr>
              </thead>
              <tbody>
                <CompareRow label={isDiff ? 'Первый платёж' : 'Платёж'} a={result.firstPayment} b={result2.firstPayment} />
                <CompareRow label="Переплата" a={result.totalInterest} b={result2.totalInterest} />
                <CompareRow label="Общая выплата" a={result.totalPayment} b={result2.totalPayment} />
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="card-sub">Подробная информация</p>
      <button type="button" className="btn" onClick={onShowChart}>Посмотреть на графике</button>
      <button type="button" className="btn" onClick={onShowTable}>График платежей</button>
    </section>
  )
}
