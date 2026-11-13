import type { Row } from '../types'
import { formatMoney } from '../utils/mortgage'

export function ScheduleTable({ rows }: { rows: Row[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Месяц</th><th>Платёж</th><th>Основной долг</th><th>Проценты</th><th>Остаток</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.month}>
              <td>{r.month}</td><td>{formatMoney(r.payment)}</td><td>{formatMoney(r.principal)}</td>
              <td>{formatMoney(r.interest)}</td><td>{formatMoney(r.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
