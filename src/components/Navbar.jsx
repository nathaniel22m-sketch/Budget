import React, { useState } from 'react'
import {
  Wallet,
  LayoutDashboard,
  ReceiptText,
  Target,
  Repeat,
  Landmark,
  Sun,
  Moon,
  Download,
  Plus,
  RotateCcw,
  Trash2,
  ChevronDown
} from 'lucide-react'
import { CURRENCIES } from '../constants/currencies'

export const Navbar = ({
  activeTab,
  setActiveTab,
  currency,
  onCurrencyChange,
  theme,
  onToggleTheme,
  onOpenExportImport,
  onOpenAddModal,
  onResetData,
  onClearData
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'accounts', label: 'Accounts & Debts', icon: Landmark },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  BudgetFlow
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    Pro
                  </span>
                </span>
                <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">Smart Budget & Expense Logger</p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="text-xs font-semibold py-1.5 px-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              title="Select Currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>

            {/* Export / Import Modal Trigger with Excel indicator */}
            <button
              onClick={onOpenExportImport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl transition-colors"
              title="Export to Excel or CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Excel / Export</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Reset / Settings dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Data Options"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {isSettingsOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 text-xs"
                  onMouseLeave={() => setIsSettingsOpen(false)}
                >
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false)
                      onResetData()
                    }}
                    className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Reset to Sample Data</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false)
                      onClearData()
                    }}
                    className="w-full px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Transactions</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Add Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Record</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between gap-0.5 py-1.5 px-1 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-1.5 text-[10px] sm:text-[11px] font-medium shrink-0 transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
