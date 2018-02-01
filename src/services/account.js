import { ChainValidation } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';

export const getAccount = (nameOrId) => {
  return Apis.instance().db_api().exec('get_full_accounts', [[nameOrId], false])
    .then(([res]) => {
      if (res) {
        const [, { account }] = res;
        return account;
      }
      return null;
    });
};

export const isUsernameExists = (name) => {
  return getAccount(name).then(account => {
    if (account) return true;
    return false;
  });
};

export const getAccountIdByOwnerPubkey = (ownerPubkey) => {
  return Apis.instance().db_api().exec('get_key_references', [[ownerPubkey]])
    .then(([[userId]]) => {
      return userId;
    });
};

export const isUsernameValid = (name) => {
  return ChainValidation.is_account_name(name, false);
};

export const getUsernameError = (name) => {
  return ChainValidation.is_account_name_error(name, false);
};

export const isPremiumUsername = (name) => {
  return !ChainValidation.is_cheap_name(name);
};
