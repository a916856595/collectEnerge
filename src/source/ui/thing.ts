import BaseEvent from '../base/event';
import { ICanvas } from '../declare/declare';
import { getMergedOptions } from '../util/methods';


interface IModifiableThingConfig {
  xAcceleration?: number;
  yAcceleration?: number;
}
interface IThingConfig extends IModifiableThingConfig {
  xSpeed?: number;
  ySpeed?: number;
}
interface IThingOptions extends IThingConfig {
  timeStamp: number;
}

const thingDefaultConfig = {
  xSpeed: 0,
  ySpeed: 0,
  xAcceleration: 0,
  yAcceleration: 0
};

class Thing extends BaseEvent {
  private timeStamp: number = 0;
  private options: IThingConfig | null = {};


  constructor(canvas: ICanvas, thingOptions: IThingOptions) {
    super();
    const { timeStamp } = thingOptions;
    this.timeStamp = timeStamp;
    this.options = getMergedOptions(thingDefaultConfig, thingOptions);
  }

  private updateSpeed(direction: 'x' | 'y', timeStamp: number) {
    const speedField = direction === 'x' ? 'xSpeed' : 'ySpeed';
    const accelerationField = direction === 'x' ? 'xAcceleration' : 'yAcceleration';
    if (this.options && this.options[speedField]) {
      this.options[speedField] =
        this.options[speedField] as number + (timeStamp - this.timeStamp) * (this.options[accelerationField] as number);
    }
  }

  public update(timeStamp: number, modifiableThingConfig: IModifiableThingConfig) {
    if (this.options) {
      this.options = getMergedOptions(this.options, modifiableThingConfig);
      this.updateSpeed('x', timeStamp);
      this.updateSpeed('y', timeStamp);
      // this.updateCoordinate(timeStamp);
      this.timeStamp = timeStamp;
    }
    return this;
  }

  public destroy() {
    this.timeStamp = 0;
    this.options = null;
    super.destroy();
  }
}

export default Thing;