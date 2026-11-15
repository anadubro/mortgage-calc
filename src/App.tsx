import { useRef, useState } from 'react'
import { useMortgage } from './hooks/useMortgage'
import { InputPanel } from './components/InputPanel'
import { ResultPanel } from './components/ResultPanel'
import { BalanceChart } from './components/BalanceChart'
import { CompareSection } from './components/CompareSection'
import { ScheduleTable } from './components/ScheduleTable'
import { Tabs } from './components/Tabs'
import { variantLabel } from './utils/format'
import { exportPdf } from './utils/exportPdf'

export default function App() {
  const { params, result, update, variant2, result2, addVariant2, changeVariant2, removeVariant2 } = useMortgage()
  const [tableVariant, setTableVariant] = useState<1 | 2>(1)
  const [exporting, setExporting] = useState(false)

  const chartRef = useRef<HTMLElement>(null)
  const compareRef = useRef<HTMLElement>(null)
  const tableRef = useRef<HTMLElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const scrollTo = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const label1 = variantLabel(params.price, params.rate)
  const label2 = variant2 ? variantLabel(variant2.price, variant2.rate) : undefined

  const showSecond = tableVariant === 2 && result2 !== null
  const tableRows = showSecond ? result2!.schedule : result.schedule

  const downloadPdf = async () => {
    setExporting(true)
    try {
      await exportPdf({ params, result, variant2, result2, chartEl: chartRef.current })
    } catch (e) {
      console.error(e)
      alert('Не удалось создать PDF. Попробуйте ещё раз.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="logo">
          <img src="./public/logo.svg" alt="Логотип" width="50" height="50" />
          <p>MortgageCalc</p>
          </div>
      </header>

      <section className="hero">
        <span className="badge">Точный расчёт за 30 секунд</span>
        <h1>Ипотека без <em>скрытых цифр</em></h1>
        <p>Ежемесячный платёж, переплата и сравнение сценариев — сразу</p>
      </section>

      <main className="layout">
        <InputPanel
          params={params} downAmount={result.downAmount} update={update}
          onCalculate={() => scrollTo(resultRef.current)}
          variant2={variant2} onAddVariant2={addVariant2}
          onChangeVariant2={changeVariant2} onRemoveVariant2={removeVariant2}
        />
        <div ref={resultRef}>
          <ResultPanel
            params={params} result={result} hasCompare={result2 !== null} exporting={exporting}
            onShowChart={() => scrollTo(chartRef.current)}
            onShowCompare={() => scrollTo(compareRef.current)}
            onShowTable={() => scrollTo(tableRef.current)}
            onDownloadPdf={downloadPdf}
          />
        </div>
      </main>

      <section className="card wide scroll-target" ref={chartRef}>
        <h2 className="card-title">Динамика по годам</h2>
        <BalanceChart data={result.yearly} label={label1} data2={result2?.yearly} label2={label2} />
      </section>

      {result2 && variant2 && (
        <section className="card wide scroll-target" ref={compareRef}>
          <h2 className="card-title">Сравнение вариантов</h2>
          <CompareSection params={params} result={result} variant2={variant2} result2={result2} />
        </section>
      )}

      <section className="card wide scroll-target" ref={tableRef}>
        <h2 className="card-title">График платежей</h2>
        {result2 && label2 && (
          <Tabs
            tabs={[{ label: label1, value: 1 as const }, { label: label2, value: 2 as const }]}
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
