import BaseEvent from '../base/event';
import {
  IController,
  ICanvas,
  controllerStateType, IObject
} from '../declare/declare';
import { LIFE_ERROR } from '../constant/lifeCycle';
import { message } from '../util/util';

class Controller extends BaseEvent implements IController {
  private canvas: ICanvas | null;                 // 封装后的canvas
  private state: controllerStateType = 'waiting'; // 游戏状态

  constructor(canvas: ICanvas) {
    super();
    this.canvas = canvas;
    this.canvas.on(LIFE_ERROR, (event: IObject) => {
      message.error(event.message);
    });
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