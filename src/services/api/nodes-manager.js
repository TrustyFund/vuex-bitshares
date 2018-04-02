/* eslint no-underscore-dangle: ['error', { 'allow': ['_nodes', '_selectedNodeUrl',
  '_pingNode', '_retrieveCachedNodesData', '_selectFastestNode'] }] */

import PersistentStorage from '../persistent-storage';

// BitsharesJS-WS Nodes Manager
// Selects node with minimal ping, stores nodes data in persistent storage & retrieves it from there
class NodesManager {
  constructor({ nodes, defaultNode }) {
    this._nodes = nodes;
    this._selectedNodeUrl = defaultNode;
  }

  // gets nodes ping data from storage
  _retrieveCachedNodesData() {
    const cachedData = PersistentStorage.getSavedNodesData();
    if (!cachedData) return;
    Object.keys(this._nodes).forEach(url => {
      const cachedNode = cachedData[url];
      if (cachedNode && cachedNode.ping && typeof (cachedNode.ping) === 'number') {
        this._nodes[url].ping = cachedNode.ping;
      }
    });
  }

  // selects node with minimum ping
  _selectFastestNode() {
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

  // if there is no cached data, pings all nodes & updates nodes data, then caches data
  testNodesPings() {
    const cachedData = PersistentStorage.getSavedNodesData();
    if (cachedData) return;
    Promise.all(Object.keys(this._nodes).map(async (url) => {
      if (url !== this._selectedNodeUrl) {
        this._nodes[url].ping = await NodesManager._pingNode(url);
      }
    })).then(() => {
      PersistentStorage.saveNodesData({ data: this._nodes });
    });
  }

  // retrieves nodes data from cache, selects fastest & returns it's url
  getInitialNodeUrl() {
    this._retrieveCachedNodesData();
    return this._selectFastestNode();
  }

  // returns another node url than specified
  getAnotherNodeUrl(url) {
    const urls = Object.keys(this._nodes);
    const index = urls.indexOf(url);
    urls.splice(index, 1);
    return urls[Math.floor(Math.random() * urls.length)];
  }
}

export default NodesManager;
