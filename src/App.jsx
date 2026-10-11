import React, { useState, useEffect, useMemo } from 'react'
import confetti from 'canvas-confetti'
import {
  loadInitialData,
  saveStorageItem,
  resetToSampleData,
  clearAllData
} from './utils/storage'
import { Navbar } from './components/Navbar'
import { SummaryCards } from './components/Dashboard/SummaryCards'
import { BudgetAlertBanner } from './components/Dashboard/BudgetAlertBanner'
import { SpendingCharts } from './components/Dashboard/SpendingCharts'
import { TransactionList } from './components/Transactions/TransactionList'
import { TransactionModal } from './components/Transactions/TransactionModal'
import { BudgetManager } from './components/Budgets/BudgetManager'
import { RecurringManager } from './components/Recurring/RecurringManager'
import { AccountsDebtsManager } from './components/Accounts/AccountsDebtsManager'
import { ExportImportModal } from './components/ExportImport/ExportImportModal'
import { ConfirmDialog } from './components/common/ConfirmDialog'
import {
  ArrowRight,
  Plus,
  ReceiptText,
  FileSpreadsheet,
  PiggyBank,
  Landmark,
  CreditCard
} from 'lucide-react'
import { formatCurrency, formatDate } from './utils/formatters'
import { CategoryIcon } from './components/common/CategoryIcon'

