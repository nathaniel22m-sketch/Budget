export const DEFAULT_CATEGORIES = [
  // Expenses
  { id: 'cat-debt', name: 'Loan & Debt Repayments', type: 'expense', color: '#f43f5e', icon: 'DollarSign', defaultLimit: 500 },
  { id: 'cat-housing', name: 'Housing & Rent', type: 'expense', color: '#6366f1', icon: 'Home', defaultLimit: 1200 },
  { id: 'cat-food', name: 'Food & Groceries', type: 'expense', color: '#10b981', icon: 'Utensils', defaultLimit: 500 },
  { id: 'cat-dining', name: 'Restaurants & Coffee', type: 'expense', color: '#f59e0b', icon: 'Coffee', defaultLimit: 250 },
  { id: 'cat-transport', name: 'Transportation & Gas', type: 'expense', color: '#3b82f6', icon: 'Car', defaultLimit: 200 },
  { id: 'cat-utilities', name: 'Utilities & Bills', type: 'expense', color: '#06b6d4', icon: 'Zap', defaultLimit: 180 },
  { id: 'cat-entertainment', name: 'Entertainment & Fun', type: 'expense', color: '#ec4899', icon: 'Film', defaultLimit: 150 },
  { id: 'cat-shopping', name: 'Shopping & Clothes', type: 'expense', color: '#8b5cf6', icon: 'ShoppingBag', defaultLimit: 200 },
  { id: 'cat-health', name: 'Health & Medical', type: 'expense', color: '#ef4444', icon: 'HeartPulse', defaultLimit: 100 },
  { id: 'cat-education', name: 'Education & Courses', type: 'expense', color: '#14b8a6', icon: 'GraduationCap', defaultLimit: 80 },
  { id: 'cat-travel', name: 'Travel & Vacation', type: 'expense', color: '#f97316', icon: 'Plane', defaultLimit: 300 },
  { id: 'cat-subscriptions', name: 'Subscriptions', type: 'expense', color: '#a855f7', icon: 'Repeat', defaultLimit: 60 },
  { id: 'cat-other-exp', name: 'Other Expenses', type: 'expense', color: '#64748b', icon: 'MoreHorizontal', defaultLimit: 100 },

  // Income
  { id: 'cat-salary', name: 'Salary & Wages', type: 'income', color: '#10b981', icon: 'Briefcase', defaultLimit: 0 },
  { id: 'cat-freelance', name: 'Freelance & Side Hustle', type: 'income', color: '#06b6d4', icon: 'Laptop', defaultLimit: 0 },
  { id: 'cat-investments', name: 'Investments & Dividends', type: 'income', color: '#8b5cf6', icon: 'TrendingUp', defaultLimit: 0 },
  { id: 'cat-gifts', name: 'Gifts & Grants', type: 'income', color: '#ec4899', icon: 'Gift', defaultLimit: 0 },
  { id: 'cat-other-inc', name: 'Other Income', type: 'income', color: '#14b8a6', icon: 'PlusCircle', defaultLimit: 0 },
]

export const CATEGORY_COLORS = [
  '#f43f5e', '#6366f1', '#10b981', '#f59e0b', '#3b82f6',
  '#06b6d4', '#ec4899', '#8b5cf6', '#ef4444',
  '#14b8a6', '#f97316', '#a855f7', '#64748b'
]
