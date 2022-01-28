import Canvas from './base/canvas';
import Controller from './controller/controller';
import { ICollectEnergy, ICanvas, IController, IObject } from './declare/declare';
import BaseEvent from './base/event';
import { LIFE_ERROR, LIFE_FINISH } from './constant/life';

interface ICollectEnergyOptions  {
  container: string;
}

class CollectEnergy extends BaseEvent implements ICollectEnergy {
  private canvas: ICanvas | null;
  private controller: IController | null;

  constructor(collectEnergyOptions: ICollectEnergyOptions) {
    super();
    const { container } = collectEnergyOptions;
    this.canvas = new Canvas(container);
    this.controller = new Controller(this.canvas);
    this.controller.on(LIFE_FINISH, (event: IObject) => {
      this.postponeFire(LIFE_FINISH, event);
    });
    this.controller.on(LIFE_ERROR, (event: IObject) => {
      this.postponeFire(LIFE_ERROR, event);
    });
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