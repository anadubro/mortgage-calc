import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { YearPoint } from '../types'
import { formatMoney } from '../utils/mortgage'

export function BalanceChart({ data }: { data: YearPoint[] }) {
  const tick = { fill: 'rgba(255,255,255,0.6)', fontSize: 12 }
  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 5" />
        <XAxis dataKey="year" tick={tick} tickFormatter={y => `${y} г.`} />
        <YAxis tick={tick} tickFormatter={v => `${(v / 1e6).toFixed(1)} млн`} width={70} />
        <Tooltip
          formatter={(v: number) => formatMoney(v)}
          labelFormatter={y => `${y}-й год`}
          contentStyle={{ background: '#0b1230', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12 }}
        />
        <Legend />
        <Line type="monotone" dataKey="balance" name="Остаток долга" stroke="#33c20a" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="paidInterest" name="Выплачено процентов" stroke="#e11d1d" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
