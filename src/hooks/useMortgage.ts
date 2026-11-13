import { useMemo, useState } from 'react'
import { DEFAULTS, type Params } from '../types'
import { calc } from '../utils/mortgage'

const LIMITS = {
  price: [100_000, 1_000_000_000], downPct: [0, 99], rate: [0.1, 50], years: [1, 50],
} as const

const clamp = (v: number, [min, max]: readonly [number, number]) => Math.min(max, Math.max(min, v))

export function useMortgage() {
  const [params, setParams] = useState<Params>(DEFAULTS)
  const result = useMemo(() => calc(params), [params])

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

  return { params, result, update }
}
