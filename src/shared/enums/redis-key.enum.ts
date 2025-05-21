export enum RedisKeyPrefix {
  QUESTION = 'question',
  QUESTION_CATEGORY = 'question_category',
  RISK_PROFILE = 'risk_profile',
  ASSET_CLASS = 'asset_class',
  ASSET_ALLOCATION = 'asset_allocation',
  USER = 'user',
  ASSESSMENT = 'assessment'
}

export enum RedisKeyTtl {
  ONE_MINUTE = 60,
  FIVE_MINUTES = 300,
  TEN_MINUTES = 600,
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
