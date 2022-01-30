import { ICanvas, IGlobe, IGlobeOptions, IModifiableThingConfig } from '../declare/declare';
import { getMergedOptions } from '../util/methods';
import Thing from './thing';

const globeDefaultOptions = {
  color: 'green'
};

class Globe extends Thing implements IGlobe {
  private canvas: ICanvas | null = null;
  private globeOptions: IGlobeOptions | null = null;

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

  constructor(canvas: ICanvas, globeOptions: IGlobeOptions) {
    super(globeOptions);
    this.canvas = canvas;
    this.globeOptions = getMergedOptions(globeDefaultOptions, globeOptions) as IGlobeOptions;
  }

  public update(span: number, modifiableThingConfig?: IModifiableThingConfig) {
    super.update(span, modifiableThingConfig);
    return this;
  }

  public destroy() {
    this.globeOptions = null;
    this.canvas = null;
    super.destroy();
  }
}

export default Globe;