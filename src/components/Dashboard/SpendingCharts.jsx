import React, { useState, useMemo } from 'react'
import { formatCurrency, formatPercent, getMonthName } from '../../utils/formatters'
import { CategoryIcon } from '../common/CategoryIcon'
import { PieChart, TrendingUp, Calendar, Filter } from 'lucide-react'

export const SpendingCharts = ({
  transactions,
  categories,
  currency = 'USD',
  selectedMonth
}) => {
  const [chartType, setChartType] = useState('monthly') // 'monthly' | 'donut' | 'daily'
  const [hoveredSlice, setHoveredSlice] = useState(null)
  const [hoveredMonth, setHoveredMonth] = useState(null)

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories])

  // Monthly aggregated data (last 6 months)
  const monthlyData = useMemo(() => {
    const months = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = `${getMonthName(d.getMonth())} ${d.getFullYear().toString().slice(2)}`
      months[key] = { key, label, income: 0, expense: 0 }
    }

    transactions.forEach(t => {
      if (!t.date) return
      const ym = t.date.substring(0, 7)
      if (months[ym]) {
        const amt = Number(t.amount) || 0
        if (t.type === 'income') months[ym].income += amt
        else months[ym].expense += amt
      }
    })

    return Object.values(months)
  }, [transactions])

  // Category breakdown for currently filtered transactions or active month
  const categoryBreakdown = useMemo(() => {
    const expenses = transactions.filter(t => {
      if (t.type !== 'expense') return false
      if (selectedMonth && selectedMonth !== 'all') {
        return t.date && t.date.startsWith(selectedMonth)
      }
      return true
    })

    const totalExpense = expenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

    const catTotals = {}
    expenses.forEach(t => {
      catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + (Number(t.amount) || 0)
    })

    const list = Object.entries(catTotals)
      .map(([catId, amount]) => {
        const cat = categoryMap.get(catId) || { name: 'Other', color: '#64748b', icon: 'Tag' }
        const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0
        return {
          id: catId,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          amount,
          percentage
        }
      })
      .sort((a, b) => b.amount - a.amount)

    return { list, totalExpense }
  }, [transactions, selectedMonth, categoryMap])

  // Max value for monthly chart scaling
  const maxMonthlyVal = useMemo(() => {
    let max = 100
    monthlyData.forEach(m => {
      if (m.income > max) max = m.income
      if (m.expense > max) max = m.expense
    })
    return max * 1.15
  }, [monthlyData])

  // Donut SVG Calculations
  const donutSlices = useMemo(() => {
    let cumulativePercent = 0
    return categoryBreakdown.list.map((item) => {
      const startPercent = cumulativePercent
      cumulativePercent += item.percentage
      const endPercent = cumulativePercent

      // Compute SVG arc coordinates
      const startAngle = (startPercent / 100) * 2 * Math.PI - Math.PI / 2
      const endAngle = (endPercent / 100) * 2 * Math.PI - Math.PI / 2

      const r = 40
      const cx = 50
      const cy = 50

      const x1 = cx + r * Math.cos(startAngle)
      const y1 = cy + r * Math.sin(startAngle)
      const x2 = cx + r * Math.cos(endAngle)
      const y2 = cy + r * Math.sin(endAngle)

      const largeArcFlag = item.percentage > 50 ? 1 : 0
      const d = item.percentage >= 99.9
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

      return {
        ...item,
        d
      }
    })
  }, [categoryBreakdown])

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      {/* Header with chart toggle buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Visual Financial Analytics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare monthly trends and track category spending distribution
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setChartType('monthly')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              chartType === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Income vs Expense
          </button>
          <button
            onClick={() => setChartType('donut')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              chartType === 'donut'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Category Share
          </button>
        </div>
      </div>

      {/* Chart View: Monthly Income vs Expense */}
      {chartType === 'monthly' && (
        <div>
          <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500" />
                Expenses
              </span>
            </div>
            <span>Past 6 Months</span>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-4 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {monthlyData.map((m, idx) => {
              const incomeHeight = maxMonthlyVal > 0 ? (m.income / maxMonthlyVal) * 100 : 0
              const expenseHeight = maxMonthlyVal > 0 ? (m.expense / maxMonthlyVal) * 100 : 0
              const net = m.income - m.expense
              const isHovered = hoveredMonth === m.key

              return (
                <div
                  key={m.key}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredMonth(m.key)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-20 bg-slate-900 text-white dark:bg-slate-800 px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none">
                      <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1">
                        {m.label}
                      </div>
                      <div className="text-emerald-400">Income: {formatCurrency(m.income, currency)}</div>
                      <div className="text-rose-400">Expense: {formatCurrency(m.expense, currency)}</div>
                      <div className={`mt-0.5 pt-0.5 border-t border-slate-800 font-medium ${net >= 0 ? 'text-indigo-300' : 'text-amber-400'}`}>
                        Net: {formatCurrency(net, currency)}
                      </div>
                    </div>
                  )}

                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full pb-1">
                    {/* Income Bar */}
                    <div className="w-1/2 max-w-[28px] h-full flex items-end justify-center">
                      <div
                        style={{ height: `${Math.max(incomeHeight, 2)}%` }}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 rounded-t-sm sm:rounded-t-md transition-all duration-300 shadow-xs"
                      />
                    </div>
                    {/* Expense Bar */}
                    <div className="w-1/2 max-w-[28px] h-full flex items-end justify-center">
                      <div
                        style={{ height: `${Math.max(expenseHeight, 2)}%` }}
                        className="w-full bg-rose-500 hover:bg-rose-400 rounded-t-sm sm:rounded-t-md transition-all duration-300 shadow-xs"
                      />
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                    {m.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Chart View: Donut Category Share */}
      {chartType === 'donut' && (
        <div>
          {categoryBreakdown.list.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No expense transactions recorded for this period yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* SVG Donut */}
              <div className="relative flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-48 h-48 sm:w-56 sm:h-56 transform -rotate-90">
                  {donutSlices.map((slice) => (
                    <path
                      key={slice.id}
                      d={slice.d}
                      fill={slice.color}
                      className="transition-all duration-200 cursor-pointer opacity-90 hover:opacity-100 hover:scale-105 origin-center"
                      onMouseEnter={() => setHoveredSlice(slice)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  ))}
                  {/* Donut Hole */}
                  <circle cx="50" cy="50" r="26" className="fill-white dark:fill-slate-900" />
                </svg>

                {/* Center Stats */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {hoveredSlice ? hoveredSlice.name : 'Total Spent'}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {hoveredSlice
                      ? formatCurrency(hoveredSlice.amount, currency)
                      : formatCurrency(categoryBreakdown.totalExpense, currency)}
                  </span>
                  {hoveredSlice && (
                    <span className="text-[11px] font-semibold text-indigo-500">
                      {hoveredSlice.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Category Legend & Bars */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {categoryBreakdown.list.map((cat) => {
                  const isHovered = hoveredSlice?.id === cat.id
                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setHoveredSlice(cat)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isHovered
                          ? 'bg-slate-100 dark:bg-slate-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(cat.amount, currency)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium w-9 text-right">
                            {cat.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
