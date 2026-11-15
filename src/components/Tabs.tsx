interface Props<T> {
  tabs: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}

export function Tabs<T extends string | number>({ tabs, value, onChange }: Props<T>) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(t => (
        <button
          key={t.value} type="button" role="tab" aria-selected={t.value === value}
          className={`tab-button ${t.value === value ? 'is-active' : ''}`}
          onClick={() => onChange(t.value)}
        >{t.label}</button>
      ))}
    </div>
  )
}
