import './canvas.scss';
import {
  coordinatesType,
  coordinateType,
  handlerType,
  ICanvas,
  IFillTextOptions,
  IIMageLoader,
  IObject,
  IStrokeRectOptions,
  ITextMeasureOptions,
  ITextMeasureResult
} from '../declare/declare';
import BaseEvent from './event';
import { LIFE_ERROR, LIFE_FINISH } from '../constant/life';
import { CLICK, RESIZE } from '../constant/baseEvent';
import { getMergedOptions } from '../util/methods';

interface IStrokeRectOptionsResult {
  strokeColor: string;
  strokeWidth: number;
}
interface IFillTextOptionsResult {
  font: string;
  fontSize: number;
  fontColor: string;
}
interface ITextMeasureOptionsResult {
  font: string;
  fontSize: number;
}

const strokeRectDefaultOptions: IStrokeRectOptionsResult = {
  strokeColor: '#000',
  strokeWidth: 1
};
const textMeasureDefaultOptions: ITextMeasureOptionsResult = {
  font: 'Arial',
  fontSize: 12
}
const fillTextDefaultOptions: IFillTextOptionsResult = {
  font: 'Arial',
  fontSize: 12,
  fontColor: '#000'
}
const PX = 'px';
const TOP = 'top';

class Canvas extends BaseEvent implements ICanvas {
  private container: HTMLElement | null;
  private element: HTMLCanvasElement | null;
  private context: CanvasRenderingContext2D | null = null;
  private imageLoader: IIMageLoader | null = null;
  private width: number = 0;
  private height: number = 0;

  constructor(elementSelector: string) {
    super();
    this.container = document.querySelector(elementSelector);
    this.element = document.createElement('canvas');
    this.element.classList.add('collect-energy-canvas');
    if (this.container) {
      this.container.appendChild(this.element);
      window.addEventListener(RESIZE, this.setSizeInfo);
      this.context = this.element.getContext('2d') as CanvasRenderingContext2D;
      this.postponeFire(LIFE_FINISH);
    } else {
      this.postponeFire(
        LIFE_ERROR,
        { message: `Can not find container element that selector is '${elementSelector}'.` }
      );
    }
  }

  private setSizeInfo = (event?: IObject, notEmit: boolean = false) => {
    if (this.element) {
      const elementInfo = this.element.getBoundingClientRect();
      this.width = elementInfo.width;
      this.height = elementInfo.height;
      // Update canvas element attributes to assure that coordinate size is the same as the style sheet.
      this.element.width = this.width;
      this.element.height = this.height;
      if (!notEmit) {
        this.fire(RESIZE, {
          width: this.width,
          height: this.height
        })
      }
    }
  }

  public setImageLoader(imageLoader: IIMageLoader): this {
    this.imageLoader = imageLoader;
    return this;
  }

  public getSize(): { width: number, height: number } {
    // Refreshing size info when info is empty.
    if (!this.width || !this.height) this.setSizeInfo({}, true);
    return {
      width: this.width,
      height: this.height
    };
  }

  public clear() {
    if (this.context) {
      this.context.clearRect(
        0,
        0,
        this.width,
        this.height
      );
    }
    return this;
  }

  public drawFillRect(coordinates: coordinatesType, fillColor: string): this {
    if (this.context) {
      const [topLeftCoordinate, bottomRightCoordinate] = coordinates;
      this.context.beginPath();
      this.context.moveTo(topLeftCoordinate[0], topLeftCoordinate[1]);
      this.context.fillStyle = fillColor;
      this.context.fillRect(
        topLeftCoordinate[0],
        topLeftCoordinate[1],
        bottomRightCoordinate[0] - topLeftCoordinate[0],
        bottomRightCoordinate[1] - topLeftCoordinate[1],
      );
    }
    return this;
  }

