import { useEffect, useRef, useState } from 'react'

interface Props {
  prefix: string
  value: number
  onChange: (v: number) => void
}

const fmt = (n: number) => n.toLocaleString('ru-RU', { maximumFractionDigits: 2 })

// Поле хранит свой текст, чтобы можно было печатать "4." или стирать всё подряд
export function Field({ prefix, value, onChange }: Props) {
  const [text, setText] = useState(fmt(value))
  const focused = useRef(false)

  useEffect(() => {
    if (!focused.current) setText(fmt(value))
  }, [value])

  const handle = (raw: string) => {
    const clean = raw.replace(/[^\d.,]/g, '').replace(',', '.')
    setText(clean)
    const num = parseFloat(clean)
    if (Number.isFinite(num)) onChange(num)
  }

  return (
    <div className="field-box">
      <span className="field-prefix">{prefix}</span>
      <input
        className="field-input"
        inputMode="decimal"
        value={text}
        onFocus={() => (focused.current = true)}
        onBlur={() => { focused.current = false; setText(fmt(value)) }}
        onChange={e => handle(e.target.value)}
      />
    </div>
  )
}
