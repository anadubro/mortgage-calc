interface Props<T> {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}

export function Segment<T extends string | number>({ options, value, onChange }: Props<T>) {
  return (
    <div className="segment">
      {options.map(o => (
        <button
          key={o.value} type="button"
          className={`segment-btn ${o.value === value ? 'is-active' : ''}`}
          onClick={() => onChange(o.value)}
        >{o.label}</button>
      ))}
    </div>
  )
}
