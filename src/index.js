import apis from './modules/apis';
import user from './modules/user';
import assets from './modules/assets';
import wallet from './modules/wallet';

export default function install(store) {
  store.registerModule('apis', apis);
  store.registerModule('user', user);
  store.registerModule('assets', assets);
  store.registerModule('wallet', wallet);
}
