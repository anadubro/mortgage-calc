import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { YearPoint } from '../types'
import { formatMoney } from '../utils/mortgage'

interface Props {
  data: YearPoint[]
  rate: number
  data2?: YearPoint[]   // данные второго варианта (если включено сравнение)
  rate2?: number
}

export function BalanceChart({ data, rate, data2, rate2 }: Props) {
  const tick = { fill: 'rgba(255,255,255,0.6)', fontSize: 12 }

  // Склеиваем два варианта в одну таблицу: balance/paidInterest и balance2/paidInterest2
  const merged = data.map((p, i) => ({
    year: p.year,
    balance: p.balance,
    paidInterest: p.paidInterest,
    balance2: data2?.[i]?.balance,
    paidInterest2: data2?.[i]?.paidInterest,
  }))

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={merged} margin={{ top: 10, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 5" />
        <XAxis dataKey="year" tick={tick} tickFormatter={y => `${y} г.`} />
        <YAxis tick={tick} tickFormatter={v => `${(v / 1e6).toFixed(1)} млн`} width={70} />
        <Tooltip
          formatter={(v: number) => formatMoney(v)}
          labelFormatter={y => `${y}-й год`}
          contentStyle={{ background: '#0b1230', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12 }}
        />
        <Legend />
        <Line type="monotone" dataKey="balance" name={`Остаток долга (${rate}%)`} stroke="#33c20a" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="paidInterest" name={`Проценты (${rate}%)`} stroke="#e11d1d" strokeWidth={2.5} dot={false} />
        {data2 && (
          <Line type="monotone" dataKey="balance2" name={`Остаток долга (${rate2}%)`} stroke="#33c20a" strokeWidth={2.5} strokeDasharray="8 6" dot={false} />
        )}
        {data2 && (
          <Line type="monotone" dataKey="paidInterest2" name={`Проценты (${rate2}%)`} stroke="#e11d1d" strokeWidth={2.5} strokeDasharray="8 6" dot={false} />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
