import React, { useState } from 'react'
import { Plus, Repeat, Calendar, CheckCircle2, Trash2, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { Modal } from '../common/Modal'
import { CategoryIcon } from '../common/CategoryIcon'
import { PAYMENT_METHODS } from '../../constants/currencies'

export const RecurringManager = ({
  recurring,
  categories,
  currency = 'USD',
  onAddRecurring,
  onDeleteRecurring,
  onLogRecurringNow
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('')
  const [frequency, setFrequency] = useState('Monthly')
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const categoryMap = new Map(categories.map(c => [c.id, c]))
  const availableCategories = categories.filter(c => c.type === type)

  const handleOpenAdd = () => {
    setTitle('')
    setAmount('')
    setType('expense')
    const firstCat = categories.find(c => c.type === 'expense')
    setCategoryId(firstCat ? firstCat.id : '')
    setFrequency('Monthly')
    setPaymentMethod(PAYMENT_METHODS[0])
    setNextDueDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setIsAddModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !amount) return

    const newItem = {
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      categoryId: categoryId || availableCategories[0]?.id,
      frequency,
      paymentMethod,
      nextDueDate,
      notes: notes.trim()
    }

    onAddRecurring(newItem)
    setIsAddModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-indigo-500" />
            Recurring Subscriptions & Bills
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Keep track of monthly subscriptions, scheduled rent, salaries, and recurring expenses
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      {/* Grid of Recurring Items */}
      {recurring.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
          <Repeat className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No recurring items configured</h4>
          <p className="text-xs text-slate-500 mt-1">Add subscriptions like Netflix, Spotify, Gym, or salary schedules.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurring.map((item) => {
            const cat = categoryMap.get(item.categoryId) || { name: 'Other', color: '#64748b', icon: 'Tag' }
            const isIncome = item.type === 'income'

            // Days until due calculation
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const due = new Date(item.nextDueDate)
            const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
            const isDueSoon = diffDays >= 0 && diffDays <= 7
            const isOverdue = diffDays < 0

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
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
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {item.frequency} • {cat.name}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteRecurring(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span
                      className={`text-lg font-bold ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(item.amount, currency)}
                    </span>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isOverdue
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          : isDueSoon
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isOverdue ? 'Overdue' : isDueSoon ? `Due in ${diffDays}d` : formatDate(item.nextDueDate)}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Log Now button */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Via {item.paymentMethod || 'Card'}
                  </span>
                  <button
                    onClick={() => onLogRecurringNow(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Log to Transactions</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Recurring Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Recurring Subscription or Bill"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Income (+)
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title / Provider *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Netflix, Gym, Apartment Rent"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Next Due Date
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Account #1234, auto-renews"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Save Recurring Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
