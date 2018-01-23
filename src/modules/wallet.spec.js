import {shallow, createLocalVue} from 'vue-test-utils';
import Vuex from 'vuex'
import wallet from './wallet.js';
import assets from './assets.js';
import apis from './apis.js';

import {PrivateKey, FetchChain, TransactionBuilder} from 'bitsharesjs/es';

const localVue = createLocalVue();
localVue.use(Vuex);

let store = new Vuex.Store({
  modules: {
    wallet,
    assets,
    apis
  }
});

describe('wallet module', () => {
  const brainkey = "glink omental webless pschent knopper brumous scarry were wasting isopod raper barbas maco kirn tegua mitome"
  const password = 'qwer1234';
  const bts_asset = '1.3.0';
  const test_account = '1.2.383374';
  const hobbit_account = '1.2.512210';
  const transfer_amount = 10;
  const memp = '';
  beforeAll(done => {
    store.dispatch('initApis', () => {
      console.log('initApis callback');
      done();
    })
  });

  it('dispatches action', done => {
    store.dispatch('createWallet', {brainkey, password}).then(() => {
      done()
    })

  });
  it('signs transaction', done => {
    let memo_sender = test_account;

    let tr = new TransactionBuilder();
    let transfer_op = tr.get_type_operation("transfer", {
      fee: {
        amount: 0,
        asset_id: bts_asset
      },
      from: test_account,
      to: hobbit_account,
      amount: { 
        amount: 10,
        asset_id: bts_asset
      }
    });
    tr.add_operation(transfer_op);
    tr.set_required_fees().then(() => {
      const {active_key, owner_key} = store.state.wallet;
      const active_pubkey = active_key.toPublicKey().toPublicKeyString()
      const owner_pubkey = owner_key.toPublicKey().toPublicKeyString()
      console.log(`active_pubkey: ${active_pubkey}`);
      console.log(`owner_pubkey: ${owner_pubkey}`);
      tr.get_required_signatures([active_pubkey, owner_pubkey]).then( required_pubkeys => {
        let private_key = store.state.wallet.owner_key;
        let pubkey = private_key.toPublicKey().toPublicKeyString();
        console.log(required_pubkeys);
        tr.add_signer(private_key,);
        console.log(tr.serialize());
        done()
        /*tr.broadcast().then((res) => {
          console.log("tr broadcasted");
          console.log(res);
          done()
        });*/
      })
    });
    /*
    let password_private = PrivateKey.fromSeed(password);
    let password_pubkey = password_private.toPublicKey().toPublicKeyString();

    if(wallet.password_pubkey !== password_pubkey) return false;
    let password_aes = Aes.fromSeed(password);
    let encryption_plainbuffer = password_aes.decryptHexToBuffer(wallet.encryption_key);
    aes_private = Aes.fromSeed(encryption_plainbuffer);*/
  }, 20000);
});
