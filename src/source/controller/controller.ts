import BaseEvent from '../base/event';
import {
  IController,
  ICanvas,
  controllerStateType
} from '../declare/declare';

class Controller extends BaseEvent implements IController {
  private canvas: ICanvas | null;                 // 封装后的canvas
  private state: controllerStateType = 'waiting'; // 游戏状态

  constructor(canvas: ICanvas) {
    super();
    this.canvas = canvas;
  }

  public destroy() {
    if (this.canvas) {
      this.canvas.destroy();
    }
    this.canvas = null;
  }
}

export default Controller;