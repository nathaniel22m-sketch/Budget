import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckSquare,
  Square
} from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { CategoryIcon } from '../common/CategoryIcon'

export const TransactionList = ({
  transactions,
  categories,
  currency = 'USD',
  onEditTransaction,
  onDeleteTransaction,
  onDeleteMultipleTransactions,
  onOpenAddModal
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'expense' | 'income'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('this-month') // 'all' | 'this-month' | 'last-month' | 'custom'
  const [customMonth, setCustomMonth] = useState('')
  const [sortBy, setSortBy] = useState('date-desc') // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'title-asc'
  const [selectedIds, setSelectedIds] = useState(new Set())

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories])

  // Current year & month for date filters
  const now = new Date()
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthYm = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchesTitle = t.title?.toLowerCase().includes(query)
        const matchesNotes = t.notes?.toLowerCase().includes(query)
        const matchesTags = Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(query))
        const cat = categoryMap.get(t.categoryId)
        const matchesCat = cat?.name.toLowerCase().includes(query)
        if (!matchesTitle && !matchesNotes && !matchesTags && !matchesCat) return false
      }

      // 2. Type
      if (typeFilter !== 'all' && t.type !== typeFilter) return false

      // 3. Category
      if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false

      // 4. Date Filter
      if (dateFilter === 'this-month') {
        if (!t.date || !t.date.startsWith(currentYm)) return false
      } else if (dateFilter === 'last-month') {
        if (!t.date || !t.date.startsWith(lastMonthYm)) return false
      } else if (dateFilter === 'custom' && customMonth) {
        if (!t.date || !t.date.startsWith(customMonth)) return false
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date)
      if (sortBy === 'amount-desc') return b.amount - a.amount
      if (sortBy === 'amount-asc') return a.amount - b.amount
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title)
      return 0
    })
  }, [transactions, searchTerm, typeFilter, categoryFilter, dateFilter, customMonth, sortBy, currentYm, lastMonthYm, categoryMap])

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredTransactions.map(t => t.id)))
    }
  }

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    onDeleteMultipleTransactions(Array.from(selectedIds))
    setSelectedIds(new Set())
  }

  // Filtered Totals
  const { totalFilteredIncome, totalFilteredExpense } = useMemo(() => {
    let inc = 0
    let exp = 0
    filteredTransactions.forEach(t => {
      const amt = Number(t.amount) || 0
      if (t.type === 'income') inc += amt
      else exp += amt
    })
    return { totalFilteredIncome: inc, totalFilteredExpense: exp }
  }, [filteredTransactions])

  return (
    <div className="space-y-4">
      {/* Controls / Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, category, tag or notes..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Timeframe Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Timeframe</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="all">All Time</option>
              <option value="custom">Specific Month...</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="amount-desc">Amount: Highest First</option>
              <option value="amount-asc">Amount: Lowest First</option>
              <option value="title-asc">Title: A to Z</option>
            </select>
          </div>
        </div>

        {dateFilter === 'custom' && (
          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs text-slate-500">Pick Month:</span>
            <input
              type="month"
              value={customMonth}
              onChange={(e) => setCustomMonth(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>
        )}
      </div>

      {/* Bulk actions & Summary stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 font-medium hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            {selectedIds.size > 0 && selectedIds.size === filteredTransactions.length ? (
              <CheckSquare className="w-4 h-4 text-indigo-500" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>Select All ({filteredTransactions.length})</span>
          </button>

          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete {selectedIds.size} selected</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto font-medium">
          <span>Income: <strong className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(totalFilteredIncome, currency)}</strong></span>
          <span>Expenses: <strong className="text-rose-600 dark:text-rose-400">-{formatCurrency(totalFilteredExpense, currency)}</strong></span>
        </div>
      </div>

      {/* Transaction List / Table */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">No transactions found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try resetting your search query or filters, or record a new transaction to get started.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            Add New Transaction
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-10"></th>
                  <th className="py-3 px-4">Transaction</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId) || {
                    name: 'Other',
                    color: '#64748b',
                    icon: 'Tag'
                  }
                  const isSelected = selectedIds.has(tx.id)
                  const isIncome = tx.type === 'income'

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleSelect(tx.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Title & Notes / Tags */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {tx.title}
                        </div>
                        {tx.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                            {tx.notes}
                          </p>
                        )}
                        {Array.isArray(tx.tags) && tx.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tx.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cat.color}20` }}
                          >
                            <CategoryIcon iconName={cat.icon} color={cat.color} className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {cat.name}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(tx.date)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {tx.paymentMethod ? (
                          tx.paymentMethod.toLowerCase().includes('credit card') ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium">
                              <CreditCard className="w-3 h-3 text-purple-500 shrink-0" />
                              <span>{tx.paymentMethod}</span>
                            </span>
                          ) : (
                            <span>{tx.paymentMethod}</span>
                          )
                        ) : (
                          'N/A'
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <span
                          className={`font-semibold inline-flex items-center gap-0.5 ${
                            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
