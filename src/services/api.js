import { Apis } from 'bitsharesjs-ws';
import config from '../../config';
import User from './user';
import Assets from './assets';
import NodesManager from './nodes-manager';

const nodesManager = new NodesManager({
  nodes: config.bitsharesNodes.list,
  defaultNode: config.bitsharesNodes.defaultNode
});

const API = {
  connect(statusCallback, changeNode) {
    const url = changeNode ? nodesManager.getAnotherNodeUrl() : nodesManager.getInitialNodeUrl();
    console.log('Connecting to node : ', url);

    Apis.instance(url, true).init_promise.then(() => {
      Apis.setRpcConnectionStatusCallback(statusCallback);
      statusCallback('open');
      nodesManager.testNodesPings();
    }).catch(error => {
      console.log('Connection error : ', error);
      // tests pings & connect to another node
      nodesManager.testNodesPings().then(() => {
        this.connect(statusCallback, true);
      });
    });
  },
  User,
  Assets
};

export default API;
