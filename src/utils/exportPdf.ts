import type { Params, Result, Variant } from '../types'
import { formatMoney, formatPct } from './mortgage'
import { variantLabel } from './format'

export interface PdfData {
  params: Params
  result: Result
  variant2: Variant | null
  result2: Result | null
  chartEl: HTMLElement | null   // блок с графиком Recharts
}

// В PDF заменяем неразрывные пробелы на обычные, чтобы не было "кракозябр"
const clean = (t: string) => t.replace(/[\u00A0\u202F]/g, ' ')
const money = (n: number) => clean(formatMoney(n))
const signed = (d: number) => `${d === 0 ? '' : d > 0 ? '+' : '−'}${money(Math.abs(d))}`

// Загружаем TTF-шрифт и превращаем в base64 (jsPDF умеет брать шрифты только так)
async function loadFont(url: string): Promise<string> {
  const res = await fetch(url)
  const bytes = new Uint8Array(await res.arrayBuffer())
  // Шрифт TTF начинается с байтов 00 01. Если файла нет, сервер отдаёт HTML
  if (!res.ok || bytes.length < 1000 || bytes[0] !== 0 || bytes[1] !== 1) {
    throw new Error(`Шрифт не найден или это не TTF: ${url}`)
  }
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

// SVG-график → PNG (на тёмном фоне, как на сайте)
async function chartToPng(el: HTMLElement): Promise<{ url: string; w: number; h: number } | null> {
  const svg = el.querySelector('.recharts-wrapper > svg') as SVGSVGElement | null
  if (!svg) return null
  const { width, height } = svg.getBoundingClientRect()
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  const img = new Image()
  await new Promise<void>((ok, fail) => {
    img.onload = () => ok()
    img.onerror = () => fail(new Error('Не удалось отрисовать график'))
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone))
  })
  const k = 2   // удвоенное разрешение для чёткости
  const canvas = document.createElement('canvas')
  canvas.width = width * k
  canvas.height = height * k
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#0b1230'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return { url: canvas.toDataURL('image/png'), w: width, h: height }
}

