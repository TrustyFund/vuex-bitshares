import ApiSamples from './api_samples.js';

const Apis = jest.genMockFromModule('bitsharesjs-ws');
Apis.instance = () => {
    return {
      init_promise: new Promise(resolve => resolve()),
      db_api: () => {
        return {
          exec: (name, data) => {
            return new Promise(resolve => {
              switch(name) {
                case 'get_full_accounts': {
                  const [[nameOrId]] = data;
                  const res = ApiSamples['get_full_accounts'][nameOrId];
                  resolve(res ? res : []);
                  break;
                }
                case 'get_key_references': {
                  const [[key]] = data;
                  const res = ApiSamples['get_key_references'][key];
                  resolve(res ? res : {});
                  break;
                }
              }
            });
          }
        }
      }
    }
  };
const ChainConfig = {
    address_prefix: 'BTS'
  }

export { Apis, ChainConfig };
