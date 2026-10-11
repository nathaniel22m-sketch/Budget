import { DEFAULT_CATEGORIES } from '../constants/defaultCategories'
import { SAMPLE_TRANSACTIONS, SAMPLE_RECURRING, SAMPLE_ACCOUNTS, SAMPLE_DEBTS } from '../constants/sampleData'

const STORAGE_KEYS = {
  TRANSACTIONS: 'budget_app_transactions_v1',
  CATEGORIES: 'budget_app_categories_v1',
  CATEGORY_BUDGETS: 'budget_app_category_budgets_v1',
  RECURRING: 'budget_app_recurring_v1',
  ACCOUNTS: 'budget_app_accounts_v1',
  DEBTS: 'budget_app_debts_v1',
  CURRENCY: 'budget_app_currency_v1',
  THEME: 'budget_app_theme_v1'
}

export const loadInitialData = () => {
  try {
    const rawTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
    const rawCat = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    const rawBud = localStorage.getItem(STORAGE_KEYS.CATEGORY_BUDGETS)
    const rawRec = localStorage.getItem(STORAGE_KEYS.RECURRING)
    const rawAcc = localStorage.getItem(STORAGE_KEYS.ACCOUNTS)
    const rawDebts = localStorage.getItem(STORAGE_KEYS.DEBTS)
    const rawCur = localStorage.getItem(STORAGE_KEYS.CURRENCY)
    const rawTheme = localStorage.getItem(STORAGE_KEYS.THEME)

    let categories = rawCat ? JSON.parse(rawCat) : DEFAULT_CATEGORIES
    if (!categories.some(c => c.id === 'cat-debt')) {
      const debtCat = DEFAULT_CATEGORIES.find(c => c.id === 'cat-debt')
      if (debtCat) categories = [debtCat, ...categories]
    }
    
    // Default budgets map
    const defaultBudgetsMap = {}
    DEFAULT_CATEGORIES.filter(c => c.type === 'expense').forEach(c => {
      defaultBudgetsMap[c.id] = c.defaultLimit
    })
    const categoryBudgets = rawBud ? JSON.parse(rawBud) : defaultBudgetsMap

    const transactions = rawTx ? JSON.parse(rawTx) : SAMPLE_TRANSACTIONS
    const recurring = rawRec ? JSON.parse(rawRec) : SAMPLE_RECURRING
    const accounts = rawAcc ? JSON.parse(rawAcc) : SAMPLE_ACCOUNTS
    const debts = rawDebts ? JSON.parse(rawDebts) : SAMPLE_DEBTS
    const currency = (rawCur && JSON.parse(rawCur) !== 'USD') ? JSON.parse(rawCur) : 'PHP'
    const theme = rawTheme ? JSON.parse(rawTheme) : 'dark'

    return {
      transactions,
      categories,
      categoryBudgets,
      recurring,
      accounts,
      debts,
      currency,
      theme
    }
  } catch (err) {
    console.error('Failed to load data from localStorage:', err)
    return {
      transactions: SAMPLE_TRANSACTIONS,
      categories: DEFAULT_CATEGORIES,
      categoryBudgets: {},
      recurring: SAMPLE_RECURRING,
      accounts: SAMPLE_ACCOUNTS,
      debts: SAMPLE_DEBTS,
      currency: 'PHP',
      theme: 'dark'
    }
  }
}

export const saveStorageItem = (key, value) => {
  try {
    localStorage.setItem(STORAGE_KEYS[key] || key, JSON.stringify(value))
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err)
  }
}

export const resetToSampleData = () => {
  const defaultBudgetsMap = {}
  DEFAULT_CATEGORIES.filter(c => c.type === 'expense').forEach(c => {
    defaultBudgetsMap[c.id] = c.defaultLimit
  })

  saveStorageItem('TRANSACTIONS', SAMPLE_TRANSACTIONS)
  saveStorageItem('CATEGORIES', DEFAULT_CATEGORIES)
  saveStorageItem('CATEGORY_BUDGETS', defaultBudgetsMap)
  saveStorageItem('RECURRING', SAMPLE_RECURRING)
  saveStorageItem('ACCOUNTS', SAMPLE_ACCOUNTS)
  saveStorageItem('DEBTS', SAMPLE_DEBTS)
  
  return {
    transactions: SAMPLE_TRANSACTIONS,
    categories: DEFAULT_CATEGORIES,
    categoryBudgets: defaultBudgetsMap,
    recurring: SAMPLE_RECURRING,
    accounts: SAMPLE_ACCOUNTS,
    debts: SAMPLE_DEBTS
  }
}

export const clearAllData = () => {
  saveStorageItem('TRANSACTIONS', [])
  saveStorageItem('RECURRING', [])
  return {
    transactions: [],
    recurring: []
  }
}
