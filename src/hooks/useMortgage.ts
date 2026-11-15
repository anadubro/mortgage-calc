import { useMemo, useState } from 'react'
import { DEFAULTS, type Params, type Variant } from '../types'
import { calc } from '../utils/mortgage'

const LIMITS = {
  price: [100_000, 1_000_000_000], downPct: [0, 99], rate: [0.1, 50], years: [1, 50],
} as const

const clamp = (v: number, [min, max]: readonly [number, number]) => Math.min(max, Math.max(min, v))

export function useMortgage() {
  const [params, setParams] = useState<Params>(DEFAULTS)
  // Второй вариант (своя цена и ставка). null — сравнение выключено
  const [variant2, setVariant2] = useState<Variant | null>(null)

  const result = useMemo(() => calc(params), [params])
  // Остальные параметры (взнос %, срок, тип) берём из основной формы
  const result2 = useMemo(
    () => (variant2 === null ? null : calc({ ...params, price: variant2.price, rate: variant2.rate })),
    [params, variant2],
  )

  const update = (patch: Partial<Params>) =>
    setParams(prev => {
      const next = { ...prev, ...patch }
      return {
        ...next,
        price: clamp(next.price, LIMITS.price),
        downPct: clamp(next.downPct, LIMITS.downPct),
        rate: clamp(next.rate, LIMITS.rate),
        years: Math.round(clamp(next.years, LIMITS.years)),
      }
    })

  const addVariant2 = () =>
    setVariant2({ price: params.price, rate: Math.max(0.1, +(params.rate - 2).toFixed(1)) })

  const changeVariant2 = (patch: Partial<Variant>) =>
    setVariant2(prev =>
      prev && {
        price: patch.price !== undefined ? clamp(patch.price, LIMITS.price) : prev.price,
        rate: patch.rate !== undefined ? clamp(patch.rate, LIMITS.rate) : prev.rate,
      },
    )

  const removeVariant2 = () => setVariant2(null)

  return { params, result, update, variant2, result2, addVariant2, changeVariant2, removeVariant2 }
}
