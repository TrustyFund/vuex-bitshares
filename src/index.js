import connection from './modules/connection';
import user from './modules/user';
import assets from './modules/assets';
import wallet from './modules/wallet';
import portfolio from './modules/portfolio';

export default function install(store) {
  store.registerModule('connection', connection);
  store.registerModule('user', user);
  store.registerModule('assets', assets);
  store.registerModule('wallet', wallet);
  store.registerModule('portfolio', portfolio);
}
