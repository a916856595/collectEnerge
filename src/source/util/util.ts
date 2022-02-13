class Message {
  static warn(message: string) {
    console.warn(message);
  }

  static error(message: string) {
    console.error(message);
  }
}

export const message = new Message();

const getIdGenerate = (): (() => string) => {
  let index = 0;
  return function () {
    index += 1;
    return String(index);
  };
};

export const generateId: () => string = getIdGenerate();
