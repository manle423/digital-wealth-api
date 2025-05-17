export enum RedisKeyPrefix {
  QUESTION = 'questions',
  USER = 'users',
  ASSESSMENT = 'assessments'
}

export enum RedisKeyTtl {
  FIVE_MINUTES = 300,
  TEN_MINUTES = 600,
  THIRTY_MINUTES = 1800,
  ONE_HOUR = 3600,
  TWO_HOURS = 7200,
  THREE_HOURS = 10800,
  FOUR_HOURS = 14400,
  FIVE_HOURS = 18000,
  SIX_HOURS = 21600
}
