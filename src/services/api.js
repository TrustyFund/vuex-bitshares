import { Apis } from 'bitsharesjs-ws';
import User from './user';
import Assets from './assets';

const API = {
  wsNodeList: [
    { url: 'wss://bitshares.openledger.info/ws', location: 'Nuremberg, Germany' },
    { url: 'wss://eu.openledger.info/ws', location: 'Berlin, Germany' },
    { url: 'wss://bit.btsabc.org/ws', location: 'Hong Kong' },
    { url: 'wss://bts.ai.la/ws', location: 'Hong Kong' },
    { url: 'wss://bitshares.apasia.tech/ws', location: 'Bangkok, Thailand' },
    { url: 'wss://japan.bitshares.apasia.tech/ws', location: 'Tokyo, Japan' },
    { url: 'wss://bitshares.dacplay.org/ws', location: 'Hangzhou, China' },
    { url: 'wss://bitshares-api.wancloud.io/ws', location: 'China' },
    { url: 'wss://openledger.hk/ws', location: 'Hong Kong' },
    { url: 'wss://bitshares.crypto.fans/ws', location: 'Munich, Germany' },
    { url: 'wss://ws.gdex.top', location: 'China' },
    { url: 'wss://dex.rnglab.org', location: 'Netherlands' },
    { url: 'wss://dexnode.net/ws', location: 'Dallas, USA' },
    { url: 'wss://kc-us-dex.xeldal.com/ws', location: 'Kansas City, USA' },
    { url: 'wss://btsza.co.za:8091/ws', location: 'Cape Town, South Africa' },
    { url: 'wss://api.bts.blckchnd.com', location: 'Falkenstein, Germany' },
    {
      url: 'wss://eu.nodes.bitshares.ws',
      location: 'Central Europe - BitShares Infrastructure Program'
    },
    {
      url: 'wss://us.nodes.bitshares.ws',
      location: 'U.S. West Coast - BitShares Infrastructure Program'
    },
    {
      url: 'wss://sg.nodes.bitshares.ws',
      location: 'Singapore - BitShares Infrastructure Program'
    },
    { url: 'wss://ws.winex.pro', location: 'Singapore' }
  ],
  defaultWsNodeIndex: 8,
  /**
   * Initializes bitshares apis
   * @param {function} statusCallback - callback function for status update
   */
  initApis(statusCallback) {
    const wsString = this.wsNodeList[this.defaultWsNodeIndex].url;
    Apis.setRpcConnectionStatusCallback(statusCallback);
    this.testWsPings();
    return Apis.instance(wsString, true).init_promise;
  },
  testWsPings() {
    Promise.all(this.wsNodeList.map(async (node, index) => {
      const ping = await this.tryWsServer(node.url);
      this.wsNodeList[index].ping = ping;
    })).then(() => {
      console.table(this.wsNodeList);
      console.log(JSON.stringify(this.wsNodeList));
      this.selectDefaultNodeIndex();
    });
  },
  tryWsServer(url) {
    return new Promise((resolve) => {
      const date = new Date();
      const socket = new WebSocket(url);
      socket.onopen = () => {
        resolve(new Date() - date);
      };
      socket.onerror = () => {
        resolve(null);
      };
    });
  },
  selectDefaultNodeIndex() {
    let closestNodeIndex = 0;
    this.wsNodeList.forEach((node, index) => {
      if (node.ping && node.ping < (this.wsNodeList[closestNodeIndex].ping || 10000)) {
        closestNodeIndex = index;
      }
    });
    this.defaultWsNodeIndex = closestNodeIndex;
    const node = this.wsNodeList[closestNodeIndex];
    console.log('Closest node id : ', node.location + ' : ' + node.ping);
  },
  User,
  Assets
};

export default API;
