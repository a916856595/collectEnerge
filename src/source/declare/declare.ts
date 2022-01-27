export interface ICollectEnergy {

}

export interface IBaseEvent {
  on: (eventType: string, handler: Function) => this;
  off: (eventType: string, handler?: Function) => this;
  fire: (eventType: string, parameters?: IObject) => this;
  postponeFire: (eventType: string, parameters?: IObject, delay?: number) => this;
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

export type objOrNullType = IObject | null;