  public drawStrokeRect(coordinates: coordinatesType, strokeRectOptions: IStrokeRectOptions = strokeRectDefaultOptions): this {
    if (this.context) {
      const options = getMergedOptions(strokeRectDefaultOptions, strokeRectOptions) as IStrokeRectOptionsResult;
      const { strokeWidth, strokeColor } = options;
      const [topLeftCoordinate, bottomRightCoordinate] = coordinates;
      const offset = strokeWidth / 2;
      this.context.beginPath();
      this.context.moveTo(topLeftCoordinate[0], topLeftCoordinate[1]);
      this.context.strokeStyle = strokeColor;
      this.context.lineWidth = strokeWidth;
      this.context.strokeRect(
        topLeftCoordinate[0] + offset,
        topLeftCoordinate[1] + offset,
        bottomRightCoordinate[0] - topLeftCoordinate[0] - strokeWidth,
        bottomRightCoordinate[1] - topLeftCoordinate[1] - strokeWidth
      );
    }
    return this;
  }

  public drawImage(coordinates: coordinatesType, imageName: string): this {
    if (this.context && this.imageLoader) {
      const [topLeftCoordinate, bottomRightCoordinate] = coordinates;
      this.context.beginPath();
      this.context.moveTo(topLeftCoordinate[0], topLeftCoordinate[1]);
      this.context.drawImage(
        this.imageLoader.getImageSource(imageName) as HTMLImageElement,
        topLeftCoordinate[0],
        topLeftCoordinate[1],
        bottomRightCoordinate[0] - topLeftCoordinate[0],
        bottomRightCoordinate[1] - topLeftCoordinate[1],
      );
    }
    return this;
  }

  public drawFillCircle(coordinate: coordinateType, radius: number, fillColor: string): this {
    if (this.context) {
      this.context.beginPath();
      this.context.moveTo(coordinate[0], coordinate[1]);
      this.context.arc(coordinate[0], coordinate[1], radius, 0, 2 * Math.PI);
      this.context.fillStyle = fillColor;
      this.context.fill();
    }
    return this;
  }

  public measureText(text: string, textMeasureOptions: ITextMeasureOptions = textMeasureDefaultOptions): ITextMeasureResult {
    if (this.context) {
      const options = getMergedOptions(textMeasureDefaultOptions, textMeasureOptions) as ITextMeasureOptionsResult
      this.context.font = `${options.fontSize}${PX} ${options.font}`;
      return this.context.measureText(text);
    }
    return { width: 0 };
  }

  public drawFillText(coordinate: coordinateType, text: string, fillTextOptions: IFillTextOptions = fillTextDefaultOptions): this {
    if (this.context) {
      const options = getMergedOptions(fillTextDefaultOptions, fillTextOptions) as IFillTextOptionsResult;
      const { font, fontSize, fontColor } = options;
      this.context.beginPath();
      this.context.moveTo(coordinate[0], coordinate[1]);
      this.context.fillStyle = fontColor;
      this.context.textBaseline = TOP;
      this.context.font = `${fontSize}${PX} ${font}`;
      this.context.fillText(text, coordinate[0], coordinate[1]);
    }
    return this;
  }

  public on(eventType: string, handler: handlerType) {
    if (eventType === CLICK && this.element) {
      this.element.addEventListener(eventType, handler);
    } else {
      super.on(eventType, handler);
    }
    return this;
  }

  public off(eventType: string, handler?: handlerType) {
    if (eventType === CLICK && handler && this.element) {
      this.element.removeEventListener(eventType, handler);
    } else {
      super.off(eventType, handler);
    }
    return this;
  }

  public destroy() {
    this.context = null;
    if (this.container && this.element) {
      this.container.removeChild(this.element);
      window.removeEventListener(RESIZE, this.setSizeInfo);
    }
    this.width = 0;
    this.height = 0;
    this.element = null;
    this.container = null;
    this.imageLoader = null;
    super.destroy();
  }
}

export default Canvas;