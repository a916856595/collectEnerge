import Canvas from './base/canvas';
import Controller from './controller/controller';
import {
  ICollectEnergy,
  ICanvas,
  IController,
  IObject,
  canvasAnchorType,
  stateType,
  IInterface
} from './declare/declare';
import BaseEvent from './base/event';
import { LIFE_CHANGE, LIFE_ERROR, LIFE_FINISH } from './constant/life';
import Interface from './controller/interface';

interface ICollectEnergyOptions  {
  container: string;     // The dom element selector.
  width?: string;        // Operation area width, option unit is pixel or percent, default auto.
  height?: string;       // Operation area height, option unit is pixel or percent, default auto.
  rate?: number;         // Operation area rate of with and height
  anchor?: canvasAnchorType;
}

const RUNNING = 'running';
const PAUSING = 'pausing';
const CHANGING = 'changing';
const SELECTING = 'selecting';

class CollectEnergy extends BaseEvent implements ICollectEnergy {
  private canvas: ICanvas | null;
  private controller: IController | null;
  private interface: IInterface | null;
  private state: stateType = CHANGING; // 游戏状态
  private frameSign: number = 0;
  private timeStamp: number = 0;

  constructor(collectEnergyOptions: ICollectEnergyOptions) {
    super();
    const {
      container,
      width,
      height,
      rate,
      anchor
    } = collectEnergyOptions;
    this.canvas = new Canvas(container);
    this.controller = new Controller(this.canvas, {
      width,
      height,
      rate,
      anchor
    });
    this.controller.on(LIFE_FINISH, (event: IObject) => {
      this.postponeFire(LIFE_FINISH, event);
    });
    this.controller.on(LIFE_ERROR, (event: IObject) => {
      this.postponeFire(LIFE_ERROR, event);
    });
    this.interface = new Interface(this.canvas, {  });
  }

  private changeState(state: stateType) {
    this.state = state;
    if (this.controller) {
      this.controller.fire(LIFE_CHANGE, { state });
    }
  }

  private frame(): number {
    return requestAnimationFrame(() => {
      if (this.canvas) this.canvas.clear();
      const timeStamp = Date.now();
      const span = (timeStamp - this.timeStamp) / 1000;
      if (this.controller) this.controller.frame(span, this.state === RUNNING);
      if (this.interface && (this.state === CHANGING || this.state === SELECTING)) this.interface.frame(span);
      this.frame();
      this.timeStamp = timeStamp;
    });
  }

  private beginFrame() {
    this.cancelFrame();
    this.frameSign = this.frame();
  }

  private cancelFrame() {
    if (this.frameSign) {
      cancelAnimationFrame(this.frameSign);
    }
  }

  public start() {
    this.changeState(RUNNING);
    this.beginFrame();
    return this;
  }

  public pause() {
    this.changeState(PAUSING);
    return this;
  }

  public select() {
    this.changeState(CHANGING);
    if (this.interface) this.interface.startEvolution(Date.now(), 1.2);
    this.beginFrame();
    return this;
  }

  public destroy() {
    if (this.controller) {
      this.controller.destroy();
      this.controller = null;
    }
    if (this.interface) {
      this.interface.destroy();
      this.interface = null;
    }
    if (this.canvas) {
      this.canvas.destroy();
      this.canvas = null;
    }
  }
}

export default CollectEnergy;