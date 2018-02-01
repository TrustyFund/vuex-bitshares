import * as AccountService from '../services/account.js';
import * as types from '../mutations';

export const createAccount = ({ commit }, {
  activePubkey, ownerPubkey, name, referrer, faucetUrl = 'https://faucet.bitshares.eu/onboarding'
}) => {
  const createAccountPromise = fetch(faucetUrl + '/api/v1/accounts', {
    method: 'post',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      account: {
        name,
        owner_key: ownerPubkey,
        active_key: activePubkey,
        memo_key: activePubkey,
        refcode: null,
        referrer
      }
    })
  }).then(r => r.json());
  return createAccountPromise.then((res) => {
    if (res.error) {
      const { error: { base: [error] } } = res.error;
      commit(types.ACCOUNT_CREATE_ERROR, error);
      return undefined;
    }
    return AccountService.getAccount(name).then(account => {
      const { id } = account;
      commit(types.ACCOUNT_CREATED, { name, id });
    });
  });
};

export const fetchAccount = ({ commit }, ownerPubkey) => {
  return AccountService.getAccountIdByOwnerPubkey(ownerPubkey).then(id => {
    if (!id) {
      commit(types.ACCOUNT_FETCHED, {});
      return undefined;
    }
    return AccountService.getAccount(id).then(({ name }) => {
      commit(types.ACCOUNT_FETCHED, { name, id });
    });
  });
};
