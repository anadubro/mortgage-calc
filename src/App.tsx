import { useRef, useState } from 'react'
import { useMortgage } from './hooks/useMortgage'
import { InputPanel } from './components/InputPanel'
import { ResultPanel } from './components/ResultPanel'
import { BalanceChart } from './components/BalanceChart'
import { ScheduleTable } from './components/ScheduleTable'
import { Segment } from './components/Segment'

export default function App() {
  const { params, result, update, rate2, result2, addRate2, changeRate2, removeRate2 } = useMortgage()
  const [tableVariant, setTableVariant] = useState<1 | 2>(1)

  const chartRef = useRef<HTMLElement>(null)
  const tableRef = useRef<HTMLElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const scrollTo = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  // Какой вариант показываем в таблице платежей
  const showSecond = tableVariant === 2 && result2 !== null
  const tableRows = showSecond ? result2!.schedule : result.schedule

  return (
    <div className="page">
      <header className="topbar">
        <div className="logo">
          <img src="./public/logo.svg" alt="Логотип" width='50' height='50' />
          <p>MortgageCalc</p>
        </div>
      </header>

      <section className="hero">
        <h1>Ипотека без <em>скрытых цифр</em></h1>
        <p>Ежемесячный платёж, переплата и сравнение сценариев</p>
      </section>

      <main className="layout">
        <InputPanel
          params={params} downAmount={result.downAmount} update={update}
          onCalculate={() => scrollTo(resultRef.current)}
          rate2={rate2} onAddRate2={addRate2} onChangeRate2={changeRate2} onRemoveRate2={removeRate2}
        />
        <div ref={resultRef}>
          <ResultPanel
            params={params} result={result} rate2={rate2} result2={result2}
            onShowChart={() => scrollTo(chartRef.current)}
            onShowTable={() => scrollTo(tableRef.current)}
          />
        </div>
      </main>

      <section className="card wide scroll-target" ref={chartRef}>
        <h2 className="card-title">Динамика по годам</h2>
        <BalanceChart data={result.yearly} rate={params.rate} data2={result2?.yearly} rate2={rate2 ?? undefined} />
      </section>

      <section className="card wide scroll-target" ref={tableRef}>
        <h2 className="card-title">График платежей</h2>
        {result2 && rate2 !== null && (
          <Segment
            options={[
              { label: `Ставка ${params.rate}%`, value: 1 as const },
              { label: `Ставка ${rate2}%`, value: 2 as const },
            ]}
            value={showSecond ? 2 : 1}
            onChange={setTableVariant}
          />
        )}
        <ScheduleTable rows={tableRows} />
      </section>

      <footer className="footer">© 2026 MortgageCalc · расчёт носит информационный характер</footer>
    </div>
  )
}
