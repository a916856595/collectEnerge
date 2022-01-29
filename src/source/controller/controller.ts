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
import { LIFE_ERROR, LIFE_FINISH } from '../constant/life';
import ImageLoader from '../component/imageLoader';
import globeConfig from '../../../config/uiConfig';
import { getMergedOptions } from '../util/methods';
import { RESIZE } from '../constant/baseEvent';
import Background from '../ui/background';

interface IControllerOptions {
  width?: string;
  height?: string;
  anchor?: canvasAnchorType;
}

const CENTER = 'center';
const LEFT = 'left';
const RIGHT = 'right';
const canvasAnchors = [CENTER, LEFT, RIGHT];
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
      const canvasSize = this.canvas.getSize();
      const { width, height, anchor } = this.options;
      this.operationalWidth = this.getContentLength(canvasSize.width, width);
      this.operationalHeight = this.getContentLength(canvasSize.height, height);
      let topLeftCoordinate: coordinateType;
      let bottomRightCoordinate: coordinateType;
      switch(anchor) {
        case 'left':
          topLeftCoordinate = [0, 0];
          bottomRightCoordinate = [
            this.operationalWidth,
            this.operationalHeight
          ];
          break;
        case 'right':
          topLeftCoordinate = [
            canvasSize.width - this.operationalWidth,
            0
          ];
          bottomRightCoordinate = [
            canvasSize.width,
            this.operationalHeight
          ];
          break;
        default:
          topLeftCoordinate = [
            (canvasSize.width - this.operationalWidth) / 2,
            (canvasSize.height - this.operationalHeight) / 2
          ];
          bottomRightCoordinate = [
            (canvasSize.width - this.operationalWidth) / 2 + this.operationalWidth,
            (canvasSize.height - this.operationalHeight) / 2 + this.operationalHeight,
          ];
      }
      this.operationalAreaCoordinates = [topLeftCoordinate, bottomRightCoordinate];
    }
  }

  private frame(): number {
    return requestAnimationFrame(() => {
      if (this.canvas && this.operationalAreaCoordinates) {
        this.canvas.clear();
        const background = new Background(this.canvas, {
          backgroundType: 'color',
          backgroundValue: 'pink',
          foregroundType: 'color',
          foregroundValue: 'green',
          foregroundCoordinates: this.operationalAreaCoordinates
        });
        background.display();
      }
    });
  }

  private beginFrame() {
    if (this.frameSign) {
      cancelAnimationFrame(this.frameSign);
    }
    this.frameSign = this.frame();
    this.timeStamp = Date.now();
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
    this.operationalAreaCoordinates = null;
    this.options = null;
    super.destroy();
  }
}

export default Controller;