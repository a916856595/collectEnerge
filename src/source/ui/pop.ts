import { coordinateType, ICanvas, IPop } from '../declare/declare';
import { getMergedOptions } from '../util/methods';
import { LIFE_FINISH } from '../constant/life';
import Stuff from './stuff';
import { angleToPI } from '../util/mathUtil';

interface IPopOptions {
  coordinate: coordinateType;
  buffer?: number;
  radius?: number;
  during?: number;    // span of animation, unit second
  distance?: number;
  background?: string;
  count?: number;
  startAngle?: number;
}
interface IPopOptionsResult {
  coordinate: coordinateType;
  buffer: number;
  radius: number;
  during: number;
  distance: number;
  background: string;
  count: number;
  startAngle: number;
}
type mathMethodType = 'min' | 'max';

const popDefaultOptions = {
  buffer: 0,
  radius: 30,
  during: 2,
  distance: 60,
  background: 'green',
  count: 3,
  startAngle: 0
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
      const { coordinate, during, distance, buffer, count, startAngle } = this.popOptions;
      const percentage = interval / (during * 1000);
      const realDistance = distance * percentage + buffer;
      const coordinateX = coordinate[0];
      const coordinateY = coordinate[1];
      // @ts-ignore
      Array.apply(undefined, { length: count }).forEach((value: undefined, index: number) => {
        const angle = 360 / count * index + startAngle;
        const validAngel = angle % 360;
        const minAngel = angle % 90;
        const a = Math.sin(angleToPI(minAngel)) * realDistance;
        const b = Math.cos(angleToPI(minAngel)) * realDistance;
        let directionX = 1;
        let directionY = 1;
        let xMethod: mathMethodType = 'min';
        let yMethod: mathMethodType = 'max';
        if (validAngel > 180) directionX = -1;
        if (validAngel < 90 || validAngel > 270) directionY = -1;
        if ((validAngel > 45 && validAngel < 135) || (validAngel > 225 && validAngel < 315)) {
          xMethod = 'max';
          yMethod = 'min';
        }
        const xValue = Math[xMethod](a, b) * directionX;
        const yValue = Math[yMethod](a, b) * directionY;
        result.push([
          coordinateX + xValue,
          coordinateY + yValue
        ]);
      });
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