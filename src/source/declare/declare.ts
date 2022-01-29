export type handlerType = (event: IObject) => void;
export type coordinateType = [number, number];
export type coordinatesType = coordinateType[];
export type canvasAnchorType = 'center' | 'left' | 'right';
export type backgroundType = 'color' | 'image';

export interface IBaseEvent {
  on: (eventType: string, handler: handlerType) => this;
  once: (eventType: string, handler: handlerType) => this;
  off: (eventType: string, handler?: handlerType) => this;
  fire: (eventType: string, parameters?: IObject) => this;
  postponeFire: (eventType: string, parameters?: IObject, delay?: number) => this;
}


export interface ICollectEnergy extends IBaseEvent {
  start: () => this;
  pause: () => this;
  destroy: () => void;
}


export interface IEventRecorder {
  [key: string]: Function[];
}

export interface ICanvas extends IBaseEvent {
  getSize: () => { width: number, height: number };
  setImageLoader: (imageLoader: IIMageLoader) => this;
  destroy: () => void;
  clear: () => this;
  drawFillRect: (coordinates: coordinatesType, fillColor: string) => this;
  drawImage: (coordinates: coordinatesType, imageName: string) => this;
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

export interface IIMageLoader extends IBaseEvent {
  load: (name: string, url: string) => this;
  getImageSource: (imageName: string) => HTMLImageElement | null;
  destroy: () => void;
}