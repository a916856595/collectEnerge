import BaseEvent from '../base/event';
import { coordinateType, IModifiableThingConfig, IThing, IThingConfig, IThingOptions } from '../declare/declare';
import { getMergedOptions } from '../util/methods';
import { LIFT_MOVE } from '../constant/life';


const thingDefaultConfig = {
  xSpeed: 0,
  ySpeed: 0,
  xMaxSpeed: 0,
  yMaxSpeed: 0,
  xAcceleration: 0,
  yAcceleration: 0,
};

class Thing extends BaseEvent implements IThing {
  public coordinate: coordinateType | null;
  private options: IThingConfig | null = null;


  constructor(thingOptions: IThingOptions) {
    super();
    const { coordinate, ...otherOptions } = thingOptions;
    this.coordinate = coordinate;
    this.options = getMergedOptions(thingDefaultConfig, otherOptions);
  }

  private getSpeedDiff(direction: 'x' | 'y', span: number): number {
    let diff = 0;
    const speedField = direction === 'x' ? 'xSpeed' : 'ySpeed';
    const maxSpeedField = direction === 'x' ? 'xMaxSpeed' : 'yMaxSpeed';
    const accelerationField = direction === 'x' ? 'xAcceleration' : 'yAcceleration';
    if (this.options) {
      diff = span * (this.options[accelerationField] as number);
      // Speed can not more than max speed;
      if ((this.options[speedField] as number + diff) > (this.options[maxSpeedField] as number)) {
        diff = (this.options[maxSpeedField] as number) - (this.options[speedField] as number);
      }
    }
    return diff;
  }

  private updateProperties(span: number) {
    // to second
    const xSpeedDiff = this.getSpeedDiff('x', span);
    const ySpeedDiff = this.getSpeedDiff('y', span);
    if (this.options && this.coordinate && span) {
      const xDistance = (this.options.xSpeed as number + xSpeedDiff / 2) * span;
      const yDistance = (this.options.ySpeed as number + ySpeedDiff / 2) * span;
      const originCoordinate = this.coordinate.slice();
      this.coordinate = [
        this.coordinate[0] + xDistance,
        this.coordinate[1] + yDistance
      ]
      const newCoordinate = this.coordinate.slice();
      this.options.xSpeed = this.options.xSpeed as number + xSpeedDiff;
      this.options.ySpeed = this.options.ySpeed as number + ySpeedDiff;
      if (xDistance !== 0 || yDistance !== 0) {
        this.fire(LIFT_MOVE, {
          originCoordinate,
          newCoordinate
        });
      }
    }
    return this;
  }

  public update(span: number, modifiableThingConfig?: IModifiableThingConfig) {
    if (this.options) {
      if (modifiableThingConfig) this.options = getMergedOptions(this.options, modifiableThingConfig);
      this.updateProperties(span);
    }
    return this;
  }

  public destroy() {
    this.options = null;
    this.coordinate = null;
    super.destroy();
  }
}

export default Thing;