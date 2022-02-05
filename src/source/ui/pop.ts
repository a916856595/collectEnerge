import { coordinateType, ICanvas, IPopup } from '../declare/declare';
import { getMergedOptions } from '../util/methods';
import { LIFE_FINISH } from '../constant/life';
import Stuff from './stuff';

interface IPopOptions {
  coordinate: coordinateType;
  buffer?: number;
  radius?: number;
  during?: number;    // span of animation, unit second
  distance?: number;
}
interface IPopOptionsResult {
  coordinate: coordinateType;
  buffer: number;
  radius: number;
  during: number;
  distance: number;
}

const popDefaultOptions = {
  buffer: 0,
  radius: 10,
  during: 2,
  distance: 20
};

class Pop extends Stuff implements IPopup {
  private canvas: ICanvas | null = null;
  private birth: number;
  private popOptions: IPopOptionsResult | null;

  constructor(popOptions: IPopOptions) {
    super({ coordinate: popOptions.coordinate });
    this.birth = Date.now();
    this.popOptions = getMergedOptions(popDefaultOptions, popOptions) as IPopOptionsResult;
  }

  private getCirclesCoordinate(interval: number): coordinateType[] {
    const result: coordinateType[] = [];
    if (this.popOptions) {
      const { coordinate, during, distance, buffer } = this.popOptions;
      const percentage = interval / during * 1000;
      const realDistance = distance * percentage;
      const coordinateX = coordinate[0];
      const coordinateY = coordinate[1];
      result[0] = [
        coordinateX,
        coordinateY - buffer - realDistance
      ];
      result[1] = [
        coordinateX + buffer + realDistance,
        coordinateY
      ];
      result[0] = [
        coordinateX,
        coordinateY + buffer + realDistance
      ];
      result[0] = [
        coordinateX - buffer - realDistance,
        coordinateY
      ];
    }
    return result;
  }

  public display(): this {
    const interval = Date.now() - this.birth;
    if (this.popOptions && interval < this.popOptions.during * 1000) {
      const coordinates = this.getCirclesCoordinate(interval);
      coordinates.forEach((coordinate: coordinateType) => {
        if (this.canvas && this.popOptions) this.canvas.drawFillCircle(coordinate, this.popOptions.radius, 'red');
      });
    } else {
      this.destroy();
    }
    return this;
  }

  public destroy() {
    this.fire(LIFE_FINISH);
    this.canvas = null;
    this.birth = 0;
    this.popOptions = null;
    super.destroy();
  }
}

export default Pop;