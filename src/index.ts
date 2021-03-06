import './reset.scss';
import './game.scss';

import CollectEnergy from './source';

const collectEnergy = new CollectEnergy({
  container: '#container',
  // width: '350px',   // Operation area width, option unit is pixel or percent .
  // height: '700px',  // Operation area height, option unit is pixel or percent .
  rate: 405 / 721, // Operation area rate of with and height
  anchor: 'center', // operation area anchor, optional center / left / right / top / bottom.
});
collectEnergy.on('error', (event) => {
  console.log('out error', event.message);
});
collectEnergy.on('finish', (event) => {
  console.log('ready', event.message);

  collectEnergy.select(true);

  // setTimeout(() => {
  //   collectEnergy.pause()
  // }, 2000)
});
