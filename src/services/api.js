import { Apis } from 'bitsharesjs-ws';
import User from './user';
import Assets from './assets';
import NodesManager from './nodes-manager';

const API = {
  connect(statusCallback, changeNode) {
    const url = changeNode ? NodesManager.changeNode() : NodesManager.getInitialNodeUrl();
    console.log('Connecting to node : ', url);

    return new Promise((resolve) => {
      Apis.instance(url, true).init_promise.then(() => {
        Apis.setRpcConnectionStatusCallback(statusCallback);
        statusCallback('open');
        resolve();
        NodesManager.testNodesPings();
      }).catch(error => {
        console.log('Connection error : ', error);
        // tests pings & connect to another node
        NodesManager.testNodesPings().then(() => {
          this.connect(statusCallback, true);
        });
      });
    });
  },
  User,
  Assets
};

export default API;
