import Canvas from './base/canvas';
import Controller from './controller/controller';

class CollectEnergy {
  private canvas: any;

  constructor(collectEnergyOptions: any) {
    const { container } = collectEnergyOptions;
    this.canvas = new Canvas(container);
  }

}

export default CollectEnergy;