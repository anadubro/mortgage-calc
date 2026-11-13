import { useRef, useState } from 'react'
import { useMortgage } from './hooks/useMortgage'
import { InputPanel } from './components/InputPanel'
import { ResultPanel } from './components/ResultPanel'
import { BalanceChart } from './components/BalanceChart'
import { ScheduleTable } from './components/ScheduleTable'

export default function App() {
  const { params, result, update } = useMortgage()
  const [tableOpen, setTableOpen] = useState(false)
  const chartRef = useRef<HTMLElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const scrollTo = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="page">
      <header className="topbar">
        <div className="logo">MortgageCalc</div>
        <nav className="nav"><a>Калькулятор</a><a>Сравнить</a><a>Гид</a></nav>
      </header>

      <section className="hero">
        <span className="badge">Точный расчёт за 30 секунд</span>
        <h1>Ипотека без <em>скрытых цифр</em></h1>
        <p>Ежемесячный платёж, переплата и сравнение сценариев — сразу</p>
      </section>

      <main className="layout">
        <InputPanel params={params} downAmount={result.downAmount} update={update}
          onCalculate={() => scrollTo(resultRef.current)} />
        <div ref={resultRef}>
          <ResultPanel params={params} result={result} tableOpen={tableOpen}
            onShowChart={() => scrollTo(chartRef.current)}
            onToggleTable={() => setTableOpen(o => !o)} />
        </div>
      </main>

      <section className="card wide" ref={chartRef}>
        <h2 className="card-title">Динамика по годам</h2>
        <BalanceChart data={result.yearly} />
      </section>

      {tableOpen && (
        <section className="card wide">
          <h2 className="card-title">График платежей</h2>
          <ScheduleTable rows={result.schedule} />
        </section>
      )}

      <footer className="footer">© 2026 MortgageCalc · расчёт носит информационный характер</footer>
    </div>
  )
}
