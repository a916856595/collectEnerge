import './canvas.scss';
import { ICanvas } from '../declare/declare';
import BaseEvent from './event';
import { LIFE_ERROR, LIFE_FINISH } from '../constant/life';

class Canvas extends BaseEvent implements ICanvas {
  private container: HTMLElement | null;
  private element: HTMLCanvasElement | null;
  private context: RenderingContext | null = null;
  private width: number = 0;
  private height: number = 0;

  constructor(elementSelector: string) {
    super();
    this.container = document.querySelector(elementSelector);
    this.element = document.createElement('canvas');
    this.element.classList.add('collect-energy-canvas');
    if (this.container) {
      this.container.appendChild(this.element);
      window.addEventListener('resize', this.setSizeInfo);
      this.context = this.element.getContext('2D');
      this.postponeFire(LIFE_FINISH);
    } else {
      this.postponeFire(
        LIFE_ERROR,
        { message: `Can not find container element that selector is '${elementSelector}'.` }
      );
    }
  }

  private setSizeInfo = () => {
    if (this.element) {
      const elementInfo = this.element.getBoundingClientRect();
      this.width = elementInfo.width;
      this.height = elementInfo.height;
    }
  }

  public getSize(): { width: number, height: number } {
    // Refreshing size info when info is empty.
    if (!this.width || !this.height) this.setSizeInfo();
    return {
      width: this.width,
      height: this.height
    };
  }

  public destroy() {
    this.context = null;
    if (this.container && this.element) {
      this.container.removeChild(this.element);
      window.removeEventListener('resize', this.setSizeInfo);
    }
    this.element = null;
    this.container = null;
    super.destroy();
  }
}

export default Canvas;