// Helper to generate dates relative to current date
const now = new Date()
const formatDate = (offsetDays) => {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offsetDays)
  return d.toISOString().split('T')[0]
}

export const SAMPLE_TRANSACTIONS = [
  // Income
  {
    id: 'tx-1',
    title: 'Monthly Tech Salary',
    amount: 4500,
    type: 'income',
    categoryId: 'cat-salary',
    date: formatDate(1),
    paymentMethod: 'Bank Transfer',
    tags: ['salary', 'main-job'],
    notes: 'Direct deposit for current month'
  },
  {
    id: 'tx-2',
    title: 'Freelance Web Design Project',
    amount: 850,
    type: 'income',
    categoryId: 'cat-freelance',
    date: formatDate(4),
    paymentMethod: 'PayPal',
    tags: ['client', 'freelance'],
    notes: 'Landing page design milestone payment'
  },
  {
    id: 'tx-3',
    title: 'Stock Dividend Payout',
    amount: 140,
    type: 'income',
    categoryId: 'cat-investments',
    date: formatDate(8),
    paymentMethod: 'Bank Transfer',
    tags: ['passive', 'investments'],
    notes: 'Q3 index fund dividend'
  },

  // Expenses
  {
    id: 'tx-4',
    title: 'Apartment Rent',
    amount: 1150,
    type: 'expense',
    categoryId: 'cat-housing',
    date: formatDate(1),
    paymentMethod: 'Bank Transfer',
    tags: ['essential', 'home'],
    notes: 'Monthly apartment rent'
  },
  {
    id: 'tx-5',
    title: 'Whole Foods Grocery Run',
    amount: 142.50,
    type: 'expense',
    categoryId: 'cat-food',
    date: formatDate(2),
    paymentMethod: 'Credit Card',
    tags: ['groceries', 'food'],
    notes: 'Weekly fresh vegetables, fruits, and pantry restock'
  },
  {
    id: 'tx-6',
    title: 'Dinner at Italian Bistro',
    amount: 78.20,
    type: 'expense',
    categoryId: 'cat-dining',
    date: formatDate(3),
    paymentMethod: 'Credit Card',
    tags: ['dining', 'weekend'],
    notes: 'Dinner with friends'
  },
  {
    id: 'tx-7',
    title: 'Electric & High-speed Internet',
    amount: 135.00,
    type: 'expense',
    categoryId: 'cat-utilities',
    date: formatDate(4),
    paymentMethod: 'Debit Card',
    tags: ['bills', 'home'],
    notes: 'Fiber internet + electricity utility bill'
  },
  {
    id: 'tx-8',
    title: 'Gas Station Refill',
    amount: 54.00,
    type: 'expense',
    categoryId: 'cat-transport',
    date: formatDate(5),
    paymentMethod: 'Credit Card',
    tags: ['commute', 'car'],
    notes: 'Full tank of premium fuel'
  },
  {
    id: 'tx-9',
    title: 'Netflix & Spotify Subscriptions',
    amount: 28.98,
    type: 'expense',
    categoryId: 'cat-subscriptions',
    date: formatDate(6),
    paymentMethod: 'Credit Card',
    tags: ['streaming', 'recurring'],
    notes: 'Monthly streaming bundle'
  },
  {
    id: 'tx-10',
    title: 'New Running Shoes',
    amount: 129.99,
    type: 'expense',
    categoryId: 'cat-shopping',
    date: formatDate(7),
    paymentMethod: 'Credit Card',
    tags: ['fitness', 'shopping'],
    notes: 'Nike marathon shoes on discount'
  },
  {
    id: 'tx-11',
    title: 'Movie Tickets & Snacks',
    amount: 36.50,
    type: 'expense',
    categoryId: 'cat-entertainment',
    date: formatDate(9),
    paymentMethod: 'Debit Card',
    tags: ['movies', 'weekend'],
    notes: 'IMAX screening'
  },
  {
    id: 'tx-12',
    title: 'Local Supermarket Essentials',
    amount: 88.40,
    type: 'expense',
    categoryId: 'cat-food',
    date: formatDate(10),
    paymentMethod: 'Cash',
    tags: ['groceries'],
    notes: 'Mid-week restock'
  },
  {
    id: 'tx-13',
    title: 'Dental Checkup & Cleaning',
    amount: 95.00,
    type: 'expense',
    categoryId: 'cat-health',
    date: formatDate(12),
    paymentMethod: 'Credit Card',
    tags: ['health', 'medical'],
    notes: 'Routine dental visit co-pay'
  },
  {
    id: 'tx-14',
    title: 'Online Coding Course',
    amount: 49.99,
    type: 'expense',
    categoryId: 'cat-education',
    date: formatDate(14),
    paymentMethod: 'PayPal',
    tags: ['learning', 'career'],
    notes: 'Advanced full-stack masterclass'
  },
  {
    id: 'tx-15',
    title: 'Artisan Coffee Roasters',
    amount: 18.50,
    type: 'expense',
    categoryId: 'cat-dining',
    date: formatDate(15),
    paymentMethod: 'Mobile Payment',
    tags: ['coffee'],
    notes: 'Cold brew and beans bag'
  },
  {
    id: 'tx-16',
    title: 'Subway & Metro Commuter Pass',
    amount: 72.00,
    type: 'expense',
    categoryId: 'cat-transport',
    date: formatDate(18),
    paymentMethod: 'Debit Card',
    tags: ['transport', 'commute'],
    notes: 'Monthly public transit recharge'
  },
  {
    id: 'tx-17',
    title: 'Supermarket Weekend Groceries',
    amount: 165.20,
    type: 'expense',
    categoryId: 'cat-food',
    date: formatDate(21),
    paymentMethod: 'Credit Card',
    tags: ['groceries'],
    notes: 'Family bulk grocery trip'
  },
  {
    id: 'tx-18',
    title: 'Weekend Brunch with Friends',
    amount: 64.00,
    type: 'expense',
    categoryId: 'cat-dining',
    date: formatDate(23),
    paymentMethod: 'Credit Card',
    tags: ['dining', 'weekend'],
    notes: 'Avocado toast, coffee and pastry'
  }
]

