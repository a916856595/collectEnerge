import BaseEvent from '../base/event';
import {
  canvasAnchorType,
  controllerStateType,
  coordinatesType, coordinateType,
  IBaseEvent,
  ICanvas,
  IController,
  IIMageLoader,
  IObject
} from '../declare/declare';
import { LIFE_ERROR, LIFE_FINISH, LIFT_MOVE } from '../constant/life';
import ImageLoader from '../component/imageLoader';
import globeConfig from '../../../config/uiConfig';
import { getMergedOptions } from '../util/methods';
import { RESIZE } from '../constant/baseEvent';
import Background from '../ui/background';
import Globe from '../ui/globe';
import { GLOBE_RADIUS, VERTICAL_ACCELERATION } from '../../../config/config';
import { generateId } from '../util/util';

interface IControllerOptions {
  width?: string;
  height?: string;
  anchor?: canvasAnchorType; // operation area anchor, optional center / left / right / top / bottom.
  rate?: number;
}

const CENTER = 'center';
const controllerDefaultOptions = {
  width: 'auto',
  height: 'auto',
  anchor: CENTER
};

class Controller extends BaseEvent implements IController {
  public imageLoader: IIMageLoader | null;
  private canvas: ICanvas | null;                 // 封装后的canvas
  private state: controllerStateType = 'waiting'; // 游戏状态
  private options: IControllerOptions | null;
  private operationalAreaCoordinates: coordinatesType | null = null;
  private operationalWidth: number = 0;
  private operationalHeight: number = 0;
  private frameSign: number = 0;
  private timeStamp: number = 0;
  private uiComponents: IObject | null = {};

  constructor(canvas: ICanvas, controllerOptions: IControllerOptions = {}) {
    super();
    this.canvas = canvas;
    this.options = getMergedOptions(controllerDefaultOptions, controllerOptions);
    this.imageLoader = new ImageLoader();
    // load image source
    Object.entries(globeConfig.imageConfig).forEach((nameAndUrl: [string, string]) => {
      const [name, url] = nameAndUrl;
      if (this.imageLoader) this.imageLoader.load(name, url);
    });
    const promiseList = [ this.getPromise(this.imageLoader), this.getPromise(this.canvas)];
    // Fire life cycle.
    Promise.all(promiseList)
      .then((event: IObject) => {
        // Calculate operation area.
        this.setOperationAreaInfo();
        if (this.canvas) {
          if (this.imageLoader) this.canvas.setImageLoader(this.imageLoader);
          // Calculate operation area when canvas resized.
          this.canvas.on(RESIZE, this.setOperationAreaInfo.bind(this));
        }
        this.fire(LIFE_FINISH, event);
      })
      .catch((error: IObject) => {
        this.fire(LIFE_ERROR, error);
      });
  }

  private getPromise(object: IBaseEvent) {
    return new Promise((resolve, reject) => {
      if (object) {
        object.on(LIFE_FINISH, (event: IObject) => {
          resolve(event);
        });
        object.on(LIFE_ERROR, (event: IObject) => {
          reject(event);
        });
      }
    });
  }

  private getContentLength(total: number, goal: string = 'auto'): number {
    let result;
    const charLength = goal.length;
    if (goal.endsWith('%')) {
      let percentage = Number(goal.substr(0, charLength - 1));
      percentage = percentage > 100 ? 100 : percentage;
      percentage = Number.isNaN(percentage) ? 100 : percentage;
      result = total * percentage / 100;
    } else if (goal.endsWith('px')) {
      result = Number(goal.substr(0, charLength - 2));
      result = Number.isNaN(result) ? total : result;
      if (result > total) result = total;
    } else {
      result = total;
    }
    return Math.round(result);
  }

