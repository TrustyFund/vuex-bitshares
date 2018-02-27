import connection from './modules/connection';
import user from './modules/user';
import assets from './modules/assets';
import account from './modules/account';
import portfolio from './modules/portfolio';
import transactions from './modules/transactions';

export default function install(store) {
  store.registerModule('connection', connection);
  store.registerModule('user', user);
  store.registerModule('assets', assets);
  store.registerModule('account', account);
  store.registerModule('portfolio', portfolio);
  store.registerModule('transactions', transactions);
}
