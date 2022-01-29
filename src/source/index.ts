import Canvas from './base/canvas';
import Controller from './controller/controller';
import { ICollectEnergy, ICanvas, IController, IObject, canvasAnchorType } from './declare/declare';
import BaseEvent from './base/event';
import { LIFE_ERROR, LIFE_FINISH } from './constant/life';

interface ICollectEnergyOptions  {
  container: string;     // The dom element selector.
  width?: string;        // Operation area width, option unit is pixel or percent, default auto.
  height?: string;       // Operation area height, option unit is pixel or percent, default auto.
  anchor?: canvasAnchorType;
}

class CollectEnergy extends BaseEvent implements ICollectEnergy {
  private canvas: ICanvas | null;
  private controller: IController | null;

  constructor(collectEnergyOptions: ICollectEnergyOptions) {
    super();
    const {
      container,
      width,
      height,
      anchor
    } = collectEnergyOptions;
    this.canvas = new Canvas(container);
    this.controller = new Controller(this.canvas, {
      width,
      height,
      anchor
    });
    this.controller.on(LIFE_FINISH, (event: IObject) => {
      this.postponeFire(LIFE_FINISH, event);
    });
    this.controller.on(LIFE_ERROR, (event: IObject) => {
      this.postponeFire(LIFE_ERROR, event);
    });
  }

  public start() {
    if (this.controller) this.controller.start();
    return this;
  }

  public pause() {
    if (this.controller) this.controller.pause();
    return this;
  }

  public destroy() {
    if (this.controller) {
      this.controller.destroy();
    }
    this.controller = null;
    if (this.canvas) {
      this.canvas.destroy();
    }
    this.canvas = null;
  }
}

export default CollectEnergy;