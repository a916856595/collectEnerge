import BaseEvent from '../base/event';
import { LIFE_ERROR, LIFE_FINISH, LIFE_LOADING, LIFE_SUCCESS } from '../constant/life';
import { ERROR, LOAD } from '../constant/baseEvent';
import { IIMageLoader } from '../declare/declare';

type imageStateType = 'success' | 'loading' | 'error';

interface IImageInfo {
  state: imageStateType;
  url: string;
  name: string;
  image: HTMLImageElement;
}

interface IImageMap {
  [key: string]: IImageInfo;
}

class ImageLoader extends BaseEvent implements IIMageLoader {
  private imageMap: IImageMap | null = {};

  private checkIsLoadFinish() {
    let isAllComplete = false;
    if (this.imageMap) {
      isAllComplete = Object.values(this.imageMap).every((imageInfo: IImageInfo) => imageInfo.state !== LIFE_LOADING);
    }
    if (isAllComplete) this.fire(LIFE_FINISH);
    return isAllComplete;
  }

  public load(name: string, url: string): this {
    if (!this.imageMap) return this;
    if (!this.imageMap[name]) {
      this.imageMap[name] = {
        url,
        state: LIFE_LOADING,
        name,
        image: new Image()
      };
    }
    const imageInfo = this.imageMap[name];
    if (imageInfo.state !== LIFE_SUCCESS) {
      const image = imageInfo.image;
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

  public getImageSource(imageName: string): HTMLImageElement | null {
    let result = null;
    if (this.imageMap && this.imageMap[imageName]) {
      result = this.imageMap[imageName].image;
    }
    return result;
  }

  public destroy() {
    this.imageMap = null;
    super.destroy();
  }
}

export default ImageLoader;