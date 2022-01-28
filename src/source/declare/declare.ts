export type handlerType = (event: IObject) => void;

export interface IBaseEvent {
  on: (eventType: string, handler: handlerType) => this;
  once: (eventType: string, handler: handlerType) => this;
  off: (eventType: string, handler?: handlerType) => this;
  fire: (eventType: string, parameters?: IObject) => this;
  postponeFire: (eventType: string, parameters?: IObject, delay?: number) => this;
}


export interface ICollectEnergy extends IBaseEvent{

}


export interface IEventRecorder {
  [key: string]: Function[];
}

export interface ICanvas extends IBaseEvent {
  getSize: () => { width: number, height: number };
  destroy: () => void;
}

export interface IController extends IBaseEvent {
  start: () => this;
  pause: () => this;
  destroy: () => void;
}

export type controllerStateType = 'pausing' | 'running' | 'ended' | 'preparation' | 'waiting';

export interface IObject {
  [key: string]: any;
}

export interface IIMageLoader extends  IBaseEvent {
  load: (name: string, url: string) => this;
}