import BaseEvent from '../base/event';
import { coordinateType, ICanvas, IGlobe } from '../declare/declare';
import { getMergedOptions } from '../util/methods';

interface IGlobeOptions {
  coordinate: coordinateType;
  radius: number;
  color?: string;
}

const globeDefaultOptions = {
  color: 'green'
};

class Globe extends BaseEvent implements IGlobe {
  private canvas: ICanvas | null = null;
  private birthTime: number = 0;
  private options: IGlobeOptions | null = null;

  constructor(canvas: ICanvas, globeOptions: IGlobeOptions) {
    super();
    this.canvas = canvas;
    this.birthTime = Date.now();
    this.options = getMergedOptions(globeDefaultOptions, globeOptions) as IGlobeOptions;
  }

  public display() {
    if (
      this.canvas &&
      this.options &&
      this.options.coordinate &&
      this.options.radius
    ) {
      this.canvas.drawFillCircle(this.options.coordinate, this.options.radius, this.options.color as string);
    }
    return this;
  }

  public update(timeStamp: number) {
    return this;
  }

  public destroy() {
    this.birthTime = 0;
    this.options = null;
    this.canvas = null;
    super.destroy();
  }
}

export default Globe;