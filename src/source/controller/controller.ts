import BaseEvent from '../base/event';
import {
  canvasAnchorType,
  coordinatesType,
  coordinateType,
  handlerType,
  IBaseEvent,
  ICanvas,
  IController,
  IGlobe,
  IIMageLoader,
  IObject,
  IPop,
  IStuffInstance,
  stateType
} from '../declare/declare';
import { LIFE_CHANGE, LIFE_ERROR, LIFE_FINISH, LIFE_GOAL, LIFE_MISS, LIFE_MOVE } from '../constant/life';
import ImageLoader from '../component/imageLoader';
import globeConfig from '../../../config/uiConfig';
import { getMergedOptions } from '../util/methods';
import { CLICK, RESIZE } from '../constant/baseEvent';
import Background from '../ui/background';
import Globe from '../ui/globe';
import { GLOBE_RADIUS, VERTICAL_ACCELERATION } from '../../../config/config';
import { generateId } from '../util/util';
import UIConfig from '../../../config/uiConfig';
import Pop from '../ui/pop';
import { WAITING } from '../constant/other';

interface IControllerOptions {
  width?: string;
  height?: string;
  anchor?: canvasAnchorType; // operation area anchor, optional center / left / right / top / bottom.
  rate?: number;
}
interface IGlobeInfo {
  id: string;
  zIndex: number;
  globe?: IGlobe;
  pop?: IPop;
  state: 'destroyed' | 'exist' | 'prepare',
}
interface IStuffInfo {
  stuff: IStuffInstance;
  zIndex: number;
}

const DESTROYED = 'destroyed';
const EXIST = 'exist';
const PREPARE = 'prepare';
const CENTER = 'center';
const RUNNING = 'running';
const controllerDefaultOptions = {
  width: 'auto',
  height: 'auto',
  anchor: CENTER
};

class Controller extends BaseEvent implements IController {
  public imageLoader: IIMageLoader | null;
  private canvas: ICanvas | null;                 // 封装后的canvas
  private options: IControllerOptions | null;
  private operationalAreaCoordinates: coordinatesType | null = null;
  private operationalWidth: number = 0;
  private operationalHeight: number = 0;
  private uiComponents: IObject | null = { background: undefined, globes: {} };
  private canvasEventInfoMap: IObject | null = { [CLICK]: {} };
  private eventReferenceMap: IObject | null = {};
  private state: stateType = WAITING;
  private startTime: number = 0;

  constructor(canvas: ICanvas, controllerOptions: IControllerOptions = {}) {
    super();
    this.on(LIFE_CHANGE, (event: IObject) => {
      const { state } = event;
      this.state = state;
      if (state === RUNNING) this.startTime = Date.now();
    });
    this.canvas = canvas;
    this.options = getMergedOptions(controllerDefaultOptions, controllerOptions);
    this.imageLoader = new ImageLoader();
    // load image source
    Object.entries(globeConfig.imageConfig).forEach((nameAndUrl: [string, string]) => {
      const [name, url] = nameAndUrl;
      if (this.imageLoader) this.imageLoader.load(name, url);
    });
    const promiseList = [this.getPromise(this.canvas)];
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
      const range = this.operationalAreaCoordinates[1][0] - this.operationalAreaCoordinates[0][0] - GLOBE_RADIUS * 2;
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
          const speedDiff = Math.round((Date.now() - this.startTime) / 1000) * 2;
          const globe = new Globe(this.canvas, {
            id: globeInfo.id,
            coordinate: this.generateGlobeCoordinate(),
            radius: GLOBE_RADIUS,
            xSpeed: 0,
            ySpeed: 100 + speedDiff,
            xMaxSpeed: 0,
            yMaxSpeed: Infinity,
            xAcceleration: 0,
            yAcceleration: 0
          });
          globe.on(LIFE_MOVE, (event: IObject) => {
            const { newCoordinate } = event;
            if (
              this.uiComponents &&
              this.operationalAreaCoordinates &&
              this.operationalAreaCoordinates[1] &&
              (newCoordinate[1] - GLOBE_RADIUS) > (this.operationalAreaCoordinates[1][1] as number)
            ) {
              this.fire(LIFE_MISS);
              globe.destroy();
              delete this.uiComponents.globes[globeInfo.id];
            }
          });
          globe.on(CLICK, (event: IObject) => {
            if (this.uiComponents && this.state === RUNNING) {
              if (this.canvas && globeInfo.globe) {
                const pop = new Pop(this.canvas,{
                  coordinate: globeInfo.globe.coordinate as coordinateType,
                  during: 0.4,
                  radius: GLOBE_RADIUS / 2,
                  distance: GLOBE_RADIUS * 2,
                  buffer: GLOBE_RADIUS / 2,
                  background: 'green',
                  count: 9
                });
                pop.on(LIFE_FINISH, () => {
                  if (this.uiComponents) delete this.uiComponents.globes[globeInfo.id];
                });
                globeInfo.pop = pop;
              }
              globe.destroy();
              globeInfo.state = DESTROYED;
              globeInfo.globe = undefined;
              this.fire(LIFE_GOAL);
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
        } else if (globeInfo.state === DESTROYED && globeInfo.pop) {
          // After updated, component may be removed by move event.
          globeInfo.pop && globeInfo.pop.display();
        }
      });
    }
    return this;
  }

  public frame(span: number, isUpdateGlobes: boolean): this {
    if (this.operationalAreaCoordinates && this.uiComponents) {
      this.displayBackground();
      if (isUpdateGlobes) this.updateGlobesInfo();
      this.displayGlobes(isUpdateGlobes? span : 0);
    }
    return this;
  }

  public reset(): this {
    if (this.uiComponents && this.uiComponents.globes) {
      // @ts-ignore
      Object.entries(this.uiComponents.globes).forEach((keyAndGlobeInfo: [string, IGlobeInfo]) => {
        const [key, globeInfo] = keyAndGlobeInfo;
        if (globeInfo.globe) {
          globeInfo.globe.destroy;
          globeInfo.globe = undefined;
        }
        if (globeInfo.pop) {
          globeInfo.pop.destroy();
          globeInfo.pop = undefined;
        }
        if (this.uiComponents) delete this.uiComponents.globes[key];
      })
    }
    return this;
  }

  public destroy() {
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