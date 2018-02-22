import { key } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';

export const suggestBrainkey = (dictionary) => {
  return key.suggest_brain_key(dictionary);
};

export const getAccount = nameOrId => {
  return Apis.instance().db_api().exec('get_full_accounts', [[nameOrId], false])
    .then(([res]) => {
      if (res) {
        const [, { account }] = res;
        return account;
      }
      return null;
    });
};

export const getAccountIdByOwnerPubkey = async ownerPubkey => {
  const res = await Apis.instance().db_api().exec('get_key_references', [[ownerPubkey]]);
  return res ? res[0] : null;
};

export default {
  suggestBrainkey, getAccount, getAccountIdByOwnerPubkey
};
