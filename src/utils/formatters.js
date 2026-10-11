import { CURRENCIES } from '../constants/currencies'

export const formatCurrency = (amount, currencyCode = 'PHP') => {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
  const val = Number(amount) || 0
  
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val)
  } catch {
    return `${currency.symbol}${val.toFixed(2)}`
  }
}

export const getCurrencySymbol = (currencyCode = 'PHP') => {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
  return currency.symbol || '₱'
}

export const formatDate = (dateString, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!dateString) return ''
  try {
    const [y, m, d] = dateString.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('en-US', options)
  } catch {
    return dateString
  }
}

export const formatPercent = (val) => {
  const num = Number(val) || 0
  return `${Math.round(num)}%`
}

export const getMonthName = (monthIndex) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[monthIndex] || ''
}
