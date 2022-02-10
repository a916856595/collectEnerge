export type handlerType = (event: IObject) => void;
export type coordinateType = [number, number];
export type coordinatesType = coordinateType[];
export type canvasAnchorType = 'center' | 'left' | 'right' | 'top' | 'bottom';
export type backgroundType = 'color' | 'image';
export type directionType = 'close' | 'open';

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

export interface IStrokeRectOptions {
  strokeColor?: string;
  strokeWidth?: number;
}

export interface IFillTextOptions {
  font?: string;
  fontSize?: number;
  fontColor?: string;
}

export interface ITextMeasureOptions {
  font?: string;
  fontSize?: number;
}

export interface ITextMeasureResult {
  width: number;
}

export interface ICanvas extends IBaseEvent {
  getSize: () => { width: number, height: number };
  setImageLoader: (imageLoader: IIMageLoader) => this;
  destroy: () => void;
  clear: () => this;
  drawFillRect: (coordinates: coordinatesType, fillColor: string) => this;
  measureText: (text: string, textMeasureOptions?: ITextMeasureOptions) => ITextMeasureResult;
  drawFillText: (coordinate: coordinateType, text: string, fillTextOptions?: IFillTextOptions) => this;
  drawStrokeRect: (coordinates: coordinatesType, strokeRectOptions?: IStrokeRectOptions) => this;
  drawImage: (coordinates: coordinatesType, imageName: string) => this;
  drawFillCircle: (coordinate: coordinateType, radius: number, fillColor: string) => this;
}

export interface IController extends IBaseEvent {
  frame: (span: number, isUpdateGlobes: boolean) => this;
  reset: () => this;
  destroy: () => void;
}

export type stateType = 'pausing' | 'running' | 'ended' | 'preparing' | 'waiting' | 'changing' | 'selecting';

export interface IObject {
  [key: string]: any;
}

export interface IIMageLoader extends IBaseEvent {
  load: (name: string, url: string) => this;
  getImageSource: (imageName: string) => HTMLImageElement | null;
  destroy: () => void;
}

export interface IModifiableStuffConfig {
  xAcceleration?: number;
  yAcceleration?: number;
}

export interface IStuffConfig extends IModifiableStuffConfig {
  xSpeed?: number;
  ySpeed?: number;
  xMaxSpeed?: number;
  yMaxSpeed?: number;
}

export interface IStuffOptions extends IStuffConfig {
  coordinate: coordinateType;
}

export interface IStuff extends IBaseEvent {
  coordinate: coordinateType | null;
  update: (span: number, config: IModifiableStuffConfig) => this;
  destroy: () => void;
}

export interface IGlobeOptions extends IStuffOptions {
  id: string;
  radius: number;
  color?: string;
}

export interface IGlobe extends IStuff {
  display: () => this;
  update: (span: number) => this;
  destroy: () => void;
  judgeHasBeenTouch: (coordinate: coordinateType, buffer?: number) => boolean;
}

export interface IPop extends IStuff {
  display: () => this;
  destroy: () => void;
}

export interface IStuffInstance extends IBaseEvent {
  id: string;
  judgeHasBeenTouch: (coordinate: coordinateType, buffer?: number) => boolean;
}

export interface IMenuOptions {
  text: string;
  onChoose: () => void;
}

export interface IInterface extends IBaseEvent {
  startEvolution: (startTime: number, span: number, direction?: directionType) => this;
  setMenu: (menu: IMenuOptions[]) => this;
  frame: (span: number) => this;
  destroy: () => void;
}