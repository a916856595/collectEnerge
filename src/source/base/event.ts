import { IBaseEvent } from '../declare/declare';

class BaseEvent implements IBaseEvent {
  static eventCollectionMap = {};

  public on(eventType: string, handler: Function) {
    return this;
  }

  public off(eventType: string, handler?: Function) {
    return this;
  }

  public fire(eventType: string) {
    return this;
  }
}

export default BaseEvent;