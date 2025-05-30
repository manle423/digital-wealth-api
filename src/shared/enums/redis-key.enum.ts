export enum RedisKeyPrefix {
  // Question & Assessment
  QUESTION = 'question',
  QUESTION_CATEGORY = 'question:category',
  RISK_PROFILE = 'risk:profile',
  ASSET_CLASS = 'asset:class',
  ASSET_ALLOCATION = 'asset:allocation',
  ASSESSMENT = 'assessment',
  
  // User Management
  USER = 'user',
  USER_PROFILE = 'user:profile',
  USER_DETAIL = 'user:detail',
  USER_EMAIL = 'user:email',
  USER_ID = 'user:id',
  OTP_RETRY = 'otp:retry',
  SESSION = 'session',
  
  // Asset Management
  USER_ASSETS = 'user:assets',
  USER_ASSETS_LIST = 'user:assets:list',
  USER_ASSETS_SUMMARY = 'user:assets:summary',
  USER_TOTAL_ASSETS = 'user:assets:total',
  ASSET_CATEGORIES = 'asset:categories',
  ASSET_BREAKDOWN = 'user:assets:breakdown',
  
  // Debt Management
  USER_DEBTS = 'user:debts',
  USER_DEBTS_LIST = 'user:debts:list',
  USER_DEBTS_SUMMARY = 'user:debts:summary',
  USER_TOTAL_DEBTS = 'user:debts:total',
  TOTAL_DEBT_VALUE = 'user:debts:total:value',
  DEBT_BREAKDOWN = 'user:debts:breakdown',
  DEBT_CATEGORIES = 'debt:categories',
  DEBT_OVERDUE = 'user:debts:overdue',
  DEBT_UPCOMING = 'user:debts:upcoming',
  
  // Net Worth & Financial Analysis
  NET_WORTH = 'user:networth',
  NET_WORTH_HISTORY = 'user:networth:history',
  FINANCIAL_METRICS = 'user:financial:metrics',
  FINANCIAL_SUMMARY = 'user:financial:summary',
  FINANCIAL_SUMMARY_BY_AI = 'user:financial:summary:ai',
  
  // Recommendations
  RECOMMENDATIONS = 'user:recommendations',
}

export enum RedisKeyTtl {
  ONE_MINUTE = 60,
  FIVE_MINUTES = 300,
  TEN_MINUTES = 600,
  FIFTEEN_MINUTES = 900,
  THIRTY_MINUTES = 1800,
  ONE_HOUR = 3600,
  TWO_HOURS = 7200,
  THREE_HOURS = 10800,
  FOUR_HOURS = 14400,
  FIVE_HOURS = 18000,
  SIX_HOURS = 21600,
  TWELVE_HOURS = 43200,
  ONE_DAY = 86400,
  THREE_DAYS = 259200,
  SEVEN_DAYS = 604800,
  FIFTEEN_DAYS = 1296000,
  THIRTY_DAYS = 2592000
}
