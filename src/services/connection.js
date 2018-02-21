import { Apis } from 'bitsharesjs-ws';
import config from '../../config';
import NodesManager from './nodes-manager';

const nodesManager = new NodesManager({
  nodes: config.bitsharesNodes.list,
  defaultNode: config.bitsharesNodes.defaultNode
});

/**
 * Connects to bitsharesjs-ws with provided callback function
 */
const connect = (statusCallback, changeNode) => {
  const url = changeNode ? nodesManager.getAnotherNodeUrl() : nodesManager.getInitialNodeUrl();
  console.log('Connecting to node : ', url);

  Apis.instance(url, true).init_promise.then(() => {
    Apis.setRpcConnectionStatusCallback(statusCallback);
    statusCallback('open');
    nodesManager.testNodesPings();
  }).catch(error => {
    console.log('Connection error : ', error);
    // connect to another node
    this.connect(statusCallback, true);
  });
};

export default {
  connect
};
