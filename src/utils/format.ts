// 10000000 → "10 млн ₽", 12500000 → "12,5 млн ₽"
export function formatShortMoney(n: number): string {
  if (n >= 1_000_000) {
    const m = Math.round((n / 1_000_000) * 100) / 100
    return `${String(m).replace('.', ',')} млн ₽`
  }
  return `${Math.round(n / 1000)} тыс. ₽`
}

// Подпись варианта для таблицы, графика и табов: "10 млн ₽ · 18%"
export const variantLabel = (price: number, rate: number) => `${formatShortMoney(price)} · ${rate}%`
