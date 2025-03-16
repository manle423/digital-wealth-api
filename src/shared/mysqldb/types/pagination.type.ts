export class PgPagination {
  public page: number
  public limit: number
  public offset: number = 0
  public totalItems: number = 0

  constructor(page: number = 1, limit: number = 10) {
    this.page = page
    this.limit = limit
    this.offset = page > 0 ? (page - 1) * limit : 0
  }
}
