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
import { LIFE_CHANGE, LIFE_ERROR, LIFE_FINISH, LIFE_GOAL, LIFE_MISS } from './constant/life';
import Interface from './controller/interface';
import { LOSE_COUNT, MENU_ANIMATION_TIME } from '../../config/config';
import { CLOSE, OPEN, SELECTING } from './constant/other';

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

class CollectEnergy extends BaseEvent implements ICollectEnergy {
  private canvas: ICanvas | null;
  private controller: IController | null;
  private interface: IInterface | null;
  private state: stateType = CHANGING; // 游戏状态
  private frameSign: number = 0;
  private timeStamp: number = 0;
  private missCount: number = 0;
  private score: number = 0;
  private highScore: number = 0;

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
    this.controller.on(LIFE_MISS, (event: IObject) => {
      this.missCount += 1;
      if (this.interface && this.missCount >= LOSE_COUNT ) {
        if (this.score > this.highScore) this.highScore = this.score;
        this.select();
      }
    });
    this.controller.on(LIFE_GOAL, (event: IObject) => {
      this.score += 1;
    });
    this.interface = new Interface(this.canvas, { horizontalCount: 8 });
    this.interface.on(LIFE_FINISH, (event: IObject) => {
      const { direction } = event;
      if (direction === CLOSE) this.changeState(SELECTING);
    });
  }

  private changeState(state: stateType) {
    this.state = state;
    if (this.controller) {
      this.controller.fire(LIFE_CHANGE, { state });
    }
    if (this.interface) {
      this.interface.fire(LIFE_CHANGE, { state });
    }
  }

  private frame(): number {
    return requestAnimationFrame(() => {
      if (this.canvas) this.canvas.clear();
      const timeStamp = Date.now();
      const span = (timeStamp - this.timeStamp) / 1000;
      if (this.controller && (this.state === RUNNING || this.state === CHANGING)) this.controller.frame(span, this.state === RUNNING);
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
    this.missCount = 0;
    this.score = 0;
    if (this.controller) this.controller.reset();
    this.changeState(RUNNING);
    this.beginFrame();
    return this;
  }

  public pause() {
    this.changeState(PAUSING);
    return this;
  }

  public select(isFirst?: boolean) {
    this.changeState(CHANGING);
    if (this.interface) {
      this.interface
        .setMenu([
          {
            text: 'START',
            onChoose: () => {
              const onAnimationEnd = () => {
                if (this.interface) this.interface.off(LIFE_FINISH, onAnimationEnd);
                this.start();
              };
              if (this.controller) this.controller.reset();
              if (this.interface) {
                this.changeState(CHANGING);
                this.interface
                  .on(LIFE_FINISH, onAnimationEnd)
                  .startEvolution(Date.now(), MENU_ANIMATION_TIME, OPEN);
              }
            }
          },
          {
            text: `HIGH SCORE: ${this.highScore}`
          }
        ])
        .startEvolution(Date.now(), isFirst? 0 : MENU_ANIMATION_TIME);
    }
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