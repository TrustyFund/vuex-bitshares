import { Apis } from 'bitsharesjs-ws';

export function Get(username) {
  return new Promise((resolve, reject) => {
    Apis.instance().db_api().exec('get_full_accounts', [[username], false])
      .then(users => {
        resolve(users);
      })
      .catch(error => {
        reject(error);
      });
  });
}
