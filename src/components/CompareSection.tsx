import type { Params, Result, Variant } from '../types'
import { formatMoney } from '../utils/mortgage'
import { variantLabel } from '../utils/format'

interface Props {
  params: Params
  result: Result
  variant2: Variant
  result2: Result
}

// Разница = второй вариант минус первый. Для платежей меньше — лучше (зелёный)
function Row({ label, a, b, colored = true }: { label: string; a: number; b: number; colored?: boolean }) {
  const d = b - a
  const sign = d === 0 ? '' : d > 0 ? '+' : '−'
  const cls = !colored ? '' : d < 0 ? 'good' : d > 0 ? 'bad' : ''
  return (
    <tr>
      <td>{label}</td>
      <td>{formatMoney(a)}</td>
      <td>{formatMoney(b)}</td>
      <td className={cls}>{sign}{formatMoney(Math.abs(d))}</td>
    </tr>
  )
}

export function CompareSection({ params, result, variant2, result2 }: Props) {
  const isDiff = params.type === 'diff'
  return (
    <div className="compare-scroll">
      <table className="compare-table">
        <thead>
          <tr>
            <th></th>
            <th>{variantLabel(params.price, params.rate)}</th>
            <th>{variantLabel(variant2.price, variant2.rate)}</th>
            <th>Разница</th>
          </tr>
        </thead>
        <tbody>
          <Row label="Сумма кредита" a={result.loan} b={result2.loan} colored={false} />
          <Row label={isDiff ? 'Первый платёж' : 'Платёж'} a={result.firstPayment} b={result2.firstPayment} />
          <Row label="Переплата" a={result.totalInterest} b={result2.totalInterest} />
          <Row label="Общая выплата" a={result.totalPayment} b={result2.totalPayment} />
        </tbody>
      </table>
    </div>
  )
}
