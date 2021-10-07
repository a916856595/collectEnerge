import Canvas from './base/canvas';
import Controller from './controller/controller';
import { ICollectEnergy } from './declare/declare';

interface ICollectEnergyOptions  {
  container: string;
}

class CollectEnergy implements ICollectEnergy {
  private canvas: any;

  constructor(collectEnergyOptions: ICollectEnergyOptions) {
    const { container } = collectEnergyOptions;
    this.canvas = new Canvas(container);
  }

}

export default CollectEnergy;