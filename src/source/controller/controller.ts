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
import Globe from '../ui/globe';

interface IControllerOptions {
  width?: string;
  height?: string;
  anchor?: canvasAnchorType; // operation area anchor, optional center / left / right / top / bottom.
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
      const canvasSize = this.canvas.getSize();
      const { width, height, anchor } = this.options;
      const canvasWidth = canvasSize.width;
      const canvasHeight = canvasSize.height;
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

  private frame(): number {
    return requestAnimationFrame(() => {
      if (this.canvas && this.operationalAreaCoordinates && this.uiComponents) {
        this.canvas.clear();
        let background = this.uiComponents.background;
        if (!background) {
          background = this.uiComponents.background = new Background(this.canvas, {
            backgroundType: 'color',
            backgroundValue: 'black',
            foregroundType: 'image',
            foregroundValue: 'background',
            foregroundCoordinates: this.operationalAreaCoordinates
          });
        } else background.update(this.operationalAreaCoordinates);
        background.display();

        const globe = new Globe(this.canvas, {
          coordinate: [80, 80],
          radius: 30
        });
        globe.display();
      }
      if (this.state === 'running') this.frame();
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