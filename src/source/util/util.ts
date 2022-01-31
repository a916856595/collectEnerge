interface IMessage {
  warn: (message: string) => void;
  error: (message: string) => void;
}

class Message implements IMessage {
  public warn(message: string) {
    console.warn(message);
  }

  public error(message: string) {
    console.error(message);
  }
}

export const message = new Message();

const getIdGenerate = (): (() => string) => {
  let index = 0;
  return () => ++index + '';
}

export const generateId: () => string = getIdGenerate();