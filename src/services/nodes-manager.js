/* eslint no-underscore-dangle: ['error', { 'allow': ['_nodes', '_selectedNodeUrl',
  '_pingNode', '_retrieveCachedNodesData', '_selectFastestNodeUrl'] }] */

import Cookies from 'js-cookie';

// BitsharesJS-WS Nodes Manager
// Selects node with minimal ping, stores nodes data in Cookies & retrieves it from there
class NodesManager {
  constructor() {
    this._nodes = {
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
    };
    // default selected node
    this._selectedNodeUrl = 'wss://bitshares.openledger.info/ws';
  }

  // gets nodes ping data from cookies
  _retrieveCachedNodesData() {
    const cachedData = Cookies.getJSON('BITSHARES_NODES');
    if (typeof (cachedData) === 'object' && cachedData !== null) {
      Object.keys(this._nodes).forEach(url => {
        const cachedNode = cachedData[url];
        if (cachedNode && cachedNode.ping && typeof (cachedNode.ping) === 'number') {
          this._nodes[url].ping = cachedNode.ping;
        }
      });
    }
  }

  // selects node with minimum ping
  _selectFastestNodeUrl() {
    Object.keys(this._nodes).forEach((url) => {
      const node = this._nodes[url];
      const selectedNode = this._nodes[this._selectedNodeUrl];
      if (node.ping && node.ping < (selectedNode.ping || 10000)) {
        this._selectedNodeUrl = url;
      }
    });
    return this._selectedNodeUrl;
  }

  // connected node and return ping time in milliseconds
  static _pingNode(url) {
    return new Promise((resolve) => {
      const date = new Date();
      let socket = new WebSocket(url);
      socket.onopen = () => {
        socket.close();
        socket = null;
        resolve(new Date() - date);
      };
      socket.onerror = () => {
        resolve(null);
      };
    });
  }

  // pings all nodes & updates nodes data, then saves data to cookies
  testNodesPings() {
    return new Promise((resolve) => {
      Promise.all(Object.keys(this._nodes).map(async (url) => {
        if (url !== this._selectedNodeUrl) {
          this._nodes[url].ping = await NodesManager._pingNode(url);
        }
      })).then(() => {
        Cookies.set('BITSHARES_NODES', this._nodes);
        resolve();
      });
    });
  }

  // retrieves nodes data from cache, selects fastest & returns it's url
  getInitialNodeUrl() {
    this._retrieveCachedNodesData();
    return this._selectFastestNodeUrl();
  }

  // changes selected node to next in speed & return it's url
  getAnotherNodeUrl() {
    this._nodes[this._selectedNodeUrl].ping = null;
    return this._selectFastestNodeUrl();
  }
}

export default new NodesManager();
