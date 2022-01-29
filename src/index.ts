import './reset.scss';
import './game.scss';

import CollectEnergy from './source';

const collectEnergy = new CollectEnergy({
  container: '#container',
  width: '500px',   // Operation area width, option unit is pixel or percent .
  height: '90%',  // Operation area height, option unit is pixel or percent .
  anchor: 'center', // operation area anchor, optional center / left / right / top / bottom.
});
collectEnergy.on('error', (event) => {
  console.log('out error', event.message);
});
collectEnergy.on('finish', (event) => {
  console.log('ready', event.message);

  collectEnergy.start();
});