export async function exportPdf({ params, result, variant2, result2, chartEl }: PdfData) {
  // Библиотеки грузим только при клике — сайт открывается быстрее
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const base = import.meta.env.BASE_URL
  const [regular, bold] = await Promise.all([
    loadFont(`${base}fonts/Roboto/Roboto-Regular.ttf`),
    loadFont(`${base}fonts/Roboto/Roboto-Bold.ttf`),
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  doc.addFileToVFS('Roboto-Regular.ttf', regular)
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
  doc.addFileToVFS('Roboto-Bold.ttf', bold)
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold')
  doc.setFont('Roboto')

  const M = 14                                        // поля страницы
  const W = doc.internal.pageSize.getWidth() - M * 2  // ширина контента
  const H = doc.internal.pageSize.getHeight()
  let y = 18

  const finalY = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
  const heading = (text: string) => {
    if (y > H - 40) { doc.addPage(); y = 18 }
    doc.setFont('Roboto', 'bold'); doc.setFontSize(13); doc.setTextColor(20, 24, 50)
    doc.text(text, M, y)
    y += 3
  }
  const table = (head: string[], body: string[][], opts: object = {}) => {
    autoTable(doc, {
      startY: y, head: [head], body, margin: { left: M, right: M },
      styles: { font: 'Roboto', fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [48, 126, 255], font: 'Roboto', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [244, 246, 252] },
      ...opts,
    })
    y = finalY() + 10
  }

  // ── Шапка ──
  doc.setFont('Roboto', 'bold'); doc.setFontSize(20); doc.setTextColor(20, 24, 50)
  doc.text('Расчёт ипотеки', M, y)
  doc.setFont('Roboto', 'normal'); doc.setFontSize(9); doc.setTextColor(120)
  doc.text(new Date().toLocaleDateString('ru-RU'), M + W, y, { align: 'right' })
  y += 10

  // ── Параметры ──
  const isDiff = params.type === 'diff'
  heading('Параметры кредита'); 
  table(['Параметр', 'Значение'], [
    ['Стоимость недвижимости', money(params.price)],
    ['Первоначальный взнос', `${params.downPct}% · ${money(result.downAmount)}`],
    ['Процентная ставка', `${params.rate}% годовых`],
    ['Срок кредита', `${params.years} лет`],
    ['Тип платежа', isDiff ? 'Дифференцированный' : 'Аннуитетный'],
  ], { columnStyles: { 1: { halign: 'right' } } })

  // ── Результат (правая колонка сайта) ──
  heading('Результат расчёта')
  const resultRows = [[isDiff ? 'Первый платёж' : 'Ежемесячный платёж', money(result.firstPayment)]]
  if (isDiff) resultRows.push(['Последний платёж', money(result.lastPayment)])
  resultRows.push(
    ['Сумма кредита', money(result.loan)],
    ['Переплата', money(result.totalInterest)],
    ['Общая выплата', money(result.totalPayment)],
    ['Ставка переплаты', formatPct(result.overpaymentPct)],
  )
  table(['Показатель', 'Значение'], resultRows, { columnStyles: { 1: { halign: 'right' } } })

  // ── Таблица сравнения ──
  if (result2 && variant2) {
    heading('Сравнение вариантов')
    const row = (label: string, a: number, b: number) => [label, money(a), money(b), signed(b - a)]
    table(
      ['', variantLabel(params.price, params.rate), variantLabel(variant2.price, variant2.rate), 'Разница'],
      [
        row('Сумма кредита', result.loan, result2.loan),
        row(isDiff ? 'Первый платёж' : 'Платёж', result.firstPayment, result2.firstPayment),
        row('Переплата', result.totalInterest, result2.totalInterest),
        row('Общая выплата', result.totalPayment, result2.totalPayment),
      ],
      { columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } } },
    )
  }

  // ── График ──
  const png = chartEl ? await chartToPng(chartEl) : null
  if (png) {
    const h = (W * png.h) / png.w
    // Если график с легендой не помещается на текущей странице — переносим на новую
    if (y + h + 35 > H) { doc.addPage(); y = 18 }
    heading('Динамика по годам')
    doc.addImage(png.url, 'PNG', M, y, W, h)
    y += h + 6

    // Легенда рисуется вручную (в SVG-графике её нет)
    const items = [
      { t: `Остаток · ${variantLabel(params.price, params.rate)}`, c: [51, 194, 10], dash: false },
      { t: `Проценты · ${variantLabel(params.price, params.rate)}`, c: [225, 29, 29], dash: false },
    ]
    if (variant2) {
      const l2 = variantLabel(variant2.price, variant2.rate)
      items.push({ t: `Остаток · ${l2}`, c: [51, 194, 10], dash: true }, { t: `Проценты · ${l2}`, c: [225, 29, 29], dash: true })
    }
    doc.setFont('Roboto', 'normal'); doc.setFontSize(9); doc.setLineWidth(0.7)
    items.forEach((it, i) => {
      const x = M + (i % 2) * (W / 2)
      const ly = y + Math.floor(i / 2) * 6
      doc.setDrawColor(it.c[0], it.c[1], it.c[2])
      doc.setLineDashPattern(it.dash ? [2, 1.5] : [], 0)
      doc.line(x, ly - 1, x + 9, ly - 1)
      doc.setLineDashPattern([], 0)
      doc.setTextColor(60)
      doc.text(clean(it.t), x + 12, ly)
    })
    y += Math.ceil(items.length / 2) * 6 + 6
  }

  // ── График платежей (по месяцам) ──
  const schedule = (r: Result, title: string) => {
    doc.addPage(); y = 18
    heading(title)
    table(
      ['Месяц', 'Платёж', 'Основной долг', 'Проценты', 'Остаток'],
      r.schedule.map(x => [String(x.month), money(x.payment), money(x.principal), money(x.interest), money(x.balance)]),
      { styles: { font: 'Roboto', fontSize: 8, cellPadding: 1.5 }, columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } } },
    )
  }
  schedule(result, `График платежей · ${variantLabel(params.price, params.rate)}`)
  if (result2 && variant2) schedule(result2, `График платежей · ${variantLabel(variant2.price, variant2.rate)}`)

  // ── Нижний колонтитул на каждой странице ──
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont('Roboto', 'normal'); doc.setFontSize(8); doc.setTextColor(140)
    doc.text('Расчёт носит информационный характер. Условия определяет банк.', M, H - 8)
    doc.text(`${i} / ${pages}`, M + W, H - 8, { align: 'right' })
  }

  doc.save('ipoteka-raschet.pdf')
}
