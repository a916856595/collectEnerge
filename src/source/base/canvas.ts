import './canvas.scss';
import { coordinatesType, ICanvas, IIMageLoader, IObject } from '../declare/declare';
import BaseEvent from './event';
import { LIFE_ERROR, LIFE_FINISH } from '../constant/life';
import { RESIZE } from '../constant/baseEvent';

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