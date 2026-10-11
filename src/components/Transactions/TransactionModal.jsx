import React, { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { PAYMENT_METHODS } from '../../constants/currencies'
import { CategoryIcon } from '../common/CategoryIcon'
import { formatCurrency, getCurrencySymbol } from '../../utils/formatters'
import { CreditCard, Wallet, Landmark, Smartphone, AlertTriangle, CheckCircle2, Lock } from 'lucide-react'

const DEFAULT_EMPTY_ARRAY = []

export const TransactionModal = ({
  isOpen,
  onClose,
  onSave,
  categories,
  accounts = DEFAULT_EMPTY_ARRAY,
  debts = DEFAULT_EMPTY_ARRAY,
  currency = 'USD',
  transactionToEdit = null
}) => {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [debtId, setDebtId] = useState('')
  const [chargeDebtId, setChargeDebtId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [paymentSourceType, setPaymentSourceType] = useState('credit_card') // 'credit_card' | 'cash' | 'bank' | 'other'
  const [tagsInput, setTagsInput] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})

  // Filter categories by selected type (income/expense)
  const availableCategories = categories.filter(c => c.type === type)

  // Accounts grouped by function
  const creditCardAccounts = accounts.filter(a => a.type === 'Credit Card')
  const creditCardDebts = debts.filter(d => d.category === 'Credit Card')
  const cashAccount = accounts.find(a => a.type === 'Cash')
  const bankAccounts = accounts.filter(a => a.type !== 'Credit Card' && a.type !== 'Cash')

  useEffect(() => {
    if (!isOpen) return

    if (transactionToEdit) {
      setTitle(transactionToEdit.title || '')
      setAmount(transactionToEdit.amount ? String(transactionToEdit.amount) : '')
      setType(transactionToEdit.type || 'expense')
      setCategoryId(transactionToEdit.categoryId || '')
      setAccountId(transactionToEdit.accountId || (accounts[0]?.id || ''))
      setDebtId(transactionToEdit.debtId || '')
      setChargeDebtId(transactionToEdit.chargeDebtId || '')
      setDate(transactionToEdit.date || new Date().toISOString().split('T')[0])
      const pm = transactionToEdit.paymentMethod || PAYMENT_METHODS[0]
      setPaymentMethod(pm)

      // Auto-detect paymentSourceType
      const acc = accounts.find(a => a.id === transactionToEdit.accountId)
      if (acc?.type === 'Credit Card' || pm.toLowerCase().includes('credit') || transactionToEdit.chargeDebtId) {
        setPaymentSourceType('credit_card')
      } else if (acc?.type === 'Cash' || pm === 'Cash') {
        setPaymentSourceType('cash')
      } else if (acc?.type === 'Checking' || acc?.type === 'Savings' || pm === 'Debit Card' || pm === 'Bank Transfer') {
        setPaymentSourceType('bank')
      } else {
        setPaymentSourceType('other')
      }

      setTagsInput(Array.isArray(transactionToEdit.tags) ? transactionToEdit.tags.join(', ') : (transactionToEdit.tags || ''))
      setNotes(transactionToEdit.notes || '')
      setErrors({})
    } else {
      setTitle('')
      setAmount('')
      setType('expense')
      const firstExp = categories.find(c => c.type === 'expense')
      setCategoryId(firstExp ? firstExp.id : '')
      setDebtId('')
      setChargeDebtId('')
      setDate(new Date().toISOString().split('T')[0])

      // Smart default: Credit Card if user has one, otherwise Cash, otherwise Bank
      if (creditCardAccounts.length > 0) {
        setPaymentSourceType('credit_card')
        setAccountId(creditCardAccounts[0].id)
        setPaymentMethod('Credit Card')
      } else if (cashAccount) {
        setPaymentSourceType('cash')
        setAccountId(cashAccount.id)
        setPaymentMethod('Cash')
      } else {
        setPaymentSourceType('bank')
        setAccountId(bankAccounts[0]?.id || accounts[0]?.id || '')
        setPaymentMethod('Debit Card')
      }

      setTagsInput('')
      setNotes('')
      setErrors({})
    }
  }, [transactionToEdit, isOpen])

  const handleTypeChange = (newType) => {
    setType(newType)
    const currentCat = categories.find(c => c.id === categoryId)
    if (!currentCat || currentCat.type !== newType) {
      const firstValid = categories.find(c => c.type === newType)
      if (firstValid) setCategoryId(firstValid.id)
    }
    if (newType === 'income') {
      setDebtId('')
    }
  }

  // Handle switching between Cash, Credit Card, Bank Account, or Other E-Wallet
  const handleSelectSourceType = (st) => {
    setPaymentSourceType(st)
    if (st === 'credit_card') {
      if (creditCardAccounts.length > 0) {
        setAccountId(creditCardAccounts[0].id)
        setChargeDebtId('')
        setPaymentMethod(`Credit Card: ${creditCardAccounts[0].name}`)
      } else if (creditCardDebts.length > 0) {
        setChargeDebtId(creditCardDebts[0].id)
        setAccountId('')
        setPaymentMethod(`Credit Card: ${creditCardDebts[0].name}`)
      } else {
        setPaymentMethod('Credit Card')
      }
    } else if (st === 'cash') {
      if (cashAccount) {
        setAccountId(cashAccount.id)
      } else {
        setAccountId(accounts[0]?.id || '')
      }
      setChargeDebtId('')
      setPaymentMethod('Cash')
    } else if (st === 'bank') {
      const bAcc = bankAccounts[0] || accounts[0]
      if (bAcc) {
        setAccountId(bAcc.id)
      }
      setChargeDebtId('')
      setPaymentMethod('Debit Card')
    } else {
      setChargeDebtId('')
      setAccountId(accounts[0]?.id || '')
      setPaymentMethod('GCash / Maya')
    }
  }

  // Combined list of credit cards across Accounts and Debts
  const allCards = [
    ...creditCardAccounts.map(c => ({
      key: `acc:${c.id}`,
      id: c.id,
      name: c.name,
      institution: c.institution,
      accountNumber: c.accountNumber,
      availableCredit: c.availableCredit !== undefined 
        ? Number(c.availableCredit) 
        : Math.max(0, (Number(c.creditLimit) || 0) - (Number(c.balance) || 0)),
      creditLimit: Number(c.creditLimit) || 0,
      balance: Number(c.balance) || 0,
      isDebt: false
    })),
    ...creditCardDebts.map(d => ({
      key: `debt:${d.id}`,
      id: d.id,
      name: d.name,
      institution: d.lender,
      accountNumber: '',
      availableCredit: d.availableCredit !== undefined 
        ? Number(d.availableCredit) 
        : Math.max(0, (Number(d.initialAmount) || 0) - (Number(d.currentBalance) || 0)),
      creditLimit: Number(d.initialAmount) || 0,
      balance: Number(d.currentBalance) || 0,
      isDebt: true
    }))
  ]

  const handleSelectCard = (cardKey) => {
    if (cardKey.startsWith('acc:')) {
      const id = cardKey.replace('acc:', '')
      setAccountId(id)
      setChargeDebtId('')
      const acc = creditCardAccounts.find(a => a.id === id)
      setPaymentMethod(`Credit Card: ${acc?.name || ''}`)
    } else if (cardKey.startsWith('debt:')) {
      const id = cardKey.replace('debt:', '')
      setChargeDebtId(id)
      setAccountId('')
      const debt = creditCardDebts.find(d => d.id === id)
      setPaymentMethod(`Credit Card: ${debt?.name || ''}`)
    }
  }

  // Active credit card data detection
  const isCreditCardPayment = paymentSourceType === 'credit_card'
  const activeCard = chargeDebtId
    ? null
    : (creditCardAccounts.find(a => a.id === accountId) || (isCreditCardPayment && creditCardAccounts.length > 0 ? creditCardAccounts[0] : null))

  const activeDebtCard = activeCard
    ? null
    : (creditCardDebts.find(d => d.id === chargeDebtId) || (isCreditCardPayment && creditCardDebts.length > 0 ? creditCardDebts[0] : null))

  const cardData = activeCard
    ? {
        key: `acc:${activeCard.id}`,
        id: activeCard.id,
        name: activeCard.name,
        institution: activeCard.institution,
        accountNumber: activeCard.accountNumber,
        balance: Number(activeCard.balance) || 0,
        creditLimit: Number(activeCard.creditLimit) || 0,
        availableCredit: activeCard.availableCredit !== undefined 
          ? Number(activeCard.availableCredit) 
          : Math.max(0, (Number(activeCard.creditLimit) || 0) - (Number(activeCard.balance) || 0)),
        isDebt: false
      }
    : activeDebtCard
    ? {
        key: `debt:${activeDebtCard.id}`,
        id: activeDebtCard.id,
        name: activeDebtCard.name,
        institution: activeDebtCard.lender,
        accountNumber: '',
        balance: Number(activeDebtCard.currentBalance) || 0,
        creditLimit: Number(activeDebtCard.initialAmount) || 0,
        availableCredit: activeDebtCard.availableCredit !== undefined
          ? Number(activeDebtCard.availableCredit)
          : Math.max(0, (Number(activeDebtCard.initialAmount) || 0) - (Number(activeDebtCard.currentBalance) || 0)),
        isDebt: true
      }
    : null

  const cardLimit = cardData ? cardData.creditLimit : 0
  const cardBalance = cardData ? cardData.balance : 0
  const cardAvailCredit = cardData ? cardData.availableCredit : 0
  const cardHolds = Math.max(0, cardLimit - cardBalance - cardAvailCredit)
  const numAmount = parseFloat(amount) || 0
  const isExpense = type === 'expense'
  const projectedBalance = isExpense ? cardBalance + numAmount : Math.max(0, cardBalance - numAmount)
  const projectedAvail = Math.max(0, cardAvailCredit - numAmount)
  const isOverLimit = isExpense && numAmount > cardAvailCredit && cardLimit > 0
  const cardUtilization = cardLimit > 0 ? Math.min(100, Math.max(0, ((cardLimit - cardAvailCredit) / cardLimit) * 100)) : 0

  const cashBalance = cashAccount ? Number(cashAccount.balance) || 0 : 0
  const selectedBankAccount = bankAccounts.find(a => a.id === accountId) || bankAccounts[0]

  const validate = () => {
    const errs = {}
    if (!title.trim()) errs.title = 'Title / Description is required'
    const numAmt = parseFloat(amount)
    if (isNaN(numAmt) || numAmt <= 0) errs.amount = 'Please enter a valid amount greater than 0'
    if (!categoryId) errs.categoryId = 'Please select a category'
    if (!date) errs.date = 'Date is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean)

    const payload = {
      id: transactionToEdit ? transactionToEdit.id : 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      categoryId,
      accountId: chargeDebtId ? '' : (accountId || accounts[0]?.id || ''),
      chargeDebtId: chargeDebtId || undefined,
      debtId: type === 'expense' && !chargeDebtId ? (debtId || undefined) : undefined,
      date,
      paymentMethod,
      tags,
      notes: notes.trim()
    }

    onSave(payload)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Record New Transaction'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle: Expense / Income */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Income (+)
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description / Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Grocery store, Salary, Coffee, Car Payment"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                {getCurrencySymbol(currency)}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
            {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
          </div>
        </div>

        {/* Category & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
            >
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-rose-500 mt-1">{errors.categoryId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. groceries, dining, work"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {/* Integrated Payment Source & Method */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Payment Source & Method *
            </label>
            <span className="text-[11px] text-slate-400">
              {paymentSourceType === 'credit_card' ? 'Charges to credit card' : paymentSourceType === 'cash' ? 'Cash on hand' : paymentSourceType === 'bank' ? 'Bank debit / transfer' : 'E-wallet payment'}
            </span>
          </div>

          {/* 4-Pill Segmented Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => handleSelectSourceType('credit_card')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                paymentSourceType === 'credit_card'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Credit Card</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSourceType('cash')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                paymentSourceType === 'cash'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Wallet className="w-4 h-4 shrink-0" />
              <span>Cash</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSourceType('bank')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                paymentSourceType === 'bank'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Landmark className="w-4 h-4 shrink-0" />
              <span>Bank Account</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSourceType('other')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                paymentSourceType === 'other'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>E-Wallet</span>
            </button>
          </div>

          {/* Contextual Panel: Credit Card */}
          {paymentSourceType === 'credit_card' && (
            <div className="space-y-2">
              {allCards.length > 1 && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Select Card
                  </label>
                  <select
                    value={cardData ? cardData.key : ''}
                    onChange={(e) => handleSelectCard(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 cursor-pointer"
                  >
                    {allCards.map(c => (
                      <option key={c.key} value={c.key}>
                        {c.name} (Avail: {formatCurrency(c.availableCredit, currency)} / Limit: {formatCurrency(c.creditLimit, currency)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {cardData ? (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/90 to-indigo-50/60 dark:from-purple-950/40 dark:to-indigo-950/30 border border-purple-200/80 dark:border-purple-800/60 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {cardData.name}
                          {cardData.accountNumber && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              {cardData.accountNumber}
                            </span>
                          )}
                        </h5>
                        <span className="text-[10px] text-purple-700 dark:text-purple-300">
                          {cardData.institution || 'Credit Card'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {cardHolds > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Holds: {formatCurrency(cardHolds, currency)}
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        cardUtilization > 70
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : cardUtilization > 30
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {cardUtilization.toFixed(0)}% used
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-200/60 dark:border-purple-800/40">
                    <div>
                      <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider block">
                        Current Balance Owed
                      </span>
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                        {formatCurrency(cardData.balance, currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider block">
                        Available Credit Limit
                      </span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        {formatCurrency(cardAvailCredit, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Projection upon typing transaction amount */}
                  {numAmount > 0 && isExpense && (
                    <div className={`pt-2 border-t text-xs flex items-center justify-between ${
                      isOverLimit
                        ? 'border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
                        : 'border-purple-200/60 dark:border-purple-800/40 text-slate-600 dark:text-slate-300'
                    }`}>
                      <span className="text-[11px] font-medium flex items-center gap-1">
                        {isOverLimit && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                        After charge (-{formatCurrency(numAmount, currency)}):
                      </span>
                      <span className="font-bold">
                        Remaining Avail: {formatCurrency(projectedAvail, currency)}
                        {isOverLimit ? ' ⚠️ (Over Limit!)' : ''}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                  No credit cards registered yet. You can add one under <strong>Accounts & Debts</strong>.
                </div>
              )}
            </div>
          )}

          {/* Contextual Panel: Cash */}
          {paymentSourceType === 'cash' && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/60 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {cashAccount ? cashAccount.name : 'Physical Cash Wallet'}
                    </h5>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                      Cash on Hand
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Available Cash
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(cashBalance, currency)}
                  </span>
                </div>
              </div>

              {numAmount > 0 && isExpense && (
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 text-xs flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-[11px] font-medium">
                    Cash after payment (-{formatCurrency(numAmount, currency)}):
                  </span>
                  <span className={`font-bold ${cashBalance < numAmount ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    Remaining: {formatCurrency(Math.max(0, cashBalance - numAmount), currency)}
                    {cashBalance < numAmount ? ' (Exceeds Cash)' : ''}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Contextual Panel: Bank Account */}
          {paymentSourceType === 'bank' && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/60 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-800/60 shadow-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Bank Account
                  </label>
                  <select
                    value={selectedBankAccount?.id || ''}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({formatCurrency(b.balance, currency)})
                      </option>
                    ))}
                    {bankAccounts.length === 0 && (
                      <option value="">No bank accounts available</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Method
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Debit Card')}
                      className={`py-1 text-xs font-semibold rounded-lg transition-all ${
                        paymentMethod === 'Debit Card'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Debit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Bank Transfer')}
                      className={`py-1 text-xs font-semibold rounded-lg transition-all ${
                        paymentMethod === 'Bank Transfer'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Transfer
                    </button>
                  </div>
                </div>
              </div>

              {selectedBankAccount && (
                <div className="flex items-center justify-between pt-1 border-t border-blue-200/60 dark:border-blue-800/40 text-xs">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Account Balance: <strong className="text-slate-900 dark:text-white">{formatCurrency(selectedBankAccount.balance, currency)}</strong>
                  </span>
                  {numAmount > 0 && isExpense && (
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                      After: {formatCurrency(Math.max(0, (Number(selectedBankAccount.balance) || 0) - numAmount), currency)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contextual Panel: Other / E-Wallet */}
          {paymentSourceType === 'other' && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/60 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/60 shadow-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    App / Payment Service
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                  >
                    <option value="GCash / Maya">GCash / Maya</option>
                    <option value="Mobile Payment">Mobile Payment</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Deduct Balance From (Optional)
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatCurrency(a.balance, currency)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Optional: Debt Payoff Link (if Expense and not paying via credit card) */}
        {type === 'expense' && debts.length > 0 && paymentSourceType !== 'credit_card' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Apply Payment to Debt (Optional)
            </label>
            <select
              value={debtId}
              onChange={(e) => setDebtId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
            >
              <option value="">-- None (Standard Expense) --</option>
              {debts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (Balance: {formatCurrency(d.currentBalance, currency)})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes / Memo (optional)
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add details, receipt reference, or note..."
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            {transactionToEdit ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
