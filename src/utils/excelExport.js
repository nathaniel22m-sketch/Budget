import * as XLSX from 'xlsx'
import { formatCurrency, formatPercent } from './formatters'

/**
 * Exports data into a rich multi-sheet Excel (.xlsx) workbook.
 */
export const exportToExcel = ({
  transactions,
  categories,
  categoryBudgets,
  accounts = [],
  debts = [],
  currency = 'USD',
  filename = 'Budget_Report.xlsx'
}) => {
  const categoryMap = new Map(categories.map(c => [c.id, c]))

  // 1. Transactions Sheet
  const txRows = transactions.map(t => {
    const cat = categoryMap.get(t.categoryId)
    return {
      'Date': t.date,
      'Type': t.type === 'income' ? 'Income' : 'Expense',
      'Category': cat ? cat.name : 'Uncategorized',
      'Title / Description': t.title,
      'Amount': t.amount,
      'Payment Method': t.paymentMethod || 'N/A',
      'Tags': Array.isArray(t.tags) ? t.tags.join(', ') : (t.tags || ''),
      'Notes': t.notes || ''
    }
  })

  const wsTransactions = XLSX.utils.json_to_sheet(txRows)
  wsTransactions['!cols'] = [
    { wch: 12 },
    { wch: 10 },
    { wch: 22 },
    { wch: 30 },
    { wch: 12 },
    { wch: 16 },
    { wch: 20 },
    { wch: 35 }
  ]

  // 2. Category Budget Sheet
  const expenseCategories = categories.filter(c => c.type === 'expense')
  const budgetRows = expenseCategories.map(cat => {
    const spent = transactions
      .filter(t => t.categoryId === cat.id && t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    const limit = Number(categoryBudgets[cat.id] ?? cat.defaultLimit) || 0
    const remaining = limit - spent
    const percent = limit > 0 ? (spent / limit) * 100 : 0
    let status = 'No Limit'
    if (limit > 0) {
      if (percent >= 100) status = 'OVER BUDGET'
      else if (percent >= 75) status = 'Warning (>75%)'
      else status = 'Safe'
    }

    return {
      'Category': cat.name,
      'Monthly Budget Limit': limit,
      'Actual Spent': spent,
      'Remaining Balance': remaining,
      '% Used': `${percent.toFixed(1)}%`,
      'Status': status
    }
  })

  const wsBudgets = XLSX.utils.json_to_sheet(budgetRows)
  wsBudgets['!cols'] = [
    { wch: 24 },
    { wch: 20 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 }
  ]

  // 3. Monthly Summary Sheet
  const monthMap = {}
  transactions.forEach(t => {
    const ym = t.date ? t.date.substring(0, 7) : 'Unknown'
    if (!monthMap[ym]) {
      monthMap[ym] = { income: 0, expense: 0 }
    }
    const amt = Number(t.amount) || 0
    if (t.type === 'income') {
      monthMap[ym].income += amt
    } else {
      monthMap[ym].expense += amt
    }
  })

  const sortedMonths = Object.keys(monthMap).sort().reverse()
  const summaryRows = sortedMonths.map(ym => {
    const data = monthMap[ym]
    const net = data.income - data.expense
    const savingsRate = data.income > 0 ? ((net / data.income) * 100).toFixed(1) : '0.0'
    return {
      'Month': ym,
      'Total Income': data.income,
      'Total Expenses': data.expense,
      'Net Savings': net,
      'Savings Rate (%)': `${savingsRate}%`
    }
  })

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows)
  wsSummary['!cols'] = [
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 }
  ]

  // Create workbook and append sheets
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions')
  XLSX.utils.book_append_sheet(wb, wsBudgets, 'Category Budgets')
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Monthly Summary')

  // 4. Accounts & Cards Sheet
  if (accounts && accounts.length > 0) {
    const accRows = accounts.map(a => {
      const isCard = a.type === 'Credit Card'
      const limit = isCard ? (Number(a.creditLimit) || 0) : 'N/A'
      const available = isCard ? Math.max(0, (Number(a.creditLimit) || 0) - (Number(a.balance) || 0)) : 'N/A'
      const utilization = (isCard && Number(a.creditLimit) > 0)
        ? `${((Number(a.balance) / Number(a.creditLimit)) * 100).toFixed(1)}%`
        : 'N/A'

      return {
        'Account / Card Name': a.name,
        'Type': a.type,
        'Institution': a.institution || '',
        'Account Number': a.accountNumber || '',
        'Current Balance / Owed': a.balance,
        'Credit Limit': limit,
        'Available Credit': available,
        'Credit Utilization': utilization
      }
    })
    const wsAccounts = XLSX.utils.json_to_sheet(accRows)
    wsAccounts['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 22 }, { wch: 16 }, { wch: 18 }, { wch: 18 }]
    XLSX.utils.book_append_sheet(wb, wsAccounts, 'Bank Accounts & Cards')
  }

  // 5. Debts Sheet
  if (debts && debts.length > 0) {
    const debtRows = debts.map(d => {
      const paid = Math.max(0, d.initialAmount - d.currentBalance)
      const pct = d.initialAmount > 0 ? ((paid / d.initialAmount) * 100).toFixed(1) : '0'
      return {
        'Debt Name': d.name,
        'Category': d.category || '',
        'Lender / Institution': d.lender || '',
        'Initial Borrowed': d.initialAmount,
        'Current Remaining': d.currentBalance,
        'Paid Off %': `${pct}%`,
        'Interest Rate (APR)': `${d.interestRate || 0}%`,
        'Monthly Min Payment': d.minimumPayment || 0,
        'Due Day': d.dueDate || '',
        'Notes': d.notes || ''
      }
    })
    const wsDebts = XLSX.utils.json_to_sheet(debtRows)
    wsDebts['!cols'] = [{ wch: 24 }, { wch: 16 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 12 }, { wch: 30 }]
    XLSX.utils.book_append_sheet(wb, wsDebts, 'Debts & Loans')
  }

  // Save/Download Excel file
  XLSX.writeFile(wb, filename)
}

