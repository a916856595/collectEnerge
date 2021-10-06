import './canvas.scss';

class Canvas {
  private container: HTMLElement | null;
  private element: any;
  private context: any;

  constructor(elementSelector: string) {
    this.container = document.querySelector(elementSelector);
    this.element = document.createElement('canvas');
    this.element.classList.add('collect-energy-canvas');
    if (this.container) {
      this.container.appendChild(this.element);
      this.context = this.element.getContext('2D');
    } else {
      throw(new Error('can not find element of container'));
    }
  }

  public destroy() {
    this.context = null;
    if (this.container) {
      this.container.removeChild(this.element);
    }
    this.element = null;
    this.container = null;
  }
}

export default Canvas;