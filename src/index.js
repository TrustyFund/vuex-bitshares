import apis from './modules/apis';
import user from './modules/user';
import assets from './modules/assets';

export default function install(store) {
  store.registerModule('apis', apis);
  store.registerModule('user', user);
  store.registerModule('assets', assets);
}