export const SAMPLE_RECURRING = [
  {
    id: 'rec-1',
    title: 'Apartment Rent',
    amount: 1150,
    type: 'expense',
    categoryId: 'cat-housing',
    frequency: 'Monthly',
    paymentMethod: 'Bank Transfer',
    nextDueDate: formatDate(-5), // 5 days from now
    autoLog: true,
    notes: 'Due on 1st of each month'
  },
  {
    id: 'rec-2',
    title: 'High-speed Fiber Internet',
    amount: 75,
    type: 'expense',
    categoryId: 'cat-utilities',
    frequency: 'Monthly',
    paymentMethod: 'Debit Card',
    nextDueDate: formatDate(-12),
    autoLog: false,
    notes: 'Gigabit fiber connection'
  },
  {
    id: 'rec-3',
    title: 'Netflix Premium Plan',
    amount: 19.99,
    type: 'expense',
    categoryId: 'cat-subscriptions',
    frequency: 'Monthly',
    paymentMethod: 'Credit Card',
    nextDueDate: formatDate(-15),
    autoLog: true,
    notes: '4K family account'
  },
  {
    id: 'rec-4',
    title: 'Gym Membership',
    amount: 45,
    type: 'expense',
    categoryId: 'cat-health',
    frequency: 'Monthly',
    paymentMethod: 'Credit Card',
    nextDueDate: formatDate(-8),
    autoLog: true,
    notes: '24/7 fitness club'
  },
  {
    id: 'rec-5',
    title: 'Tech Salary Direct Deposit',
    amount: 4500,
    type: 'income',
    categoryId: 'cat-salary',
    frequency: 'Monthly',
    paymentMethod: 'Bank Transfer',
    nextDueDate: formatDate(-20),
    autoLog: true,
    notes: 'Monthly corporate payroll'
  }
]

export const SAMPLE_ACCOUNTS = [
  {
    id: 'acc-1',
    name: 'Current Bank Account (Checking)',
    type: 'Checking',
    institution: 'Chase Bank',
    balance: 4850.50,
    color: '#3b82f6',
    accountNumber: '****4821',
    isDefault: true
  },
  {
    id: 'acc-2',
    name: 'High-Yield Savings',
    type: 'Savings',
    institution: 'Marcus by Goldman',
    balance: 14200.00,
    color: '#10b981',
    accountNumber: '****9302',
    isDefault: false
  },
  {
    id: 'acc-3',
    name: 'Physical Cash Wallet',
    type: 'Cash',
    institution: 'Cash in Hand',
    balance: 320.00,
    color: '#f59e0b',
    accountNumber: '',
    isDefault: false
  },
  {
    id: 'acc-4',
    name: 'BDO Gold Visa Card',
    type: 'Credit Card',
    institution: 'BDO Unibank',
    creditLimit: 60000.00,
    balance: 14250.00,
    availableCredit: 30000.00,
    accountNumber: '****3891',
    color: '#8b5cf6',
    isDefault: false
  }
]

export const SAMPLE_DEBTS = [
  {
    id: 'debt-1',
    name: 'Auto / Car Loan',
    lender: 'Toyota Financial',
    initialAmount: 18000,
    currentBalance: 7450.00,
    interestRate: 4.25,
    minimumPayment: 340.00,
    dueDate: '15th',
    category: 'Auto Loan',
    notes: '48-month fixed auto loan financing'
  },
  {
    id: 'debt-2',
    name: 'Student Education Loan',
    lender: 'Federal Student Aid',
    initialAmount: 22000,
    currentBalance: 11200.00,
    interestRate: 3.75,
    minimumPayment: 215.00,
    dueDate: '22nd',
    category: 'Education',
    notes: 'Standard income-based repayment'
  },
  {
    id: 'debt-3',
    name: 'BPI Platinum Rewards Card',
    lender: 'BPI Bank',
    initialAmount: 75000,
    currentBalance: 16800.00,
    availableCredit: 42000.00,
    interestRate: 24.0,
    minimumPayment: 850.00,
    dueDate: '28th',
    category: 'Credit Card',
    notes: 'Pay balance in full before statement cutoff'
  }
]


