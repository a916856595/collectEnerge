import BaseEvent from '../base/event';

type backgroundType = 'color' | 'image';

class Background extends BaseEvent {
  private type: backgroundType;
  private backgroundValue: string;

  constructor(type: backgroundType = 'color', backgroundValue: string = '#FFF') {
    super();
    this.type = type
    this.backgroundValue = backgroundValue;
  }
}