export function App() {
  const initial = useMemo(() => loadInitialData(), [])

  const [transactions, setTransactions] = useState(initial.transactions)
  const [categories, setCategories] = useState(initial.categories)
  const [categoryBudgets, setCategoryBudgets] = useState(initial.categoryBudgets)
  const [recurring, setRecurring] = useState(initial.recurring)
  const [accounts, setAccounts] = useState(initial.accounts)
  const [debts, setDebts] = useState(initial.debts)
  const [currency, setCurrency] = useState(initial.currency)
  const [theme, setTheme] = useState(initial.theme)

  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'transactions' | 'budgets' | 'recurring' | 'accounts'

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [txToEdit, setTxToEdit] = useState(null)
  const [isExportImportOpen, setIsExportImportOpen] = useState(false)
  
  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDanger: false,
    action: () => {}
  })

  // Theme synchronization with document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    saveStorageItem('THEME', theme)
  }, [theme])

  // Persist state updates to localStorage
  useEffect(() => {
    saveStorageItem('TRANSACTIONS', transactions)
  }, [transactions])

  useEffect(() => {
    saveStorageItem('CATEGORIES', categories)
  }, [categories])

  useEffect(() => {
    saveStorageItem('CATEGORY_BUDGETS', categoryBudgets)
  }, [categoryBudgets])

  useEffect(() => {
    saveStorageItem('RECURRING', recurring)
  }, [recurring])

  useEffect(() => {
    saveStorageItem('ACCOUNTS', accounts)
  }, [accounts])

  useEffect(() => {
    saveStorageItem('DEBTS', debts)
  }, [debts])

  useEffect(() => {
    saveStorageItem('CURRENCY', currency)
  }, [currency])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Active month for current KPI calculations
  const now = new Date()
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Financial Metrics
  const { totalBalance, periodIncome, periodExpense } = useMemo(() => {
    let bal = 0
    let inc = 0
    let exp = 0

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0
      if (t.type === 'income') {
        bal += amt
        if (t.date?.startsWith(currentYm)) inc += amt
      } else {
        bal -= amt
        if (t.date?.startsWith(currentYm)) exp += amt
      }
    })

    return { totalBalance: bal, periodIncome: inc, periodExpense: exp }
  }, [transactions, currentYm])

  // Transaction Actions
  const handleSaveTransaction = (tx) => {
    const isEditing = transactions.some(item => item.id === tx.id)

    setTransactions(prev => {
      const index = prev.findIndex(item => item.id === tx.id)
      if (index !== -1) {
        const updated = [...prev]
        updated[index] = tx
        return updated
      } else {
        return [tx, ...prev]
      }
    })

    // If it's a new transaction, adjust the selected account's balance
    // Update account balance (if not charged to a debt card)
    if (!isEditing && tx.accountId && !tx.chargeDebtId) {
      setAccounts(prevAccounts =>
        prevAccounts.map(acc => {
          if (acc.id === tx.accountId) {
            if (acc.type === 'Credit Card') {
              const diff = tx.type === 'income' ? -tx.amount : tx.amount
              const newBal = Math.max(0, (Number(acc.balance) || 0) + diff)
              const curAvail = acc.availableCredit !== undefined 
                ? Number(acc.availableCredit) 
                : Math.max(0, (Number(acc.creditLimit) || 0) - (Number(acc.balance) || 0))
              const newAvail = Math.max(0, curAvail - diff)
              return { ...acc, balance: newBal, availableCredit: newAvail }
            } else {
              const diff = tx.type === 'income' ? tx.amount : -tx.amount
              return { ...acc, balance: (Number(acc.balance) || 0) + diff }
            }
          }
          return acc
        })
      )
    }

    // If charged to a credit card liability in debts
    if (!isEditing && tx.chargeDebtId) {
      setDebts(prevDebts =>
        prevDebts.map(d => {
          if (d.id === tx.chargeDebtId) {
            const diff = tx.type === 'income' ? -tx.amount : tx.amount
            const newBal = Math.max(0, (Number(d.currentBalance) || 0) + diff)
            const curAvail = d.availableCredit !== undefined 
              ? Number(d.availableCredit) 
              : Math.max(0, (Number(d.initialAmount) || 0) - (Number(d.currentBalance) || 0))
            const newAvail = Math.max(0, curAvail - diff)
            return { ...d, currentBalance: newBal, availableCredit: newAvail }
          }
          return d
        })
      )
    }

    // If linked to a debt repayment
    if (!isEditing && tx.debtId && tx.type === 'expense') {
      setDebts(prevDebts =>
        prevDebts.map(d => {
          if (d.id === tx.debtId) {
            const newBal = Math.max(0, (Number(d.currentBalance) || 0) - tx.amount)
            const curAvail = d.availableCredit !== undefined 
              ? Number(d.availableCredit) 
              : Math.max(0, (Number(d.initialAmount) || 0) - (Number(d.currentBalance) || 0))
            const newAvail = d.category === 'Credit Card' 
              ? Math.min(Number(d.initialAmount) || 0, curAvail + tx.amount) 
              : undefined
            if (newBal === 0) {
              try {
                confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } })
              } catch {}
            }
            return { ...d, currentBalance: newBal, ...(newAvail !== undefined ? { availableCredit: newAvail } : {}) }
          }
          return d
        })
      )
    }

    // Celebratory confetti for high income
    if (!isEditing && tx.type === 'income' && tx.amount >= 500) {
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } })
      } catch {}
    }
  }

  const handleDeleteTransaction = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Transaction',
      message: 'Are you sure you want to remove this transaction record?',
      confirmText: 'Delete',
      isDanger: true,
      action: () => {
        setTransactions(prev => prev.filter(t => t.id !== id))
      }
    })
  }

  const handleDeleteMultipleTransactions = (ids) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${ids.length} Transactions`,
      message: `Are you sure you want to permanently delete these ${ids.length} transactions?`,
      confirmText: 'Delete All Selected',
      isDanger: true,
      action: () => {
        const idSet = new Set(ids)
        setTransactions(prev => prev.filter(t => !idSet.has(t.id)))
      }
    })
  }

  const handleOpenEdit = (tx) => {
    setTxToEdit(tx)
    setIsTxModalOpen(true)
  }

  const handleOpenAdd = () => {
    setTxToEdit(null)
    setIsTxModalOpen(true)
  }

  // Budget Actions
  const handleUpdateBudgetLimit = (categoryId, newLimit) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [categoryId]: newLimit
    }))
  }

  const handleAddCategory = (newCat) => {
    setCategories(prev => [...prev, newCat])
  }

  // Recurring Actions
  const handleAddRecurring = (item) => {
    setRecurring(prev => [item, ...prev])
  }

  const handleDeleteRecurring = (id) => {
    setRecurring(prev => prev.filter(r => r.id !== id))
  }

  const handleLogRecurringNow = (rec) => {
    const defaultAccId = accounts[0]?.id || ''
    const newTx = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      title: rec.title,
      amount: rec.amount,
      type: rec.type,
      categoryId: rec.categoryId,
      accountId: defaultAccId,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: rec.paymentMethod,
      tags: ['recurring', rec.frequency.toLowerCase()],
      notes: `Logged from ${rec.frequency} schedule: ${rec.notes || ''}`
    }

    setTransactions(prev => [newTx, ...prev])

    // Update account balance
    if (defaultAccId) {
      setAccounts(prev =>
        prev.map(a => {
          if (a.id === defaultAccId) {
            const diff = rec.type === 'income' ? rec.amount : -rec.amount
            return { ...a, balance: (Number(a.balance) || 0) + diff }
          }
          return a
        })
      )
    }

    // Advance next due date
    const currentDue = new Date(rec.nextDueDate || new Date())
    if (rec.frequency === 'Weekly') {
      currentDue.setDate(currentDue.getDate() + 7)
    } else if (rec.frequency === 'Bi-Weekly') {
      currentDue.setDate(currentDue.getDate() + 14)
    } else if (rec.frequency === 'Yearly') {
      currentDue.setFullYear(currentDue.getFullYear() + 1)
    } else {
      currentDue.setMonth(currentDue.getMonth() + 1)
    }

    const updatedNextDate = currentDue.toISOString().split('T')[0]
    setRecurring(prev => prev.map(r => r.id === rec.id ? { ...r, nextDueDate: updatedNextDate } : r))
  }

  // Accounts & Debts Actions
  const handleAddAccount = (newAcc) => {
    setAccounts(prev => [...prev, newAcc])
  }

  const handleUpdateAccount = (updatedAcc) => {
    setAccounts(prev => prev.map(a => a.id === updatedAcc.id ? updatedAcc : a))
  }

  const handleDeleteAccount = (accId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Bank Account',
      message: 'Are you sure you want to remove this account? Associated transactions will remain in history.',
      confirmText: 'Delete Account',
      isDanger: true,
      action: () => {
        setAccounts(prev => prev.filter(a => a.id !== accId))
      }
    })
  }

  const handleAddDebt = (newDebt) => {
    setDebts(prev => [...prev, newDebt])
  }

  const handleUpdateDebt = (updatedDebt) => {
    setDebts(prev => prev.map(d => d.id === updatedDebt.id ? updatedDebt : d))
  }

  const handleDeleteDebt = (debtId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Debt Record',
      message: 'Are you sure you want to remove this debt obligation?',
      confirmText: 'Delete Debt',
      isDanger: true,
      action: () => {
        setDebts(prev => prev.filter(d => d.id !== debtId))
      }
    })
  }

  // Pay Debt: deduct from account, decrease debt balance, and log transaction
  const handlePayDebt = ({ debtId, accountId, amount }) => {
    const targetDebt = debts.find(d => d.id === debtId)
    const targetAccount = accounts.find(a => a.id === accountId)
    if (!targetDebt || !targetAccount) return

    // 1. Deduct from account
    setAccounts(prev =>
      prev.map(a => a.id === accountId ? { ...a, balance: (Number(a.balance) || 0) - amount } : a)
    )

    // 2. Reduce debt balance
    const remaining = Math.max(0, (Number(targetDebt.currentBalance) || 0) - amount)
    const curAvail = targetDebt.availableCredit !== undefined 
      ? Number(targetDebt.availableCredit) 
      : Math.max(0, (Number(targetDebt.initialAmount) || 0) - (Number(targetDebt.currentBalance) || 0))
    const newAvail = targetDebt.category === 'Credit Card' 
      ? Math.min(Number(targetDebt.initialAmount) || 0, curAvail + amount) 
      : undefined

    setDebts(prev =>
      prev.map(d => d.id === debtId ? { ...d, currentBalance: remaining, ...(newAvail !== undefined ? { availableCredit: newAvail } : {}) } : d)
    )

    const debtCategory = categories.find(c => c.id === 'cat-debt' || c.name.toLowerCase().includes('debt') || c.name.toLowerCase().includes('loan')) || categories.find(c => c.type === 'expense')

    // 3. Log transaction
    const paymentTx = {
      id: 'tx-debt-' + Date.now(),
      title: `Debt Payment: ${targetDebt.name}`,
      amount,
      type: 'expense',
      categoryId: debtCategory ? debtCategory.id : 'cat-housing',
      accountId,
      debtId,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: targetAccount.type === 'Cash' ? 'Cash' : 'Bank Transfer',
      tags: ['debt-payment', targetDebt.category?.toLowerCase() || 'loan'],
      notes: `Direct payment towards ${targetDebt.name} from ${targetAccount.name}. Remaining debt: ${formatCurrency(remaining, currency)}`
    }

    setTransactions(prev => [paymentTx, ...prev])

    // Confetti if paid off completely!
    if (remaining === 0) {
      try {
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } })
      } catch {}
    }
  }

  // Transfer funds between accounts
  const handleTransferFunds = ({ fromAccountId, toAccountId, amount }) => {
    const fromAcc = accounts.find(a => a.id === fromAccountId)
    const toAcc = accounts.find(a => a.id === toAccountId)
    if (!fromAcc || !toAcc) return

    setAccounts(prev =>
      prev.map(a => {
        if (a.id === fromAccountId) return { ...a, balance: (Number(a.balance) || 0) - amount }
        if (a.id === toAccountId) {
          if (a.type === 'Credit Card') {
            const newBal = Math.max(0, (Number(a.balance) || 0) - amount)
            const curAvail = a.availableCredit !== undefined 
              ? Number(a.availableCredit) 
              : Math.max(0, (Number(a.creditLimit) || 0) - (Number(a.balance) || 0))
            const newAvail = Math.min(Number(a.creditLimit) || 0, curAvail + amount)
            return { ...a, balance: newBal, availableCredit: newAvail }
          }
          return { ...a, balance: (Number(a.balance) || 0) + amount }
        }
        return a
      })
    )

    // Log transfer transaction
    const transferTx = {
      id: 'tx-xfer-' + Date.now(),
      title: `Transfer: ${fromAcc.name} → ${toAcc.name}`,
      amount,
      type: 'expense', // internal transfer
      categoryId: 'cat-other-exp',
      accountId: fromAccountId,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      tags: ['transfer', 'internal'],
      notes: `Transferred ${formatCurrency(amount, currency)} from ${fromAcc.name} to ${toAcc.name}`
    }

    setTransactions(prev => [transferTx, ...prev])
  }

  // Export / Import Handlers
  const handleImportTransactions = (importedList) => {
    setTransactions(prev => [...importedList, ...prev])
  }

  const handleRestoreBackup = (data) => {
    if (data.transactions) setTransactions(data.transactions)
    if (data.categories) setCategories(data.categories)
    if (data.categoryBudgets) setCategoryBudgets(data.categoryBudgets)
    if (data.recurring) setRecurring(data.recurring)
    if (data.accounts) setAccounts(data.accounts)
    if (data.debts) setDebts(data.debts)
    if (data.currency) setCurrency(data.currency)
  }

  // Reset and Clear Handlers
  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset to Sample Data',
      message: 'This will reset all transactions, categories, budgets, bank accounts, and debts to the demonstration dataset.',
      confirmText: 'Reset Data',
      isDanger: false,
      action: () => {
        const fresh = resetToSampleData()
        setTransactions(fresh.transactions)
        setCategories(fresh.categories)
        setCategoryBudgets(fresh.categoryBudgets)
        setRecurring(fresh.recurring)
        setAccounts(fresh.accounts)
        setDebts(fresh.debts)
      }
    })
  }

  const handleClearData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Transactions',
      message: 'Are you sure you want to delete all transaction records? This action cannot be undone unless you export a backup first.',
      confirmText: 'Clear Everything',
      isDanger: true,
      action: () => {
        const cleared = clearAllData()
        setTransactions(cleared.transactions)
        setRecurring(cleared.recurring)
      }
    })
  }

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        onCurrencyChange={setCurrency}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        onOpenAddModal={handleOpenAdd}
        onResetData={handleResetData}
        onClearData={handleClearData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5">
        {/* 1. Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Cards with Net Worth, Bank Accounts & Debts */}
            <SummaryCards
              totalIncome={periodIncome}
              totalExpense={periodExpense}
              balance={totalBalance}
              accounts={accounts}
              debts={debts}
              currency={currency}
            />

            {/* Over-budget & Warning Alert Banner */}
            <BudgetAlertBanner
              categories={categories}
              categoryBudgets={categoryBudgets}
              transactions={transactions}
              currency={currency}
              onManageBudgets={() => setActiveTab('budgets')}
            />

            {/* Visual Analytics & Charts */}
            <SpendingCharts
              transactions={transactions}
              categories={categories}
              currency={currency}
              selectedMonth={currentYm}
            />

            {/* Recent Transactions Section with Quick Actions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ReceiptText className="w-4 h-4 text-indigo-500" />
                    Recent Activity
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Latest recorded income, expenses, and debt payments
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExportImportOpen(true)}
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800/50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export to Excel</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>View All ({transactions.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Transactions Preview List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-1">
                {transactions.slice(0, 5).map((tx) => {
                  const cat = categoryMap.get(tx.categoryId) || {
                    name: 'Other',
                    color: '#64748b',
                    icon: 'Tag'
                  }
                  const isIncome = tx.type === 'income'

                  return (
                    <div
                      key={tx.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors cursor-pointer"
                      onClick={() => handleOpenEdit(tx)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <CategoryIcon iconName={cat.icon} color={cat.color} className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {tx.title}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span>{cat.name}</span>
                            <span>•</span>
                            <span>{formatDate(tx.date)}</span>
                            {tx.paymentMethod && (
                              <>
                                <span>•</span>
                                <span>{tx.paymentMethod}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-semibold text-sm ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. All Transactions View */}
        {activeTab === 'transactions' && (
          <div className="animate-in fade-in duration-200">
            <TransactionList
              transactions={transactions}
              categories={categories}
              currency={currency}
              onEditTransaction={handleOpenEdit}
              onDeleteTransaction={handleDeleteTransaction}
              onDeleteMultipleTransactions={handleDeleteMultipleTransactions}
              onOpenAddModal={handleOpenAdd}
            />
          </div>
        )}

        {/* 3. Monthly Budgets View */}
        {activeTab === 'budgets' && (
          <div className="animate-in fade-in duration-200">
            <BudgetManager
              categories={categories}
              categoryBudgets={categoryBudgets}
              transactions={transactions}
              currency={currency}
              onUpdateBudgetLimit={handleUpdateBudgetLimit}
              onAddCategory={handleAddCategory}
            />
          </div>
        )}

        {/* 4. Recurring Transactions View */}
        {activeTab === 'recurring' && (
          <div className="animate-in fade-in duration-200">
            <RecurringManager
              recurring={recurring}
              categories={categories}
              currency={currency}
              onAddRecurring={handleAddRecurring}
              onDeleteRecurring={handleDeleteRecurring}
              onLogRecurringNow={handleLogRecurringNow}
            />
          </div>
        )}

        {/* 5. Bank Accounts & Debts View */}
        {activeTab === 'accounts' && (
          <div className="animate-in fade-in duration-200">
            <AccountsDebtsManager
              accounts={accounts}
              debts={debts}
              currency={currency}
              onAddAccount={handleAddAccount}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
              onAddDebt={handleAddDebt}
              onUpdateDebt={handleUpdateDebt}
              onDeleteDebt={handleDeleteDebt}
              onPayDebt={handlePayDebt}
              onTransferFunds={handleTransferFunds}
            />
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false)
          setTxToEdit(null)
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        accounts={accounts}
        debts={debts}
        currency={currency}
        transactionToEdit={txToEdit}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        transactions={transactions}
        categories={categories}
        categoryBudgets={categoryBudgets}
        recurring={recurring}
        accounts={accounts}
        debts={debts}
        currency={currency}
        onImportTransactions={handleImportTransactions}
        onRestoreBackup={handleRestoreBackup}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        isDanger={confirmDialog.isDanger}
      />
    </div>
  )
}

export default App
