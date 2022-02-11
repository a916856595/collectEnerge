import BaseEvent from '../base/event';
import {
  coordinatesType, coordinateType,
  directionType,
  handlerType,
  ICanvas,
  IInterface,
  IMenuOptions,
  IObject,
  stateType
} from '../declare/declare';
import { getMergedOptions } from '../util/methods';
import { LIFE_CHANGE, LIFE_FINISH } from '../constant/life';
import UIConfig from '../../../config/uiConfig';
import { CLICK } from '../constant/baseEvent';
import { isCoordinateInRect } from '../util/mathUtil';
import { CLOSE, SELECTING, WAITING } from '../constant/other';

interface IInterfaceOptions {
  horizontalCount?: number;
}

interface IInterfaceOptionsResult {
  horizontalCount: number;
}

const interfaceDefaultOptions = {
  horizontalCount: 6,
};

class Interface extends BaseEvent implements IInterface {
  private canvas: ICanvas | null;
  private options: IInterfaceOptionsResult | null;
  private startTime: number = 0;
  private frameTime: number = 0;
  private during: number = 0;
  private menu: IMenuOptions[] | null = null;
  private direction: directionType = CLOSE;
  private lastCanvasEvent: handlerType | null = null;
  private state: stateType = WAITING;

  constructor(canvas: ICanvas, interfaceOptions: IInterfaceOptions = interfaceDefaultOptions) {
    super();
    this.on(LIFE_CHANGE, (event: IObject) => {
      const { state } = event;
      this.state = state;
    });
    this.canvas = canvas;
    this.options = getMergedOptions(interfaceDefaultOptions, interfaceOptions) as IInterfaceOptionsResult;
  }

  private frameAnimation(currentTime: number) {
    if (this.canvas && this.options) {
      const { horizontalCount } = this.options;
      const { width, height } = this.canvas.getSize();
      const targetTime = this.startTime + this.during * 1000;
      if (currentTime > this.startTime && currentTime < targetTime) {
        const singleWith = Math.ceil(width / horizontalCount);
        const verticalCount = Math.ceil(height / singleWith);
        const total = horizontalCount * verticalCount;
        const diffPercentage = (targetTime - currentTime) / (this.during * 1000);
        const strokeWidth = (this.direction === CLOSE ? (1 - diffPercentage) : diffPercentage) * singleWith / 2;
        // @ts-ignore
        Array.apply(undefined, { length: total }).forEach((item: undefined, index: number) => {
          const realIndex = index + 1;
          const xOrder = index % horizontalCount;
          const yOrder = Math.ceil(realIndex / horizontalCount) - 1;
          if (this.canvas) {
            const coordinates: coordinatesType = [
              [xOrder * singleWith, yOrder * singleWith],
              [(xOrder + 1) * singleWith, (yOrder + 1) * singleWith]
            ];
            this.canvas.drawStrokeRect(coordinates, { strokeWidth, strokeColor: UIConfig.menuBackgroundColor });
          }
        });
      }
    }
  }

  private frameMenu() {
    if (this.canvas) {
      const { width, height } = this.canvas.getSize();
      const coordinates: coordinatesType = [
        [0, 0],
        [width, height]
      ];
      this.canvas.drawFillRect(coordinates, UIConfig.menuBackgroundColor);
      if (this.menu) {
        const total = this.menu.length;
        this.menu.forEach((menu: IMenuOptions, index: number) => {
          if (this.canvas) {
            const textWidth = this.canvas.measureText(menu.text, { fontSize: UIConfig.menuFontSize }).width;
            const x = width / 2 - textWidth / 2;
            const y = height / (total + 1) * (index + 1) - UIConfig.menuFontSize / 2;
            const topLeftCoordinate: coordinateType = [x, y];
            menu.coordinates = [
              [x, y],
              [x + textWidth, y + UIConfig.menuFontSize]
            ];
            this.canvas.drawFillText(
              topLeftCoordinate,
              menu.text,
              { fontColor: UIConfig.menuFontColor, fontSize: UIConfig.menuFontSize }
            );
          }
        });
      }
    }
  }

  public startEvolution(startTime: number, during: number, direction: directionType = CLOSE): this {
    this.startTime = startTime;
    this.during = during;
    this.direction = direction;
    if (this.during <= 0) {
      this.fire(LIFE_FINISH, { startTime: this.startTime, direction });
    }
    return this;
  }

  public setMenu(menu: IMenuOptions[]): this {
    this.menu = menu;
    if (this.canvas) {
      if (this.lastCanvasEvent) {
        this.canvas.off(CLICK, this.lastCanvasEvent);
      }
      this.lastCanvasEvent = (event: IObject) => {
        const { x, y } = event;
        if (this.menu) {
          this.menu.forEach((menu: IMenuOptions) => {
            const { coordinates, onChoose } = menu;
            const isClickAtRect = !!coordinates && isCoordinateInRect([x, y], coordinates);
            if (isClickAtRect && this.state === SELECTING) onChoose();
          });
        }
      };
      this.canvas.on(CLICK, this.lastCanvasEvent);
    }
    return this;
  }

  public frame(): this {
    const currentTime = Date.now();
    const targetTime = this.startTime + this.during * 1000;
    if (this.frameTime < targetTime && currentTime >= targetTime) {
      this.fire(LIFE_FINISH, { startTime: this.startTime, direction: this.direction });
    }
    if (currentTime < targetTime) this.frameAnimation(currentTime);
    if (currentTime >= targetTime) this.frameMenu();
    this.frameTime = currentTime;
    return this;
  }

  public destroy() {
    if (this.lastCanvasEvent && this.canvas) {
      this.canvas.off(CLICK, this.lastCanvasEvent);
    }
    this.lastCanvasEvent = null;
    this.canvas = null;
    this.options = null;
    this.menu = null;
    super.destroy();
  }
}

export default Interface;