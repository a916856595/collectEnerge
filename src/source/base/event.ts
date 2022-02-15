import {
  HandlerType,
  IBaseEvent,
  IEventRecorder,
  IObject,
} from '../declare/declare';

class BaseEvent implements IBaseEvent {
  private eventCollectionMap: IEventRecorder | null = {};

  private oneTimeEventCollectionMap: IEventRecorder | null = {};

  // record timers
  private timerMap: IObject | null = {};

  private bind(isOnce: boolean, eventType: string, handler: HandlerType) {
    const collectionMap = isOnce ? this.oneTimeEventCollectionMap : this.eventCollectionMap;
    if (!collectionMap) return this;
    if (!collectionMap[eventType]) {
      collectionMap[eventType] = [];
    }
    if (!collectionMap[eventType].includes(handler)) {
      collectionMap[eventType].push(handler);
    }
    return this;
  }

  private release(isOnce: boolean, eventType: string, handler?: HandlerType) {
    const collectionMap = isOnce ? this.oneTimeEventCollectionMap : this.eventCollectionMap;
    if (!collectionMap || !collectionMap[eventType]) return this;
    if (!handler) delete collectionMap[eventType];
    else {
      const index = collectionMap[eventType].indexOf(handler);
      if (index > -1) collectionMap[eventType].splice(index, 1);
    }
    return this;
  }

  private trigger(isOnce: boolean, eventType: string, parameters?: IObject) {
    const collectionMap = isOnce ? this.oneTimeEventCollectionMap : this.eventCollectionMap;
    if (collectionMap && collectionMap[eventType]) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      collectionMap[eventType].forEach((handler: Function) => {
        let event = new Event(eventType);
        if (parameters) {
          const { isTrusted, ...params } = parameters;
          event = Object.assign(event, params);
        }

        handler.call(this, event);
      });
      // If operation is once, clearing handler.
      if (isOnce) delete collectionMap[eventType];
    }
  }

  public on(eventType: string, handler: HandlerType) {
    return this.bind(false, eventType, handler);
  }

  public once(eventType: string, handler: HandlerType) {
    return this.bind(true, eventType, handler);
  }

  public off(eventType: string, handler?: HandlerType) {
    this.release(true, eventType, handler);
    this.release(false, eventType, handler);
    return this;
  }

  public fire(eventType: string, parameters?: IObject) {
    this.trigger(true, eventType, parameters);
    this.trigger(false, eventType, parameters);
    return this;
  }

  public postponeFire(eventType: string, parameters?: IObject, delay?: number) {
    if (this.timerMap) {
      const timer = setTimeout(() => {
        this.fire(eventType, parameters);
        clearTimeout(timer);
        if (this.timerMap) delete this.timerMap[String(timer)];
      }, delay || 0);
      this.timerMap[String(timer)] = timer;
    }
    return this;
  }

  public destroy() {
    // clear all timers
    if (this.timerMap) {
      Object.values(this.timerMap).forEach((timer: number) => {
        clearTimeout(timer);
        if (this.timerMap) delete this.timerMap[String(timer)];
      });
    }
    this.eventCollectionMap = null;
    this.oneTimeEventCollectionMap = null;
    this.timerMap = null;
  }
}

export default BaseEvent;
