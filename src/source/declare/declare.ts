export type HandlerType = (event: IObject) => void;
export type CoordinateType = [number, number];
export type CoordinatesType = CoordinateType[];
export type CanvasAnchorType = 'center' | 'left' | 'right' | 'top' | 'bottom';
export type BackgroundType = 'color' | 'image';
export type DirectionType = 'close' | 'open';

export interface IBaseEvent {
  on: (eventType: string, handler: HandlerType) => this;
  once: (eventType: string, handler: HandlerType) => this;
  off: (eventType: string, handler?: HandlerType) => this;
  fire: (eventType: string, parameters?: IObject) => this;
  postponeFire: (eventType: string, parameters?: IObject, delay?: number) => this;
}

export interface ICollectEnergy extends IBaseEvent {
  start: () => this;
  pause: () => this;
  destroy: () => void;
}

export interface IEventRecorder {
  // eslint-disable-next-line @typescript-eslint/ban-types
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
  drawFillRect: (coordinates: CoordinatesType, fillColor: string) => this;
  measureText: (text: string, textMeasureOptions?: ITextMeasureOptions) => ITextMeasureResult;
  drawFillText: (coordinate: CoordinateType, text: string, fillTextOptions?: IFillTextOptions) => this;
  drawStrokeRect: (coordinates: CoordinatesType, strokeRectOptions?: IStrokeRectOptions) => this;
  drawImage: (coordinates: CoordinatesType, imageName: string) => this;
  drawFillCircle: (coordinate: CoordinateType, radius: number, fillColor: string) => this;
}

export interface IController extends IBaseEvent {
  frame: (span: number, isUpdateGlobes: boolean) => this;
  reset: () => this;
  destroy: () => void;
}

export type StateType = 'pausing' | 'running' | 'ended' | 'preparing' | 'waiting' | 'changing' | 'selecting';

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
  coordinate: CoordinateType;
}

export interface IStuff extends IBaseEvent {
  coordinate: CoordinateType | null;
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
  judgeHasBeenTouch: (coordinate: CoordinateType, buffer?: number) => boolean;
}

export interface IPop extends IStuff {
  display: () => this;
  destroy: () => void;
}

export interface IStuffInstance extends IBaseEvent {
  id: string;
  judgeHasBeenTouch: (coordinate: CoordinateType, buffer?: number) => boolean;
}

export interface IMenuOptions {
  text: string;
  onChoose?: () => void;
  coordinates?: CoordinatesType;
}

export interface IInterface extends IBaseEvent {
  startEvolution: (startTime: number, during: number, direction?: DirectionType) => this;
  setMenu: (menu: IMenuOptions[]) => this;
  frame: (span: number) => this;
  destroy: () => void;
}
