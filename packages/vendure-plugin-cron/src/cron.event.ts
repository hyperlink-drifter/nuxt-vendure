import { VendureEvent, RequestContext } from '@vendure/core';

export class CronEvent extends VendureEvent {
  constructor(public ctx: RequestContext, public readonly taskId: string) {
    super();
  }
}
