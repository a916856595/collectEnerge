import './reset.scss';
import './game.scss';

import CollectEnergy from './source';

const collectEnergy = new CollectEnergy({
   container: '#container'
});
collectEnergy.on('error', (event) => {
  console.log('out error', event.message);
});
collectEnergy.on('finish', (event) => {
  console.log('ready', event.message);
});


