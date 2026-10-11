import React from 'react'
import { Landmark, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, CreditCard, ShieldCheck } from 'lucide-react'
import { formatCurrency, formatPercent } from '../../utils/formatters'

export const SummaryCards = ({
  totalIncome,
  totalExpense,
  balance,
  accounts = [],
  debts = [],
  currency = 'USD'
}) => {
  const netSavings = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0
  const isHealthyRate = savingsRate >= 20

  const creditCards = accounts.filter(a => a.type === 'Credit Card')
  const debtCards = debts.filter(d => d.category === 'Credit Card')
  const allCardsCount = creditCards.length + debtCards.length

  const totalBankBalance = accounts
    .filter(a => a.type !== 'Credit Card')
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0)

  const totalCreditCardBalances = creditCards
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0)

  const totalDebtCardBalances = debtCards
    .reduce((sum, d) => sum + (Number(d.currentBalance) || 0), 0)

  const totalCreditLimit = creditCards.reduce((sum, a) => sum + (Number(a.creditLimit) || 0), 0) +
    debtCards.reduce((sum, d) => sum + (Number(d.initialAmount) || 0), 0)

  const totalAvailableCredit = creditCards.reduce((sum, a) => {
    const avail = a.availableCredit !== undefined 
      ? Number(a.availableCredit) 
      : Math.max(0, (Number(a.creditLimit) || 0) - (Number(a.balance) || 0))
    return sum + avail
  }, 0) + debtCards.reduce((sum, d) => {
    const avail = d.availableCredit !== undefined 
      ? Number(d.availableCredit) 
      : Math.max(0, (Number(d.initialAmount) || 0) - (Number(d.currentBalance) || 0))
    return sum + avail
  }, 0)

  const totalInstallmentHolds = Math.max(0, totalCreditLimit - (totalCreditCardBalances + totalDebtCardBalances) - totalAvailableCredit)
  const totalRevolvingUtilization = totalCreditLimit > 0
    ? Math.min(100, Math.max(0, ((totalCreditLimit - totalAvailableCredit) / totalCreditLimit) * 100))
    : 0

  const totalDebtBalance = debts.reduce((sum, d) => sum + (Number(d.currentBalance) || 0), 0) + totalCreditCardBalances
  const netWorth = totalBankBalance - totalDebtBalance

  return (
    <div className="space-y-4">
      {/* Mini Net Worth Summary Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Estimated Net Worth
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(netWorth, currency)}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                netWorth >= 0
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
              }`}>
                {netWorth >= 0 ? 'Positive Assets' : 'Net Liability'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-500">Bank Accounts:</span>
            <strong className="text-slate-900 dark:text-slate-100">{formatCurrency(totalBankBalance, currency)}</strong>
          </div>
          {totalAvailableCredit > 0 && (
            <div className="border-l border-slate-200 dark:border-slate-800 pl-4 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-purple-500" />
              <span className="text-slate-500">Avail. Credit:</span>
              <strong className="text-purple-600 dark:text-purple-400">{formatCurrency(totalAvailableCredit, currency)}</strong>
            </div>
          )}
          <div className="border-l border-slate-200 dark:border-slate-800 pl-4 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-rose-500" />
            <span className="text-slate-500">Debts Owed:</span>
            <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(totalDebtBalance, currency)}</strong>
          </div>
        </div>
      </div>

      {/* 5 Metrics Cards Grid: Bank Assets, Available Credit, Income, Expenses, Savings Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Bank Accounts Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Bank Assets</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(totalBankBalance, currency)}
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="text-blue-500 font-semibold">{accounts.filter(a => a.type !== 'Credit Card').length} accounts</span>
              <span>cash & savings</span>
            </div>
          </div>
        </div>

        {/* 2. Available Credit Limit (Prominent Dashboard Card) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Available Credit Line</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
                {formatCurrency(totalAvailableCredit, currency)}
              </h2>
              {totalCreditLimit > 0 && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  totalRevolvingUtilization > 70
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : totalRevolvingUtilization > 30
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {totalRevolvingUtilization.toFixed(0)}% used
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
              <span className="truncate">Limit: {formatCurrency(totalCreditLimit, currency)}</span>
              {totalInstallmentHolds > 0 && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Holds: {formatCurrency(totalInstallmentHolds, currency)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Total Income */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Period Income</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome, currency)}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              <span>Earnings logged</span>
            </div>
          </div>
        </div>

        {/* 4. Total Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Period Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {formatCurrency(totalExpense, currency)}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
              <span>Money spent</span>
            </div>
          </div>
        </div>

        {/* 5. Net Savings & Savings Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Savings Rate</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {formatPercent(savingsRate)}
              </h2>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isHealthyRate 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
              }`}>
                {isHealthyRate ? '≥20% Goal' : '<20%'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
              <span>Net: {formatCurrency(netSavings, currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
