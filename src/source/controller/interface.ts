import BaseEvent from '../base/event';
import { coordinatesType, ICanvas, IInterface, IObject } from '../declare/declare';
import { getMergedOptions } from '../util/methods';
import { LIFE_FINISH } from '../constant/life';

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
  private menu: IObject | null = null;

  constructor(canvas: ICanvas, interfaceOptions: IInterfaceOptions) {
    super();
    this.canvas = canvas;
    this.options = getMergedOptions(interfaceDefaultOptions, interfaceOptions) as IInterfaceOptionsResult;
  }

  public startEvolution(startTime: number, during: number): this {
    this.startTime = startTime;
    this.during = during;
    return this;
  }

  public setMenu(menu: IObject): this {
    this.menu = menu;
    return this;
  }

  public frame(): this {
    const currentTime = Date.now();
    if (this.canvas && this.options) {
      const { horizontalCount } = this.options;
      const { width, height } = this.canvas.getSize();
      const targetTime = this.startTime + this.during * 1000;
      if (currentTime > this.startTime && currentTime < targetTime) {
        const singleWith = Math.round(width / horizontalCount);
        const verticalCount = Math.ceil(height / singleWith);
        const total = horizontalCount * verticalCount;
        const strokeWidth = (1 - (targetTime - currentTime) / (this.during * 1000)) * singleWith;
        // @ts-ignore
        Array.apply(undefined, { length: total }).forEach((item: undefined, index: number) => {
          const realIndex = index + 1;
          const xOrder = index % horizontalCount;
          const yOrder = Math.floor(realIndex / verticalCount);
          if (this.canvas) {
            const coordinates: coordinatesType = [
              [xOrder * singleWith, yOrder * singleWith],
              [(xOrder + 1) * singleWith, (yOrder + 1) * singleWith]
            ];
            this.canvas.drawStrokeRect(coordinates, { strokeWidth });
          }
        });
      }
      if (this.frameTime < targetTime && currentTime > targetTime) {
        this.fire(LIFE_FINISH, { startTime: this.startTime });
      }
    }
    this.frameTime = currentTime;
    return this;
  }

  public destroy() {
    this.canvas = null;
    this.options = null;
    this.menu = null;
    super.destroy();
  }
}

export default Interface;