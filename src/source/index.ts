import Canvas from './base/canvas';
import Controller from './controller/controller';
import { ICollectEnergy, ICanvas, IController } from './declare/declare';

interface ICollectEnergyOptions  {
  container: string;
}

class CollectEnergy implements ICollectEnergy {
  private canvas: ICanvas | null;
  private controller: IController | null;

  constructor(collectEnergyOptions: ICollectEnergyOptions) {
    const { container } = collectEnergyOptions;
    this.canvas = new Canvas(container);
    this.controller = new Controller(this.canvas);
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