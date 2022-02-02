import BaseEvent from '../base/event';
import {
  canvasAnchorType,
  controllerStateType,
  coordinatesType,
  coordinateType,
  handlerType,
  IBaseEvent,
  ICanvas,
  IController,
  IGlobe,
  IIMageLoader,
  IObject,
  IStuffInstance
} from '../declare/declare';
import { LIFE_ERROR, LIFE_FINISH, LIFT_MOVE } from '../constant/life';
import ImageLoader from '../component/imageLoader';
import globeConfig from '../../../config/uiConfig';
import { getMergedOptions } from '../util/methods';
import { CLICK, RESIZE } from '../constant/baseEvent';
import Background from '../ui/background';
import Globe from '../ui/globe';
import { GLOBE_RADIUS, VERTICAL_ACCELERATION } from '../../../config/config';
import { generateId } from '../util/util';
import UIConfig from '../../../config/uiConfig';

interface IControllerOptions {
  width?: string;
  height?: string;
  anchor?: canvasAnchorType; // operation area anchor, optional center / left / right / top / bottom.
  rate?: number;
}
interface IGlobeInfo {
  id: string;
  zIndex: number;
  globe: IGlobe | undefined,
  state: 'destroyed' | 'exist' | 'prepare',
}
interface IStuffInfo {
  stuff: IStuffInstance;
  zIndex: number;
}

const EXIST = 'exist';
const PREPARE = 'prepare';
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
  private uiComponents: IObject | null = { background: undefined, globes: {} };
  private canvasEventInfoMap: IObject | null = { [CLICK]: {} };
  private eventReferenceMap: IObject | null = {};

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
          if (this.eventReferenceMap) {
            // Calculate operation area when canvas resized.
            this.eventReferenceMap[RESIZE] = this.setOperationAreaInfo.bind(this);
            this.eventReferenceMap[CLICK] = (event: IObject) => {
              this.triggerCanvasEvent(CLICK, event);
            };
            this.canvas.on(RESIZE, this.eventReferenceMap[RESIZE]);
            this.canvas.on(CLICK, this.eventReferenceMap[CLICK]);
          }
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

  private changeStuffEventMapState(eventType: string, stuffInfo: IStuffInfo, isRemove: boolean = false) {
    if (this.canvasEventInfoMap) {
      if (!this.canvasEventInfoMap) (this.canvasEventInfoMap[eventType] as IObject) = {};
      if (isRemove) delete this.canvasEventInfoMap[eventType][stuffInfo.stuff.id];
      else {
        this.canvasEventInfoMap[eventType][stuffInfo.stuff.id] = {
          stuff: stuffInfo.stuff,
          zIndex: Number(stuffInfo.stuff.id)
        };
      }
    }
  }

  private triggerCanvasEvent(eventType: string, event: IObject) {
    const coordinate: coordinateType = [event.x, event.y];
    if (this.canvasEventInfoMap && this.canvasEventInfoMap[eventType]) {
      let target: { stuff: IStuffInstance | null, zIndex: number } = { stuff: null, zIndex: -1 };
      // @ts-ignore
      Object.values(this.canvasEventInfoMap[eventType]).some((stuffInfo: IStuffInfo) => {
        const { stuff, zIndex } = stuffInfo;
        if (stuff.judgeHasBeenTouch(coordinate, UIConfig.touchBuffer) && zIndex > target.zIndex) {
          target = { stuff, zIndex };
          return true;
        }
      });
      if (target && target.stuff) {
        target.stuff.fire(eventType, { coordinate });
      }
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

  private generateGlobeCoordinate(): coordinateType {
    let coordinate: coordinateType = [0, 0];
    if (this.operationalAreaCoordinates && this.operationalAreaCoordinates[0] && this.operationalAreaCoordinates[1]) {
      const range = this.operationalAreaCoordinates[1][0] - GLOBE_RADIUS - this.operationalAreaCoordinates[0][0];
      coordinate = [
        this.operationalAreaCoordinates[0][0] + GLOBE_RADIUS + Math.round(Math.random() * range),
        this.operationalAreaCoordinates[0][1] - GLOBE_RADIUS
      ];
    }
    return coordinate;
  }

  private updateGlobesInfo() {
    if (this.uiComponents && this.uiComponents.globes) {
      const globesCollection: IGlobeInfo[] = Object.values(this.uiComponents.globes);
      const isNeedGlobe = globesCollection.every((globeInfo: IGlobeInfo) => {
        if (globeInfo.globe && globeInfo.globe.coordinate && this.operationalAreaCoordinates && this.operationalAreaCoordinates[0]) {
          return globeInfo.globe.coordinate[1] - GLOBE_RADIUS > this.operationalAreaCoordinates[0][1];
        }
      });
      if (isNeedGlobe) {
        const id = generateId();
        this.uiComponents.globes[id] = {
          id,
          state: PREPARE,
          zIndex: Number(id),
        };
      }
    }
  }

  private displayGlobes(span: number): this {
    if (this.uiComponents && this.uiComponents.globes) {
      // @ts-ignore
      Object.values(this.uiComponents.globes).forEach((globeInfo: IGlobeInfo) => {
        if (globeInfo.state === PREPARE && this.canvas) {
          const globe = new Globe(this.canvas, {
            id: globeInfo.id,
            coordinate: this.generateGlobeCoordinate(),
            radius: GLOBE_RADIUS,
            xSpeed: 0,
            ySpeed: 50,
            xMaxSpeed: 0,
            yMaxSpeed: 100,
            xAcceleration: 0,
            yAcceleration: VERTICAL_ACCELERATION
          });
          globe.on(LIFT_MOVE, (event: IObject) => {
            const { newCoordinate } = event;
            if (
              this.uiComponents &&
              this.operationalAreaCoordinates &&
              this.operationalAreaCoordinates[1] &&
              (newCoordinate[1] - GLOBE_RADIUS) > (this.operationalAreaCoordinates[1][1] as number)
            ) {
              globe.destroy();
              delete this.uiComponents.globes[globeInfo.id];
            }
          });
          globe.on(CLICK, () => {
            globe.destroy();
            if (this.uiComponents) {
              delete this.uiComponents.globes[globeInfo.id];
            }
          });
          this.changeStuffEventMapState(CLICK, { stuff: globe, zIndex: Number(globe.id) });
          globe.display();
          globeInfo.globe = globe;
          globeInfo.state = EXIST;
        } else if (globeInfo.state === EXIST && globeInfo.globe) {
          const globe = globeInfo.globe;
          globe.update(span);
          // After updated, component may be removed by move event.
          globe && globe.display();
        }
      });
    }
    return this;
  }

  private frame(): number {
    return requestAnimationFrame(() => {
      const timeStamp = Date.now();
      const span = (timeStamp - this.timeStamp) / 1000;
      if (this.canvas && this.operationalAreaCoordinates && this.uiComponents) {
        this.canvas.clear();
        this.displayBackground();
        this.updateGlobesInfo();
        this.displayGlobes(span);

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
    if (this.frameSign) {
      cancelAnimationFrame(this.frameSign);
    }
    if (this.canvas) {
      // clear events
      if (this.eventReferenceMap) {
        Object.entries(this.eventReferenceMap).forEach((eventTypeAndHandler: [string, handlerType]) => {
          const [eventType, handler] = eventTypeAndHandler;
          this.canvas && this.canvas.off(eventType, handler);
        });
        this.eventReferenceMap = null;
      }
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