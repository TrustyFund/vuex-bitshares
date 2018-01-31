import { Apis } from 'bitsharesjs-ws';
import * as AccountService from '../services/account.js'; 
import * as types from '../mutations';

export const createAccount = ({ commit, state }, { active_pubkey, owner_pubkey, name, referrer, faucet_url = 'https://faucet.bitshares.eu/onboarding' }) => {
  let create_account_promise = fetch( faucet_url + '/api/v1/accounts', {
    method: 'post',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      'account': {
        'name': name,
        'owner_key': owner_pubkey,
        'active_key': active_pubkey,
        'memo_key': active_pubkey,
        'refcode': null,
        'referrer': referrer
      }
    })
  }).then(r => r.json());
  return create_account_promise.then((res) => {
    if(res.error) {
      const {error: {base: [error]}} = res.error;
      commit(types.ACCOUNT_CREATE_ERROR,error);
    } else {
      return AccountService.getAccount(name).then(account => {
        const {name, id} = account
        commit(types.ACCOUNT_CREATED, { name, id });
      });
    }
  });
};

export const fetchAccount = ({ commit, state, store }, owner_pubkey) => {
  return AccountService.getAccountIdByOwnerPubkey(owner_pubkey).then(id => {
    if(!id) {
      commit(types.ACCOUNT_FETCHED, {});
    } else {
      return AccountService.getAccount(id).then(({name, id}) => {
        commit(types.ACCOUNT_FETCHED, { name, id });
      });
    }
  });
};
