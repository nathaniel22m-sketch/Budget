import React, { useState, useMemo } from 'react'
import {
  Building2,
  Landmark,
  CreditCard,
  Wallet,
  Plus,
  ArrowRightLeft,
  ArrowDownRight,
  TrendingUp,
  Percent,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  ShieldCheck,
  AlertCircle,
  PiggyBank,
  DollarSign
} from 'lucide-react'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { Modal } from '../common/Modal'

export const AccountsDebtsManager = ({
  accounts,
  debts,
  currency = 'USD',
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onAddDebt,
  onUpdateDebt,
  onDeleteDebt,
  onPayDebt,
  onTransferFunds
}) => {
  const [subTab, setSubTab] = useState('accounts') // 'accounts' | 'debts'

  // Modal states for Accounts
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'Checking',
    institution: '',
    balance: '',
    creditLimit: '',
    accountNumber: '',
    color: '#3b82f6'
  })

  // Modal states for Debts
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState(null)
  const [debtForm, setDebtForm] = useState({
    name: '',
    category: 'Personal Loan',
    lender: '',
    initialAmount: '',
    currentBalance: '',
    interestRate: '',
    minimumPayment: '',
    dueDate: '1st',
    notes: ''
  })

  // Modal states for Paying Debt
  const [payingDebt, setPayingDebt] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentSourceAccountId, setPaymentSourceAccountId] = useState('')

  // Modal states for Transferring Funds between accounts
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [transferFromId, setTransferFromId] = useState('')
  const [transferToId, setTransferToId] = useState('')
  const [transferAmount, setTransferAmount] = useState('')

  // Totals & Net Worth
  const totalAssets = useMemo(() => {
    return accounts
      .filter(a => a.type !== 'Credit Card')
      .reduce((sum, a) => sum + (Number(a.balance) || 0), 0)
  }, [accounts])

  const totalCreditCardBalances = useMemo(() => {
    return accounts
      .filter(a => a.type === 'Credit Card')
      .reduce((sum, a) => sum + (Number(a.balance) || 0), 0)
  }, [accounts])

  const totalAvailableCredit = useMemo(() => {
    const accCardsAvail = accounts
      .filter(a => a.type === 'Credit Card')
      .reduce((sum, a) => {
        const avail = a.availableCredit !== undefined 
          ? Number(a.availableCredit) 
          : Math.max(0, (Number(a.creditLimit) || 0) - (Number(a.balance) || 0))
        return sum + avail
      }, 0)

    const debtCardsAvail = debts
      .filter(d => d.category === 'Credit Card')
      .reduce((sum, d) => {
        const avail = d.availableCredit !== undefined 
          ? Number(d.availableCredit) 
          : Math.max(0, (Number(d.initialAmount) || 0) - (Number(d.currentBalance) || 0))
        return sum + avail
      }, 0)

    return accCardsAvail + debtCardsAvail
  }, [accounts, debts])

  const totalDebt = useMemo(() => {
    const loanDebts = debts.reduce((sum, d) => sum + (Number(d.currentBalance) || 0), 0)
    return loanDebts + totalCreditCardBalances
  }, [debts, totalCreditCardBalances])

  const netWorth = totalAssets - totalDebt

  // Account Handlers
  const handleOpenAddAccount = () => {
    setAccountForm({
      name: '',
      type: 'Checking',
      institution: '',
      balance: '',
      creditLimit: '',
      availableCredit: '',
      accountNumber: '',
      color: '#3b82f6'
    })
    setIsAddAccountOpen(true)
  }

  const handleOpenEditAccount = (acc) => {
    setEditingAccount(acc)
    const defaultAvail = acc.availableCredit !== undefined 
      ? String(acc.availableCredit) 
      : acc.creditLimit !== undefined 
      ? String(Math.max(0, (Number(acc.creditLimit) || 0) - (Number(acc.balance) || 0)))
      : ''
    setAccountForm({
      name: acc.name,
      type: acc.type,
      institution: acc.institution || '',
      balance: String(acc.balance),
      creditLimit: acc.creditLimit !== undefined ? String(acc.creditLimit) : '',
      availableCredit: defaultAvail,
      accountNumber: acc.accountNumber || '',
      color: acc.color || '#3b82f6'
    })
    setIsAddAccountOpen(true)
  }

  const handleSaveAccount = (e) => {
    e.preventDefault()
    if (!accountForm.name.trim()) return

    const isCreditCard = accountForm.type === 'Credit Card'
    const limit = parseFloat(accountForm.creditLimit) || 0
    const bal = parseFloat(accountForm.balance) || 0
    const avail = accountForm.availableCredit !== '' 
      ? parseFloat(accountForm.availableCredit) 
      : Math.max(0, limit - bal)

    const payload = {
      id: editingAccount ? editingAccount.id : 'acc-' + Date.now(),
      name: accountForm.name.trim(),
      type: accountForm.type,
      institution: accountForm.institution.trim(),
      balance: bal,
      creditLimit: isCreditCard ? limit : undefined,
      availableCredit: isCreditCard ? avail : undefined,
      accountNumber: accountForm.accountNumber.trim(),
      color: accountForm.color
    }

    if (editingAccount) {
      onUpdateAccount(payload)
    } else {
      onAddAccount(payload)
    }

    setIsAddAccountOpen(false)
    setEditingAccount(null)
  }

  // Debt Handlers
  const handleOpenAddDebt = () => {
    setDebtForm({
      name: '',
      category: 'Auto Loan',
      lender: '',
      initialAmount: '',
      currentBalance: '',
      availableCredit: '',
      interestRate: '',
      minimumPayment: '',
      dueDate: '15th',
      notes: ''
    })
    setIsAddDebtOpen(true)
  }

  const handleOpenEditDebt = (d) => {
    setEditingDebt(d)
    const defaultAvail = d.availableCredit !== undefined 
      ? String(d.availableCredit) 
      : String(Math.max(0, (Number(d.initialAmount) || 0) - (Number(d.currentBalance) || 0)))
    setDebtForm({
      name: d.name,
      category: d.category || 'Loan',
      lender: d.lender || '',
      initialAmount: String(d.initialAmount),
      currentBalance: String(d.currentBalance),
      availableCredit: defaultAvail,
      interestRate: String(d.interestRate || ''),
      minimumPayment: String(d.minimumPayment || ''),
      dueDate: d.dueDate || '1st',
      notes: d.notes || ''
    })
    setIsAddDebtOpen(true)
  }

  const handleSaveDebt = (e) => {
    e.preventDefault()
    if (!debtForm.name.trim()) return

    const isCard = debtForm.category === 'Credit Card'
    const initialAmt = parseFloat(debtForm.initialAmount) || 0
    const curBal = debtForm.currentBalance !== '' ? parseFloat(debtForm.currentBalance) : initialAmt
    const avail = debtForm.availableCredit !== '' 
      ? parseFloat(debtForm.availableCredit) 
      : Math.max(0, initialAmt - curBal)

    const payload = {
      id: editingDebt ? editingDebt.id : 'debt-' + Date.now(),
      name: debtForm.name.trim(),
      category: debtForm.category,
      lender: debtForm.lender.trim(),
      initialAmount: initialAmt,
      currentBalance: curBal,
      availableCredit: isCard ? avail : undefined,
      interestRate: parseFloat(debtForm.interestRate) || 0,
      minimumPayment: parseFloat(debtForm.minimumPayment) || 0,
      dueDate: debtForm.dueDate.trim(),
      notes: debtForm.notes.trim()
    }

    if (editingDebt) {
      onUpdateDebt(payload)
    } else {
      onAddDebt(payload)
    }

    setIsAddDebtOpen(false)
    setEditingDebt(null)
  }

  // Pay Debt Handler
  const handleOpenPayDebt = (d) => {
    setPayingDebt(d)
    setPaymentAmount(d.minimumPayment ? String(d.minimumPayment) : '100')
    setPaymentSourceAccountId(accounts[0]?.id || '')
  }

  const handleConfirmPayDebt = (e) => {
    e.preventDefault()
    if (!payingDebt || !paymentAmount || !paymentSourceAccountId) return
    const amt = parseFloat(paymentAmount)
    if (isNaN(amt) || amt <= 0) return

    onPayDebt({
      debtId: payingDebt.id,
      accountId: paymentSourceAccountId,
      amount: amt
    })

    setPayingDebt(null)
  }

  // Transfer Funds Handler
  const handleOpenTransfer = () => {
    if (accounts.length >= 2) {
      setTransferFromId(accounts[0].id)
      setTransferToId(accounts[1].id)
    }
    setTransferAmount('')
    setIsTransferOpen(true)
  }

  const handleConfirmTransfer = (e) => {
    e.preventDefault()
    if (!transferFromId || !transferToId || transferFromId === transferToId) return
    const amt = parseFloat(transferAmount)
    if (isNaN(amt) || amt <= 0) return

    onTransferFunds({
      fromAccountId: transferFromId,
      toAccountId: transferToId,
      amount: amt
    })

    setIsTransferOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Net Worth & Assets Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              Financial Standing & Net Worth
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
              {formatCurrency(netWorth, currency)}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Total liquid assets minus outstanding liabilities and debt obligations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xs">
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                Bank Accounts & Cash
              </span>
              <span className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5 block">
                +{formatCurrency(totalAssets, currency)}
              </span>
              <span className="text-[10px] text-slate-400">{accounts.filter(a => a.type !== 'Credit Card').length} Liquid accounts</span>
            </div>

            <div className="border-l border-white/10 pl-4 sm:pl-6">
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                Available Credit Line
              </span>
              <span className="text-lg sm:text-xl font-bold text-indigo-300 mt-0.5 block">
                {formatCurrency(totalAvailableCredit, currency)}
              </span>
              <span className="text-[10px] text-slate-400">{accounts.filter(a => a.type === 'Credit Card').length} Credit cards</span>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 pl-0 sm:pl-6 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                Total Debts & Owed
              </span>
              <span className="text-lg sm:text-xl font-bold text-rose-400 mt-0.5 block">
                -{formatCurrency(totalDebt, currency)}
              </span>
              <span className="text-[10px] text-slate-400">{debts.length} Loans + Card balances</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Actions Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Toggle between Accounts and Debts */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setSubTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'accounts'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Bank Accounts ({accounts.length})</span>
          </button>

          <button
            onClick={() => setSubTab('debts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'debts'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Debts & Liabilities ({debts.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {subTab === 'accounts' ? (
            <>
              {accounts.length >= 2 && (
                <button
                  onClick={handleOpenTransfer}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Transfer Funds</span>
                </button>
              )}
              <button
                onClick={handleOpenAddAccount}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bank Account</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleOpenAddDebt}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Debt / Loan</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. BANK ACCOUNTS VIEW */}
      {subTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            const isChecking = acc.type === 'Checking'
            const isSavings = acc.type === 'Savings'
            const isCash = acc.type === 'Cash'
            const isCard = acc.type === 'Credit Card'

            const limit = Number(acc.creditLimit) || 0
            const balance = Number(acc.balance) || 0
            const availableCredit = acc.availableCredit !== undefined 
              ? Number(acc.availableCredit) 
              : Math.max(0, limit - balance)
            const installmentHolds = Math.max(0, limit - balance - availableCredit)
            const utilization = limit > 0 ? ((limit - availableCredit) / limit) * 100 : 0

            return (
              <div
                key={acc.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden ${
                  isCard && utilization > 70
                    ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: acc.color || '#3b82f6' }}
                      >
                        {isCash ? (
                          <Wallet className="w-5 h-5" />
                        ) : isSavings ? (
                          <PiggyBank className="w-5 h-5" />
                        ) : isCard ? (
                          <CreditCard className="w-5 h-5" />
                        ) : (
                          <Building2 className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {acc.name}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {acc.institution || 'Bank'} {acc.accountNumber ? `• ${acc.accountNumber}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditAccount(acc)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAccount(acc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Balance / Credit Limit Display */}
                  {isCard ? (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider block">
                            Balance Owed
                          </span>
                          <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                            {formatCurrency(balance, currency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider block">
                            Available Credit
                          </span>
                          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                            {formatCurrency(availableCredit, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Credit Limit & Utilization */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="text-slate-400 text-[11px]">
                            Credit Limit: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(limit, currency)}</strong>
                            {installmentHolds > 0 && (
                              <span className="ml-1 text-amber-600 dark:text-amber-400 font-medium">
                                (🔒 Holds: {formatCurrency(installmentHolds, currency)})
                              </span>
                            )}
                          </span>
                          {limit > 0 && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              utilization > 70
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : utilization > 30
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              {utilization.toFixed(0)}% used {utilization > 70 ? '• Near Limit' : ''}
                            </span>
                          )}
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              utilization > 70
                                ? 'bg-rose-500'
                                : utilization > 30
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, utilization))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Current Available Balance
                      </span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
                        {formatCurrency(acc.balance, currency)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    isCard
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {acc.type}
                  </span>
                  <div className="flex items-center gap-2">
                    {isCard && balance > 0 && (
                      <button
                        onClick={() => {
                          setTransferToId(acc.id)
                          setTransferFromId(accounts.find(a => a.type !== 'Credit Card')?.id || '')
                          setTransferAmount(String(balance))
                          setIsTransferOpen(true)
                        }}
                        className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                      >
                        Pay Card
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditAccount(acc)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      {isCard ? 'Edit Limit / Card' : 'Adjust Balance'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 2. DEBTS & LIABILITIES VIEW */}
      {subTab === 'debts' && (
        <div className="space-y-4">
          {debts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Debt Free!</h4>
              <p className="text-xs text-slate-500 mt-1">You have no recorded loans or debts. Add any liabilities you want to track.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {debts.map((d) => {
                const initial = Number(d.initialAmount) || 0
                const current = Number(d.currentBalance) || 0
                const paid = Math.max(0, initial - current)
                const percentPaid = initial > 0 ? (paid / initial) * 100 : 0
                const isPaidOff = current <= 0

                return (
                  <div
                    key={d.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between ${
                      isPaidOff
                        ? 'border-emerald-300 dark:border-emerald-900/60'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {d.name}
                            </h4>
                            {isPaidOff && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Paid Off!
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {d.lender || 'Lender'} • {d.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditDebt(d)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Debt"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDebt(d.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Debt"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Current Balance or Credit Card Info */}
                      {d.category === 'Credit Card' ? (
                        <div className="mt-4 space-y-3">
                          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                            <div>
                              <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider block">
                                Balance Owed
                              </span>
                              <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                                {formatCurrency(current, currency)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider block">
                                Available Credit
                              </span>
                              <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                                {formatCurrency(
                                  d.availableCredit !== undefined ? Number(d.availableCredit) : Math.max(0, initial - current),
                                  currency
                                )}
                              </span>
                            </div>
                          </div>

                          {(() => {
                            const avail = d.availableCredit !== undefined ? Number(d.availableCredit) : Math.max(0, initial - current)
                            const holds = Math.max(0, initial - current - avail)
                            const util = initial > 0 ? ((initial - avail) / initial) * 100 : 0

                            return (
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-baseline text-xs">
                                  <span className="text-slate-400 text-[11px]">
                                    Credit Limit: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(initial, currency)}</strong>
                                    {holds > 0 && (
                                      <span className="ml-1 text-amber-600 dark:text-amber-400 font-medium">
                                        (🔒 Holds: {formatCurrency(holds, currency)})
                                      </span>
                                    )}
                                  </span>
                                  {initial > 0 && (
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      util > 70
                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                        : util > 30
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                    }`}>
                                      {util.toFixed(0)}% used {util > 70 ? '• Near Limit' : ''}
                                    </span>
                                  )}
                                </div>

                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      util > 70
                                        ? 'bg-rose-500'
                                        : util > 30
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, util))}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      ) : (
                        <>
                          <div className="mt-4 flex items-baseline justify-between">
                            <div>
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Remaining Debt
                              </span>
                              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5 block">
                                {formatCurrency(current, currency)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] text-slate-400 block">Initial Loan</span>
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {formatCurrency(initial, currency)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 text-[11px]">Payoff Progress</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                {percentPaid.toFixed(1)}% paid
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(percentPaid, 100)}%` }}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Interest & Min Payment Details */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">APR Rate</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {d.interestRate ? `${d.interestRate}%` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Min Payment</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {d.minimumPayment ? formatCurrency(d.minimumPayment, currency) : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Due Day</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {d.dueDate || 'Monthly'}
                          </span>
                        </div>
                      </div>

                      {d.notes && (
                        <p className="text-xs text-slate-400 mt-2 truncate">{d.notes}</p>
                      )}
                    </div>

                    {/* Make Payment Button */}
                    {!isPaidOff && (
                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => handleOpenPayDebt(d)}
                          className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Make Debt Payment</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Bank Account Modal */}
      <Modal
        isOpen={isAddAccountOpen}
        onClose={() => {
          setIsAddAccountOpen(false)
          setEditingAccount(null)
        }}
        title={editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveAccount} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Name *
            </label>
            <input
              type="text"
              value={accountForm.name}
              onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
              placeholder="e.g. Current Bank Account, Emergency Savings, Cash"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Type
              </label>
              <select
                value={accountForm.type}
                onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
              >
                <option value="Checking">Checking / Current</option>
                <option value="Savings">Savings</option>
                <option value="Cash">Physical Cash</option>
                <option value="Credit Card">Credit Card Account</option>
                <option value="Investment">Investment / Brokerage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {accountForm.type === 'Credit Card' ? 'Balance Owed (Liability) *' : 'Current Balance *'}
              </label>
              <input
                type="number"
                step="0.01"
                value={accountForm.balance}
                onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                required
              />
            </div>
          </div>

          {accountForm.type === 'Credit Card' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Credit Limit *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={accountForm.creditLimit}
                    onChange={(e) => setAccountForm({ ...accountForm, creditLimit: e.target.value })}
                    placeholder="e.g. 60000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Available Credit Limit *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const lim = parseFloat(accountForm.creditLimit) || 0
                        const bal = parseFloat(accountForm.balance) || 0
                        setAccountForm({ ...accountForm, availableCredit: String(Math.max(0, lim - bal)) })
                      }}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Auto-fill
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={accountForm.availableCredit}
                    onChange={(e) => setAccountForm({ ...accountForm, availableCredit: e.target.value })}
                    placeholder="e.g. 30000 (Adjust for hidden installments)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    required
                  />
                </div>
              </div>

              {/* Live Available Credit, Installment Holds & Utilization breakdown */}
              {(() => {
                const lim = parseFloat(accountForm.creditLimit) || 0
                const bal = parseFloat(accountForm.balance) || 0
                const avail = accountForm.availableCredit !== '' ? parseFloat(accountForm.availableCredit) : Math.max(0, lim - bal)
                const holds = Math.max(0, lim - bal - avail)
                const util = lim > 0 ? ((lim - avail) / lim) * 100 : 0

                return (
                  <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-700 dark:text-purple-300 font-medium">Available Credit Limit:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(avail, currency)}
                      </span>
                    </div>
                    {holds > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-700 dark:text-amber-400 font-medium">Unbilled Installments / Holds:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(holds, currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-700 dark:text-purple-300 font-medium">Total Credit Line Used:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {util.toFixed(1)}% ({formatCurrency(lim - avail, currency)} of {formatCurrency(lim, currency)})
                      </span>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bank / Financial Institution
              </label>
              <input
                type="text"
                value={accountForm.institution}
                onChange={(e) => setAccountForm({ ...accountForm, institution: e.target.value })}
                placeholder="e.g. Chase, Wells Fargo, HSBC"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last 4 Digits / Mask (optional)
              </label>
              <input
                type="text"
                value={accountForm.accountNumber}
                onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                placeholder="e.g. ****4821"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddAccountOpen(false)
                setEditingAccount(null)
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Save Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Debt Modal */}
      <Modal
        isOpen={isAddDebtOpen}
        onClose={() => {
          setIsAddDebtOpen(false)
          setEditingDebt(null)
        }}
        title={editingDebt ? 'Edit Debt / Liability' : 'Add Debt / Liability'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveDebt} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Debt / Loan Name *
            </label>
            <input
              type="text"
              value={debtForm.name}
              onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })}
              placeholder="e.g. Car Loan, Student Loan, Mortgage, Credit Card"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={debtForm.category}
                onChange={(e) => setDebtForm({ ...debtForm, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
              >
                <option value="Auto Loan">Auto / Car Loan</option>
                <option value="Education">Student Loan</option>
                <option value="Credit Card">Credit Card Debt</option>
                <option value="Mortgage">Mortgage / Home Loan</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Other Debt">Other Liability</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lender / Creditor
              </label>
              <input
                type="text"
                value={debtForm.lender}
                onChange={(e) => setDebtForm({ ...debtForm, lender: e.target.value })}
                placeholder="e.g. Bank, Toyota, Sallie Mae"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {debtForm.category === 'Credit Card' ? 'Total Credit Limit *' : 'Initial Loan Amount *'}
              </label>
              <input
                type="number"
                step="0.01"
                value={debtForm.initialAmount}
                onChange={(e) => setDebtForm({ ...debtForm, initialAmount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {debtForm.category === 'Credit Card' ? 'Current Balance Owed *' : 'Current Remaining Balance *'}
              </label>
              <input
                type="number"
                step="0.01"
                value={debtForm.currentBalance}
                onChange={(e) => setDebtForm({ ...debtForm, currentBalance: e.target.value })}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                required
              />
            </div>
          </div>

          {debtForm.category === 'Credit Card' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Available Credit Limit *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const lim = parseFloat(debtForm.initialAmount) || 0
                      const bal = parseFloat(debtForm.currentBalance) || 0
                      setDebtForm({ ...debtForm, availableCredit: String(Math.max(0, lim - bal)) })
                    }}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    Auto-fill
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={debtForm.availableCredit}
                  onChange={(e) => setDebtForm({ ...debtForm, availableCredit: e.target.value })}
                  placeholder="e.g. 42000 (Adjust for hidden installments)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  required
                />
              </div>

              {/* Live Available Credit, Installment Holds & Utilization breakdown */}
              {(() => {
                const lim = parseFloat(debtForm.initialAmount) || 0
                const bal = parseFloat(debtForm.currentBalance) || 0
                const avail = debtForm.availableCredit !== '' ? parseFloat(debtForm.availableCredit) : Math.max(0, lim - bal)
                const holds = Math.max(0, lim - bal - avail)
                const util = lim > 0 ? ((lim - avail) / lim) * 100 : 0

                return (
                  <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-700 dark:text-purple-300 font-medium">Available Credit Limit:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(avail, currency)}
                      </span>
                    </div>
                    {holds > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-700 dark:text-amber-400 font-medium">Unbilled Installments / Holds:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(holds, currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-700 dark:text-purple-300 font-medium">Total Credit Line Used:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {util.toFixed(1)}% ({formatCurrency(lim - avail, currency)} of {formatCurrency(lim, currency)})
                      </span>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                APR %
              </label>
              <input
                type="number"
                step="0.01"
                value={debtForm.interestRate}
                onChange={(e) => setDebtForm({ ...debtForm, interestRate: e.target.value })}
                placeholder="e.g. 4.5"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min Payment
              </label>
              <input
                type="number"
                step="0.01"
                value={debtForm.minimumPayment}
                onChange={(e) => setDebtForm({ ...debtForm, minimumPayment: e.target.value })}
                placeholder="e.g. 250"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Day
              </label>
              <input
                type="text"
                value={debtForm.dueDate}
                onChange={(e) => setDebtForm({ ...debtForm, dueDate: e.target.value })}
                placeholder="e.g. 15th"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={debtForm.notes}
              onChange={(e) => setDebtForm({ ...debtForm, notes: e.target.value })}
              placeholder="e.g. Account details, payoff strategy"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddDebtOpen(false)
                setEditingDebt(null)
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
            >
              Save Debt
            </button>
          </div>
        </form>
      </Modal>

      {/* Pay Debt Modal */}
      <Modal
        isOpen={!!payingDebt}
        onClose={() => setPayingDebt(null)}
        title={payingDebt ? `Make Payment for ${payingDebt.name}` : ''}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmPayDebt} className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining Balance:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {payingDebt ? formatCurrency(payingDebt.currentBalance, currency) : ''}
              </span>
            </div>
            {payingDebt?.minimumPayment > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Suggested Min Payment:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatCurrency(payingDebt.minimumPayment, currency)}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deduct from Bank Account *
            </label>
            <select
              value={paymentSourceAccountId}
              onChange={(e) => setPaymentSourceAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatCurrency(acc.balance, currency)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPayingDebt(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Transfer Funds Modal */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Transfer Funds Between Accounts"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              From Account *
            </label>
            <select
              value={transferFromId}
              onChange={(e) => setTransferFromId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatCurrency(a.balance, currency)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              To Destination Account *
            </label>
            <select
              value={transferToId}
              onChange={(e) => setTransferToId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id} disabled={a.id === transferFromId}>
                  {a.name} ({formatCurrency(a.balance, currency)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Transfer Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsTransferOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Transfer Now
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
