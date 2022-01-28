export interface ICollectEnergy {

}

export type handlerType = (event: IObject) => void;

export interface IBaseEvent {
  on: (eventType: string, handler: handlerType) => this;
  once: (eventType: string, handler: handlerType) => this;
  off: (eventType: string, handler?: handlerType) => this;
  fire: (eventType: string, parameters?: IObject) => this;
  postponeFire: (eventType: string, parameters?: IObject, delay?: number) => this;
}

export interface IEventRecorder {
  [key: string]: Function[];
}

export interface ICanvas extends IBaseEvent{
  destroy: () => void;
}

export interface IController {
  destroy: () => void;
}

export type controllerStateType = 'pause' | 'processing' | 'end' | 'preparation' | 'waiting';

export interface IObject {
  [key: string]: any;
}