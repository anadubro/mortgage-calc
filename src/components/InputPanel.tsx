import type { Params, Variant } from '../types'
import { formatMoney } from '../utils/mortgage'
import { Field } from './Field'
import { Segment } from './Segment'

interface Props {
  params: Params
  downAmount: number
  update: (p: Partial<Params>) => void
  onCalculate: () => void
  variant2: Variant | null
  onAddVariant2: () => void
  onChangeVariant2: (patch: Partial<Variant>) => void
  onRemoveVariant2: () => void
}

const YEARS = [5, 10, 15, 20, 25, 30].map(y => ({ label: String(y), value: y }))
const TYPES = [
  { label: 'Аннуитетный', value: 'annuity' as const },
  { label: 'Дифференцированный', value: 'diff' as const },
]

export function InputPanel({
  params, downAmount, update, onCalculate, variant2, onAddVariant2, onChangeVariant2, onRemoveVariant2,
}: Props) {
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

      {variant2 === null ? (
        <button type="button" className="btn btn-ghost" onClick={onAddVariant2}>
          + Добавить вариант для сравнения
        </button>
      ) : (
        <div className="field field-compare">
          <div className="field-head">
            <span>Вариант 2 (пунктир на графике)</span>
            <button type="button" className="del-btn" onClick={onRemoveVariant2}>Убрать</button>
          </div>
          <div className="field-head"><span>Стоимость</span><b>{formatMoney(variant2.price)}</b></div>
          <Field prefix="₽" value={variant2.price} onChange={v => onChangeVariant2({ price: v })} />
          <div className="field-head field-head--gap"><span>Ставка</span><b>{variant2.rate}% годовых</b></div>
          <Field prefix="%" value={variant2.rate} onChange={v => onChangeVariant2({ rate: v })} />
        </div>
      )}

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
