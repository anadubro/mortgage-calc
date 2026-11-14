import { useMemo, useState } from 'react'
import { DEFAULTS, type Params } from '../types'
import { calc } from '../utils/mortgage'

const LIMITS = {
  price: [100_000, 1_000_000_000], downPct: [0, 99], rate: [0.1, 50], years: [1, 50],
} as const

const clamp = (v: number, [min, max]: readonly [number, number]) => Math.min(max, Math.max(min, v))

export function useMortgage() {
  const [params, setParams] = useState<Params>(DEFAULTS)
  // Вторая ставка для сравнения. null — сравнение выключено
  const [rate2, setRate2] = useState<number | null>(null)

  const result = useMemo(() => calc(params), [params])
  // Второй вариант: все параметры те же, отличается только ставка
  const result2 = useMemo(() => (rate2 === null ? null : calc({ ...params, rate: rate2 })), [params, rate2])

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

  const addRate2 = () => setRate2(Math.max(0.1, +(params.rate - 2).toFixed(1)))
  const changeRate2 = (v: number) => setRate2(clamp(v, LIMITS.rate))
  const removeRate2 = () => setRate2(null)

  return { params, result, update, rate2, result2, addRate2, changeRate2, removeRate2 }
}
