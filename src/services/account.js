import { ChainValidation } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';

export const getAccount = (name_or_id) => {
  return new Promise((resolve,reject) => {
    Apis.instance().db_api().exec('get_full_accounts', [[name_or_id], false])
      .then(([res]) => {
        if(res) {
          const [_, {account}] = res;
          resolve(account);
        } else {
          resolve(null);
        }
      })
  });
}

export const isUsernameExists = (name) => {
  return new Promise((resolve, reject) => {
    getAccount(name).then(account => {
      if(account) resolve(true);
      else resolve(false);
    }).catch(reject);
  });
}

export const getAccountIdByOwnerPubkey = (owner_pubkey) => {
  return new Promise((resolve, reject) => {
    Apis.instance().db_api().exec('get_key_references', [[owner_pubkey]])
      .then(([[user_id]]) => {
        resolve(user_id);
      });
  });
};

export const isUsernameValid =  (name) => {
  return ChainValidation.is_account_name(name, false);
};

export const getUsernameError = (name) => {
  return ChainValidation.is_account_name_error(name, false);
};

export const isPremiumUsername = (name) => {
  return !ChainValidation.is_cheap_name(name);
};
