import BaseEvent from '../base/event';
import {
  IController,
  ICanvas,
  controllerStateType, IObject, IIMageLoader, IBaseEvent
} from '../declare/declare';
import { LIFE_ERROR, LIFE_FINISH } from '../constant/life';
import ImageLoader from '../component/imageLoader';
import globeConfig from '../../../config/uiConfig';

class Controller extends BaseEvent implements IController {
  private canvas: ICanvas | null;                 // 封装后的canvas
  private state: controllerStateType = 'waiting'; // 游戏状态
  private imageLoader: IIMageLoader;

  constructor(canvas: ICanvas) {
    super();
    this.canvas = canvas;
    this.imageLoader = new ImageLoader();
    // load image source
    Object.entries(globeConfig.imageConfig).forEach((nameAndUrl: [string, string]) => {
      const [name, url] = nameAndUrl;
      this.imageLoader.load(name, url);
    });
    const promiseList = [this.getPromise(this.canvas), this.getPromise(this.imageLoader)];
    Promise.all(promiseList)
      .then((event: IObject) => {
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

  public start(): this {
    this.state = 'running'
    return this;
  }

  public pause(): this {
    this.state = 'pausing';
    return this;
  }

  public destroy() {
    if (this.canvas) {
      this.canvas.destroy();
    }
    super.destroy();
    this.canvas = null;
  }
}

export default Controller;