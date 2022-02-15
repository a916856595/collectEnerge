import BaseEvent from '../base/event';
import {
  BackgroundType,
  CoordinatesType,
  ICanvas,
} from '../declare/declare';
import { getMergedOptions } from '../util/methods';

interface IBackgroundOptions {
  backgroundValue?: string;
  backgroundType?: BackgroundType;
  foregroundValue?: string;
  foregroundType?: BackgroundType;
  foregroundCoordinates?: CoordinatesType;
}

const IMAGE = 'image';
const COLOR = 'color';
const backgroundDefaultOptions = {
  backgroundValue: '#000',
  backgroundType: COLOR,
  foregroundValue: '#FFF',
  foregroundType: COLOR,
};

class Background extends BaseEvent {
  private canvas: ICanvas | null;

  private options: IBackgroundOptions | null;

  private foregroundCoordinates: CoordinatesType | null = null;

  constructor(canvas: ICanvas, backgroundOptions: IBackgroundOptions) {
    super();
    this.canvas = canvas;
    const { foregroundCoordinates, ...otherOptions } = backgroundOptions;
    this.options = getMergedOptions(backgroundDefaultOptions, otherOptions) as IBackgroundOptions;
    if (foregroundCoordinates) this.foregroundCoordinates = foregroundCoordinates;
  }

  private displayBackground(coordinates: CoordinatesType, backgroundType: BackgroundType, backgroundValue: string) {
    if (this.canvas) {
      const methodName = backgroundType === IMAGE ? 'drawImage' : 'drawFillRect';
      this.canvas[methodName](coordinates, backgroundValue);
    }
    return this;
  }

  public display(): this {
    if (
      this.canvas
      && this.options
      && this.options.backgroundType
      && this.options.backgroundValue
      && this.options.foregroundType
      && this.options.foregroundValue
      && this.foregroundCoordinates
    ) {
      const canvasSize = this.canvas.getSize();
      const backgroundCoordinates: CoordinatesType = [
        [0, 0],
        [canvasSize.width, canvasSize.height],
      ];
      this.displayBackground(backgroundCoordinates, this.options.backgroundType, this.options.backgroundValue);
      this.displayBackground(this.foregroundCoordinates, this.options.foregroundType, this.options.foregroundValue);
    }
    return this;
  }

  public update(coordinates: CoordinatesType): this {
    this.foregroundCoordinates = coordinates;
    return this;
  }

  public destroy() {
    this.canvas = null;
    this.options = null;
    this.foregroundCoordinates = null;
    super.destroy();
  }
}

export default Background;
