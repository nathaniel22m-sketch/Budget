import React from 'react'
import { AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

export const BudgetAlertBanner = ({
  categories,
  categoryBudgets,
  transactions,
  currency = 'USD',
  onManageBudgets
}) => {
  const expenseCategories = categories.filter(c => c.type === 'expense')

  const alerts = []
  expenseCategories.forEach(cat => {
    const limit = Number(categoryBudgets[cat.id] ?? cat.defaultLimit) || 0
    if (limit <= 0) return

    const spent = transactions
      .filter(t => t.categoryId === cat.id && t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

    const percent = (spent / limit) * 100
    if (percent >= 100) {
      alerts.push({
        cat,
        spent,
        limit,
        over: spent - limit,
        percent,
        isExceeded: true
      })
    } else if (percent >= 80) {
      alerts.push({
        cat,
        spent,
        limit,
        over: 0,
        percent,
        isExceeded: false
      })
    }
  })

  if (alerts.length === 0) return null

  const exceededList = alerts.filter(a => a.isExceeded)
  const warningList = alerts.filter(a => !a.isExceeded)

  return (
    <div className="space-y-3">
      {exceededList.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-900 dark:text-rose-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-rose-950 dark:text-rose-100">
                Budget Limit Exceeded ({exceededList.length} {exceededList.length === 1 ? 'Category' : 'Categories'})
              </h4>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                {exceededList.map((a, i) => (
                  <span key={a.cat.id}>
                    <strong>{a.cat.name}</strong> is over budget by {formatCurrency(a.over, currency)} ({a.percent.toFixed(0)}% used)
                    {i < exceededList.length - 1 ? ' • ' : ''}
                  </span>
                ))}
              </p>
            </div>
          </div>
          <button
            onClick={onManageBudgets}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shrink-0 transition-colors flex items-center gap-1 shadow-xs"
          >
            Adjust Limits <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {warningList.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-950 dark:text-amber-100">
                Approaching Monthly Budget Limit
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                {warningList.map((a, i) => (
                  <span key={a.cat.id}>
                    <strong>{a.cat.name}</strong> is at {a.percent.toFixed(0)}% of limit ({formatCurrency(a.spent, currency)} / {formatCurrency(a.limit, currency)})
                    {i < warningList.length - 1 ? ' • ' : ''}
                  </span>
                ))}
              </p>
            </div>
          </div>
          <button
            onClick={onManageBudgets}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shrink-0 transition-colors flex items-center gap-1 shadow-xs"
          >
            Review <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
