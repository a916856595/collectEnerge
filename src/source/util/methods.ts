import { IObject } from '../declare/declare';

export const getMergedOptions = (defaultOptions: IObject, userOptions: IObject): IObject => {
  const result: IObject = {};
  Object.entries(defaultOptions).forEach((keyAndValue: [string, any]) => {
    const [key, value] = keyAndValue;
    if (typeof value === 'object') result[key] = JSON.parse(JSON.stringify(value));
    else result[key] = value;
  });
  Object.assign(result, userOptions);
  return result;
};

const getRandomNumber = (): number => Math.round(Math.random() * 256);

export const getRandomColor = (): string => `rgb(${getRandomNumber()}, ${getRandomNumber()}, ${getRandomNumber()})`;
