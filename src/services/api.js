import Cookies from 'js-cookie';
import { Apis } from 'bitsharesjs-ws';
import User from './user';
import Assets from './assets';

const API = {
  wsNodes: {
    'wss://bitshares.openledger.info/ws': { location: 'Nuremberg, Germany' },
    'wss://eu.openledger.info/ws': { location: 'Berlin, Germany' },
    'wss://bit.btsabc.org/ws': { location: 'Hong Kong' },
    'wss://bts.ai.la/ws': { location: 'Hong Kong' },
    'wss://bitshares.apasia.tech/ws': { location: 'Bangkok, Thailand' },
    'wss://japan.bitshares.apasia.tech/ws': { location: 'Tokyo, Japan' },
    'wss://bitshares.dacplay.org/ws': { location: 'Hangzhou, China' },
    'wss://bitshares-api.wancloud.io/ws': { location: 'China' },
    'wss://openledger.hk/ws': { location: 'Hong Kong' },
    'wss://bitshares.crypto.fans/ws': { location: 'Munich, Germany' },
    'wss://ws.gdex.top': { location: 'China' },
    'wss://dex.rnglab.org': { location: 'Netherlands' },
    'wss://dexnode.net/ws': { location: 'Dallas, USA' },
    'wss://kc-us-dex.xeldal.com/ws': { location: 'Kansas City, USA' },
    'wss://btsza.co.za:8091/ws': { location: 'Cape Town, South Africa' },
    'wss://api.bts.blckchnd.com': { location: 'Falkenstein, Germany' },
    'wss://eu.nodes.bitshares.ws': {
      location: 'Central Europe - BitShares Infrastructure Program'
    },
    'wss://us.nodes.bitshares.ws': {
      location: 'U.S. West Coast - BitShares Infrastructure Program'
    },
    'wss://sg.nodes.bitshares.ws': { location: 'Singapore - BitShares Infrastructure Program' },
    'wss://ws.winex.pro': { location: 'Singapore' }
  },
  defaultWsNodeUrl: 'wss://bitshares.openledger.info/ws',
  /**
   * Initializes bitshares apis
   * @param {function} statusCallback - callback function for status update
   */
  connectWs(statusCallback) {
    this.getCachedNodesData();
    this.selectDefaultNodeUrl();
    const defaultNode = this.wsNodes[this.defaultWsNodeUrl];
    console.log(defaultNode.location + ' ' + defaultNode.ping + ' ' + this.defaultWsNodeUrl);
    Apis.setRpcConnectionStatusCallback(statusCallback);
    return new Promise((resolve) => {
      Apis.instance(this.defaultWsNodeUrl, true).init_promise.then(() => {
        resolve();
        this.testWsPings();
      });
    });
  },
  getCachedNodesData() {
    const cachedWsData = Cookies.getJSON('BITSHARES_NODES');
    if (typeof (cachedWsData) === 'object') {
      Object.keys(this.wsNodes).forEach(url => {
        const cachedNode = cachedWsData[url];
        if (cachedNode && cachedNode.ping && typeof (cachedNode.ping) === 'number') {
          this.wsNodes[url].ping = cachedNode.ping;
        }
      });
    }
  },
  testWsPings() {
    Promise.all(Object.keys(this.wsNodes).map(async (url) => {
      if (url !== this.defaultWsNodeUrl) {
        this.wsNodes[url].ping = await this.pingWsNode(url);
      }
    })).then(() => {
      // console.table(this.wsNodes);
      Cookies.set('BITSHARES_NODES', this.wsNodes);
      this.selectDefaultNodeUrl();
    });
  },
  pingWsNode(url) {
    return new Promise((resolve) => {
      const date = new Date();
      const socket = new WebSocket(url);
      socket.onopen = () => {
        socket.close();
        resolve(new Date() - date);
      };
      socket.onerror = () => {
        resolve(null);
      };
    });
  },
  selectDefaultNodeUrl() {
    Object.keys(this.wsNodes).forEach((url) => {
      const node = this.wsNodes[url];
      const defaultNode = this.wsNodes[this.defaultWsNodeUrl];
      if (node.ping && node.ping < (defaultNode.ping || 10000)) {
        this.defaultWsNodeUrl = url;
      }
    });
  },
  User,
  Assets
};

export default API;
