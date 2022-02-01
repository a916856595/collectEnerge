import { coordinateType, ICanvas, IGlobe, IGlobeOptions, IModifiableStuffConfig } from '../declare/declare';
import { getMergedOptions } from '../util/methods';
import Stuff from './stuff';
import { GLOBE_RADIUS } from '../../../config/config';

const globeDefaultOptions = {
  color: 'green'
};

class Globe extends Stuff implements IGlobe {
  private canvas: ICanvas | null = null;
  private globeOptions: IGlobeOptions | null = null;
  public id: string;

  constructor(canvas: ICanvas, globeOptions: IGlobeOptions) {
    super(globeOptions);
    this.canvas = canvas;
    this.id = globeOptions.id;
    this.globeOptions = getMergedOptions(globeDefaultOptions, globeOptions) as IGlobeOptions;
  }

  public display() {
    if (
      this.canvas &&
      this.globeOptions &&
      this.globeOptions.radius &&
      this.coordinate
    ) {
      this.canvas.drawFillCircle(this.coordinate, this.globeOptions.radius, this.globeOptions.color as string);
    }
    return this;
  }

  public update(span: number, modifiableStuffConfig?: IModifiableStuffConfig) {
    super.update(span, modifiableStuffConfig);
    return this;
  }

  public judgeHasBeenTouch(coordinate: coordinateType, buffer: number = 0): boolean {
    let touched = false;
    if (this.coordinate) {
      const distance = Math.sqrt(
        Math.pow(coordinate[0] - this.coordinate[0], 2) +
        Math.pow(coordinate[1] - this.coordinate[1], 2)
      );
      if (distance < GLOBE_RADIUS + buffer) touched = true;
    }
    return touched;
  }

  public destroy() {
    this.id = '';
    this.globeOptions = null;
    this.canvas = null;
    super.destroy();
  }
}

export default Globe;