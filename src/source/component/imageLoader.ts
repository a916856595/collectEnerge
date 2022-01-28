import BaseEvent from '../base/event';
import { LIFE_ERROR, LIFE_FINISH, LIFE_LOADING, LIFE_SUCCESS } from '../constant/life';
import { ERROR, LOAD } from '../constant/baseEvent';
import { IIMageLoader } from '../declare/declare';

type imageStateType = 'success' | 'loading' | 'error';

interface IImageInfo {
  state: imageStateType;
  url: string;
  name: string;
}

interface IImageMap {
  [key: string]: IImageInfo;
}

class ImageLoader extends BaseEvent implements IIMageLoader {
  private imageMap: IImageMap = {};

  private checkIsLoadFinish() {
    const isAllComplete = Object.values(this.imageMap).every((imageInfo: IImageInfo) => imageInfo.state !== LIFE_LOADING);
    if (isAllComplete) this.fire(LIFE_FINISH);
    return isAllComplete;
  }

  public load(name: string, url: string): this {
    if (!this.imageMap[name]) {
      this.imageMap[name] = { url, state: LIFE_LOADING, name };
    }
    const imageInfo = this.imageMap[name];
    if (imageInfo.state !== LIFE_SUCCESS) {
      const image = new Image();
      image.addEventListener(LOAD, () => {
        imageInfo.state = LIFE_SUCCESS;
        this.fire(LOAD, { name, url });
        this.checkIsLoadFinish();
      });
      image.addEventListener(ERROR, () => {
        imageInfo.state = LIFE_ERROR
        this.fire(LIFE_ERROR, { message: `There was an error occupied when loading the image '${url}'.` });
      });
      image.src = url;
    }
    return this;
  }
}

export default ImageLoader;