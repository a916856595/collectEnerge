import { coordinateType, ICanvas, IPop } from '../declare/declare';
import { getMergedOptions } from '../util/methods';
import { LIFE_FINISH } from '../constant/life';
import Stuff from './stuff';

interface IPopOptions {
  coordinate: coordinateType;
  buffer?: number;
  radius?: number;
  during?: number;    // span of animation, unit second
  distance?: number;
  background?: string;
}
interface IPopOptionsResult {
  coordinate: coordinateType;
  buffer: number;
  radius: number;
  during: number;
  distance: number;
  background: string;
}

const popDefaultOptions = {
  buffer: 0,
  radius: 30,
  during: 2,
  distance: 60,
  background: 'green'
};

class Pop extends Stuff implements IPop {
  private canvas: ICanvas | null = null;
  private birth: number;
  private popOptions: IPopOptionsResult | null;

  constructor(canvas: ICanvas, popOptions: IPopOptions) {
    super({ coordinate: popOptions.coordinate });
    this.canvas = canvas;
    this.birth = Date.now();
    this.popOptions = getMergedOptions(popDefaultOptions, popOptions) as IPopOptionsResult;
  }

  private getCirclesCoordinate(interval: number): coordinateType[] {
    const result: coordinateType[] = [];
    if (this.popOptions) {
      const { coordinate, during, distance, buffer } = this.popOptions;
      const percentage = interval / (during * 1000);
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
      result[2] = [
        coordinateX,
        coordinateY + buffer + realDistance
      ];
      result[3] = [
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
        if (this.canvas && this.popOptions) {
          const percentage = interval / (this.popOptions.during * 1000);
          this.canvas.drawFillCircle(coordinate, this.popOptions.radius * (1 - percentage), this.popOptions.background);
        }
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