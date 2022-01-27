import { IBaseEvent, IObject, objOrNullType } from '../declare/declare';

class BaseEvent implements IBaseEvent {
  private eventCollectionMap: IObject | null = {};
  // record timers
  private timerMap: IObject | null = {};

  public on(eventType: string, handler: Function) {
    return this;
  }

  public off(eventType: string, handler?: Function) {
    return this;
  }

  public fire(eventType: string, parameters?: IObject) {
    return this;
  }

  public postponeFire(eventType: string, parameters?: IObject, delay?: number) {
    if (this.timerMap) {
      const timer = setTimeout(() => {
        this.fire(eventType, parameters);
        clearTimeout(timer);
        if (this.timerMap) delete this.timerMap[timer + ''];
      }, delay || 0);
      this.timerMap[timer + ''] = timer;
    }
    return this;
  }

  public destroy() {
    // clear all timers
    if (this.timerMap) {
      Object.values(this.timerMap).forEach((timer: number) => {
        clearTimeout(timer);
        if (this.timerMap) delete this.timerMap[timer + ''];
      });
    }
    this.eventCollectionMap = null;
    this.timerMap = null;
  }
}

export default BaseEvent;