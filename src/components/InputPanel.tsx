import type { Params } from '../types'
import { formatMoney } from '../utils/mortgage'
import { Field } from './Field'
import { Segment } from './Segment'

interface Props {
  params: Params
  downAmount: number
  update: (p: Partial<Params>) => void
  onCalculate: () => void
}

const YEARS = [5, 10, 15, 20, 25, 30].map(y => ({ label: String(y), value: y }))
const TYPES = [
  { label: 'Аннуитетный', value: 'annuity' as const },
  { label: 'Дифференцированный', value: 'diff' as const },
]

export function InputPanel({ params, downAmount, update, onCalculate }: Props) {
  return (
    <section className="card">
      <h2 className="card-title">Параметры кредита</h2>

      <div className="field">
        <div className="field-head"><span>Стоимость недвижимости</span><b>{formatMoney(params.price)}</b></div>
        <Field prefix="₽" value={params.price} onChange={v => update({ price: v })} />
      </div>

      <div className="field">
        <div className="field-head"><span>Первоначальный взнос</span><b>{params.downPct}% · {formatMoney(downAmount)}</b></div>
        <Field prefix="%" value={params.downPct} onChange={v => update({ downPct: v })} />
      </div>

      <div className="field">
        <div className="field-head"><span>Процентная ставка</span><b>{params.rate}% годовых</b></div>
        <Field prefix="%" value={params.rate} onChange={v => update({ rate: v })} />
      </div>

      <div className="field">
        <div className="field-head"><span>Срок кредита</span></div>
        <Field prefix="лет" value={params.years} onChange={v => update({ years: v })} />
        <Segment options={YEARS} value={params.years} onChange={y => update({ years: y })} />
      </div>

      <div className="field">
        <div className="field-head"><span>Тип платежа</span></div>
        <Segment options={TYPES} value={params.type} onChange={t => update({ type: t })} />
      </div>

      <button type="button" className="btn btn-main" onClick={onCalculate}>Рассчитать ипотеку</button>
    </section>
  )
}
