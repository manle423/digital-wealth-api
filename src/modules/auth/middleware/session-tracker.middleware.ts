import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SessionTrackerService } from '../services/session-tracker.service';

@Injectable()
export class SessionTrackerMiddleware implements NestMiddleware {
  constructor(private readonly sessionTrackerService: SessionTrackerService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Tận dụng service đã có để track session (không đồng bộ)
    this.sessionTrackerService.trackSessionAccessAsync(req);

    next();
  }
}