/**
 * Exports transactions to standard CSV with UTF-8 BOM for Excel compatibility.
 */
export const exportToCSV = ({
  transactions,
  categories,
  filename = 'Transactions.csv'
}) => {
  const categoryMap = new Map(categories.map(c => [c.id, c]))
  const headers = ['Date', 'Type', 'Category', 'Title', 'Amount', 'Payment Method', 'Tags', 'Notes']

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""'
    const str = String(val).replace(/"/g, '""')
    return `"${str}"`
  }

  const rows = transactions.map(t => {
    const cat = categoryMap.get(t.categoryId)
    return [
      escapeCSV(t.date),
      escapeCSV(t.type),
      escapeCSV(cat ? cat.name : 'Uncategorized'),
      escapeCSV(t.title),
      t.amount,
      escapeCSV(t.paymentMethod || ''),
      escapeCSV(Array.isArray(t.tags) ? t.tags.join(', ') : (t.tags || '')),
      escapeCSV(t.notes || '')
    ].join(',')
  })

  // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows properly displays characters
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export complete application backup as JSON.
 */
export const exportToJSON = (data, filename = 'Budget_Backup.json') => {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Parse CSV text into transaction records.
 */
export const parseCSVTransactions = (csvText, existingCategories) => {
  // Strip BOM if present
  let cleanText = csvText
  if (cleanText.charCodeAt(0) === 0xFEFF) {
    cleanText = cleanText.slice(1)
  }

  const lines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0)
  if (lines.length < 2) return []

  // Very simple CSV row parser respecting quoted fields
  const parseLine = (line) => {
    const result = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const header = parseLine(lines[0]).map(h => h.toLowerCase())
  const dateIdx = header.findIndex(h => h.includes('date'))
  const typeIdx = header.findIndex(h => h.includes('type'))
  const catIdx = header.findIndex(h => h.includes('cat'))
  const titleIdx = header.findIndex(h => h.includes('title') || h.includes('desc'))
  const amountIdx = header.findIndex(h => h.includes('amount'))
  const methodIdx = header.findIndex(h => h.includes('method') || h.includes('pay'))
  const tagsIdx = header.findIndex(h => h.includes('tag'))
  const notesIdx = header.findIndex(h => h.includes('note'))

  const nameToCatId = new Map(existingCategories.map(c => [c.name.toLowerCase(), c.id]))

  const newTransactions = []
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i])
    if (cols.length === 0 || !cols[0]) continue

    const title = titleIdx !== -1 && cols[titleIdx] ? cols[titleIdx] : 'Imported Item'
    const rawAmt = amountIdx !== -1 ? cols[amountIdx].replace(/[^0-9.-]/g, '') : '0'
    const amount = Math.abs(parseFloat(rawAmt) || 0)
    const rawType = (typeIdx !== -1 && cols[typeIdx] ? cols[typeIdx].toLowerCase() : 'expense')
    const type = rawType.includes('inc') ? 'income' : 'expense'
    const catName = catIdx !== -1 && cols[catIdx] ? cols[catIdx].toLowerCase() : ''
    const categoryId = nameToCatId.get(catName) || (type === 'income' ? 'cat-other-inc' : 'cat-other-exp')
    const date = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString().split('T')[0]
    const paymentMethod = methodIdx !== -1 && cols[methodIdx] ? cols[methodIdx] : 'Other'
    const rawTags = tagsIdx !== -1 && cols[tagsIdx] ? cols[tagsIdx].split(',').map(s => s.trim()).filter(Boolean) : []
    const notes = notesIdx !== -1 && cols[notesIdx] ? cols[notesIdx] : 'Imported from CSV'

    newTransactions.push({
      id: 'tx-imp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      title,
      amount,
      type,
      categoryId,
      date,
      paymentMethod,
      tags: rawTags,
      notes
    })
  }

  return newTransactions
}