  private setOperationAreaInfo() {
    if (this.canvas && this.options) {
      let { width, height, anchor, rate } = this.options;
      const canvasSize = this.canvas.getSize();
      const canvasWidth = canvasSize.width;
      const canvasHeight = canvasSize.height;
      const canvasRate = canvasWidth / canvasHeight;
      const hundredPercentage = '100%';
      // Transform rate to real width and height.
      if (rate) {
        const pixel = 'px';
        if (rate > 1 && rate >= canvasRate) {
          width = hundredPercentage;
          height = 1 / rate * canvasWidth + pixel;
        } else if (rate > 1 && rate < canvasRate) {
          height = canvasHeight + pixel;
          width = canvasHeight * rate + pixel;
        } else if (rate < 1 && rate <= canvasRate) {
          width = rate * canvasHeight + pixel;
          height = hundredPercentage;
        } else if (rate < 1 && rate > canvasRate) {
          width = canvasWidth + pixel;
          height = canvasWidth / rate + pixel;
        } else if (rate === 1) {
          width = height = Math.min(canvasWidth, canvasHeight) + pixel;
        }
      }
      const operationalWidth = this.operationalWidth = this.getContentLength(canvasSize.width, width);
      const operationalHeight = this.operationalHeight = this.getContentLength(canvasSize.height, height);
      const widthDiff = canvasWidth - operationalWidth;
      const heightDiff = canvasHeight - operationalHeight;
      const halfWidthDiff = widthDiff / 2;
      const halfHeightDiff = heightDiff / 2;
      let topLeftCoordinate: coordinateType;
      let bottomRightCoordinate: coordinateType;
      switch(anchor) {
        case 'left':
          topLeftCoordinate = [0, halfHeightDiff];
          break;
        case 'right':
          topLeftCoordinate = [widthDiff, halfHeightDiff];
          break;
        case 'top':
          topLeftCoordinate = [halfWidthDiff, 0];
          break;
        case 'bottom':
          topLeftCoordinate = [halfWidthDiff, heightDiff];
          break;
        default:
          topLeftCoordinate = [halfWidthDiff, halfHeightDiff];
      }
      bottomRightCoordinate = [
        topLeftCoordinate[0] + operationalWidth,
        topLeftCoordinate[1] + operationalHeight
      ]
      this.operationalAreaCoordinates = [topLeftCoordinate, bottomRightCoordinate];
    }
  }

  private displayBackground() {
    if (this.canvas && this.uiComponents) {
      let background = this.uiComponents.background;
      if (!background) {
        background = this.uiComponents.background = new Background(this.canvas, {
          backgroundType: 'color',
          backgroundValue: 'black',
          foregroundType: 'image',
          foregroundValue: 'background',
          foregroundCoordinates: this.operationalAreaCoordinates as coordinatesType
        });
      } else background.update(this.operationalAreaCoordinates);
      background.display();
    }
  }

  private frame(): number {
    return requestAnimationFrame(() => {
      const timeStamp = Date.now();
      const span = (timeStamp - this.timeStamp) / 1000;
      if (this.canvas && this.operationalAreaCoordinates && this.uiComponents) {
        this.canvas.clear();
        this.displayBackground();
        if (!this.uiComponents.globe) {
          this.uiComponents.globe = new Globe(this.canvas, {
            coordinate: [80, 80],
            radius: GLOBE_RADIUS,
            xSpeed: 0,
            ySpeed: 200,
            xMaxSpeed: 30,
            yMaxSpeed: 600,
            xAcceleration: 0,
            yAcceleration: VERTICAL_ACCELERATION
          });
          this.uiComponents.globe.on(LIFT_MOVE, (event: IObject) => {
            const { newCoordinate } = event;
            if (
              this.uiComponents &&
              this.operationalAreaCoordinates &&
              this.operationalAreaCoordinates[1] &&
              (newCoordinate[1] - GLOBE_RADIUS) > (this.operationalAreaCoordinates[1][1] as number)
            ) {
              this.uiComponents.globe.destroy();
              this.uiComponents.globe = null;
            }
          })
          this.uiComponents.globe.display();
        } else {
          this.uiComponents.globe.update(span);
          // After updated, component may be removed by move event.
          this.uiComponents.globe && this.uiComponents.globe.display();
        }

      }
      if (this.state === 'running') this.frame();
      this.timeStamp = timeStamp;
    });
  }

  private beginFrame() {
    if (this.frameSign) {
      cancelAnimationFrame(this.frameSign);
    }
    this.frameSign = this.frame();
  }

  public start(): this {
    this.state = 'running'
    this.beginFrame();
    return this;
  }

  public pause(): this {
    this.state = 'pausing';
    return this;
  }

  public destroy() {
    if (this.canvas) {
      this.canvas.destroy();
      this.canvas = null;
    }
    if (this.imageLoader) {
      this.imageLoader.destroy();
      this.imageLoader = null;
    }
    if (this.uiComponents) {
      Object.values(this.uiComponents).forEach((uiComponent) => {
        uiComponent.destroy();
      });
      this.uiComponents = null;
    }
    this.operationalAreaCoordinates = null;
    this.options = null;
    super.destroy();
  }
}

export default Controller;