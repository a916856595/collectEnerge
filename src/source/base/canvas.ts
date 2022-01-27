import './canvas.scss';
import { ICanvas } from '../declare/declare';
import BaseEvent from './event';
import { LIFE_ERROR } from '../constant/lifeCycle';

class Canvas extends BaseEvent implements ICanvas {
  private container: HTMLElement | null;
  private element: HTMLCanvasElement | null;
  private context: RenderingContext | null = null;

  constructor(elementSelector: string) {
    super();
    this.container = document.querySelector(elementSelector);
    this.element = document.createElement('canvas');
    this.element.classList.add('collect-energy-canvas');
    if (this.container) {
      this.container.appendChild(this.element);
      this.context = this.element.getContext('2D');
    } else {
      this.postponeFire(LIFE_ERROR, { message: 'can not find element of container' });
    }
  }

  public destroy() {
    this.context = null;
    if (this.container && this.element) {
      this.container.removeChild(this.element);
    }
    this.element = null;
    this.container = null;
    super.destroy();
  }
}

export default Canvas;