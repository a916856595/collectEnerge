import BaseEvent from '../base/event';
import { ICanvas, IInterface } from '../declare/declare';
import { getMergedOptions } from '../util/methods';

interface IInterfaceOptions {

}

interface IInterfaceOptionsResult {

}

const interfaceDefaultOptions = {

};

class Interface extends BaseEvent implements IInterface {
  private canvas: ICanvas | null;
  private options: IInterfaceOptionsResult | null;

  constructor(canvas: ICanvas, interfaceOptions: IInterfaceOptions) {
    super();
    this.canvas = canvas;
    this.options = getMergedOptions(interfaceDefaultOptions, interfaceOptions);
  }

  destroy() {
    this.canvas = null;
    this.options = null;
    super.destroy();
  }
}

export default Interface;