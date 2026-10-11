import React, { useState, useMemo } from 'react'
import { Plus, Edit3, Target, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react'
import { formatCurrency, formatPercent, getCurrencySymbol } from '../../utils/formatters'
import { CategoryIcon } from '../common/CategoryIcon'
import { Modal } from '../common/Modal'
import { CATEGORY_COLORS } from '../../constants/defaultCategories'

export const BudgetManager = ({
  categories,
  categoryBudgets,
  transactions,
  currency = 'USD',
  onUpdateBudgetLimit,
  onAddCategory
}) => {
  const [editingCat, setEditingCat] = useState(null)
  const [limitInput, setLimitInput] = useState('')
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatLimit, setNewCatLimit] = useState('')
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0])
  const [newCatType, setNewCatType] = useState('expense')

  // Get spending for current month
  const now = new Date()
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const expenseCategories = useMemo(() => {
    return categories.filter(c => c.type === 'expense')
  }, [categories])

  const categoryStats = useMemo(() => {
    return expenseCategories.map(cat => {
      const limit = Number(categoryBudgets[cat.id] ?? cat.defaultLimit) || 0
      const spent = transactions
        .filter(t => t.categoryId === cat.id && t.type === 'expense' && t.date?.startsWith(currentYm))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

      const remaining = limit - spent
      const percent = limit > 0 ? (spent / limit) * 100 : 0

      return {
        ...cat,
        limit,
        spent,
        remaining,
        percent
      }
    }).sort((a, b) => b.spent - a.spent)
  }, [expenseCategories, categoryBudgets, transactions, currentYm])

  // Overall budget summary
  const totalBudgetLimit = useMemo(() => {
    return categoryStats.reduce((sum, c) => sum + c.limit, 0)
  }, [categoryStats])

  const totalSpent = useMemo(() => {
    return categoryStats.reduce((sum, c) => sum + c.spent, 0)
  }, [categoryStats])

  const overallPercent = totalBudgetLimit > 0 ? (totalSpent / totalBudgetLimit) * 100 : 0

  const handleOpenEdit = (cat) => {
    setEditingCat(cat)
    setLimitInput(String(cat.limit))
  }

  const handleSaveLimit = (e) => {
    e.preventDefault()
    if (!editingCat) return
    const num = Math.max(0, parseFloat(limitInput) || 0)
    onUpdateBudgetLimit(editingCat.id, num)
    setEditingCat(null)
  }

  const handleAddCategorySubmit = (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    const newCat = {
      id: 'cat-custom-' + Date.now(),
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor,
      icon: 'Tag',
      defaultLimit: parseFloat(newCatLimit) || 0
    }

    onAddCategory(newCat)
    if (newCatType === 'expense' && parseFloat(newCatLimit) > 0) {
      onUpdateBudgetLimit(newCat.id, parseFloat(newCatLimit))
    }

    setIsAddCatModalOpen(false)
    setNewCatName('')
    setNewCatLimit('')
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Monthly Category Budgets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set spending targets and get proactive warnings before overspending
            </p>
          </div>

          <button
            onClick={() => setIsAddCatModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="pt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Total Budget Utilization (This Month)
            </span>
            <span className="text-slate-500">
              <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(totalSpent, currency)}</strong> of {formatCurrency(totalBudgetLimit, currency)}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercent >= 100
                  ? 'bg-rose-500'
                  : overallPercent >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(overallPercent, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
            <span>
              Remaining: <strong className={totalBudgetLimit - totalSpent >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                {formatCurrency(totalBudgetLimit - totalSpent, currency)}
              </strong>
            </span>
            <span className="font-semibold">{overallPercent.toFixed(1)}% Used</span>
          </div>
        </div>
      </div>

      {/* Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map((cat) => {
          const isOver = cat.percent >= 100
          const isWarning = cat.percent >= 80 && !isOver

          return (
            <div
              key={cat.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden ${
                isOver
                  ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20'
                  : isWarning
                  ? 'border-amber-300 dark:border-amber-900/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <CategoryIcon iconName={cat.icon} color={cat.color} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {cat.name}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Target: {formatCurrency(cat.limit, currency)}/mo
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(cat)}
                  title="Adjust Limit"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress and status */}
              <div className="mt-4 space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(cat.spent, currency)}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isOver
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                    }`}
                  >
                    {isOver ? 'OVER BUDGET' : isWarning ? 'Warning >80%' : 'On Track'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(cat.percent, 100)}%` }}
                  />
                </div>

                {/* Footer details */}
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>
                    {cat.remaining >= 0 ? (
                      <>Left: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(cat.remaining, currency)}</strong></>
                    ) : (
                      <>Over: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(Math.abs(cat.remaining), currency)}</strong></>
                    )}
                  </span>
                  <span className="font-semibold">{cat.percent.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Budget Limit Modal */}
      <Modal
        isOpen={!!editingCat}
        onClose={() => setEditingCat(null)}
        title={editingCat ? `Edit Budget for ${editingCat.name}` : ''}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSaveLimit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Budget Limit
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                {getCurrencySymbol(currency)}
              </span>
              <input
                type="number"
                step="1"
                min="0"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="e.g. 500"
                autoFocus
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setEditingCat(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Save Limit
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Custom Category Modal */}
      <Modal
        isOpen={isAddCatModalOpen}
        onClose={() => setIsAddCatModalOpen(false)}
        title="Create New Category"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCategorySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Pet Care, Gaming, Side Income"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewCatType('expense')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  newCatType === 'expense'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setNewCatType('income')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  newCatType === 'income'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {newCatType === 'expense' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Budget Limit
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={newCatLimit}
                onChange={(e) => setNewCatLimit(e.target.value)}
                placeholder="e.g. 250"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewCatColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    newCatColor === c ? 'scale-110 border-white ring-2 ring-indigo-500' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddCatModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
