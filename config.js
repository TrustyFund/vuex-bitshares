const config = {
  bitsharesNodes: {
    list: {
      'wss://bitshares.openledger.info/ws': { location: 'Nuremberg, Germany' },
      'wss://eu.openledger.info/ws': { location: 'Berlin, Germany' },
      // 'wss://bit.btsabc.org/ws': { location: 'Hong Kong' },
      'wss://bts.ai.la/ws': { location: 'Hong Kong' },
      'wss://bitshares.apasia.tech/ws': { location: 'Bangkok, Thailand' },
      'wss://japan.bitshares.apasia.tech/ws': { location: 'Tokyo, Japan' },
      'wss://bitshares.dacplay.org/ws': { location: 'Hangzhou, China' },
      'wss://bitshares-api.wancloud.io/ws': { location: 'China' },
      // 'wss://openledger.hk/ws': { location: 'Hong Kong' },
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
    defaultNode: 'wss://bitshares.openledger.info/ws'
  },
  defaultAssetsNames: ['OPEN.BTC', 'OPEN.ETH', 'OPEN.DASH', 'OPEN.LTC',
    'OPEN.EOS', 'OPEN.STEEM', 'BTS', 'TRUSTY'],
  referrer: 'trfnd',
  removePrefix: 'OPEN.',
  faucetUrl: 'https://faucet.trusty.fund/signup'
};

export default config;
