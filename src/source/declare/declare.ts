export interface ICollectEnergy {

}

export interface ICanvas {
  destroy: () => void;
}

export interface IController {
  destroy: () => void;
}

export type controllerStateType = 'pause' | 'processing' | 'end' | 'preparation' | 'waiting';

export interface IBaseEvent {
  on: (eventType: string, handler: Function) => this;
  off: (eventType: string, handler?: Function) => this;
  fire: (eventType: string) => this;
}