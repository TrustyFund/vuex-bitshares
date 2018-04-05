const orderBuy1 = {
  deferred_fee: 578,
  expiration: '2019-04-05T15:34:23',
  for_sale: 14734920,
  id: '1.7.62250477',
  sell_price: {
    base: {
      amount: 14734920,
      asset_id: '1.3.0'
    },
    quote: {
      amount: 55769,
      asset_id: '1.3.850'
    }
  },
  seller: '1.2.132834'
};

const orderBuy2 = {
  deferred_fee: 578,
  expiration: '2023-04-05T15:32:43',
  for_sale: 50607694,
  id: '1.7.62250393',
  sell_price: {
    base: {
      amount: 50607694,
      asset_id: '1.3.0'
    },
    quote: {
      amount: 191664,
      asset_id: '1.3.850'
    }
  },
  seller: '1.2.493448'
};

const orderBuy3 = {
  deferred_fee: 578,
  expiration: '2023-04-04T15:34:31',
  for_sale: 52802994,
  id: '1.7.62250482',
  sell_price: {
    base: {
      amount: 52802994,
      asset_id: '1.3.0'
    },
    quote: {
      amount: 200000,
      asset_id: '1.3.850'
    }
  },
  seller: '1.2.126225'
};

const orderBuy4 = {
  deferred_fee: 578,
  expiration: '2019-04-05T14:16:21',
  for_sale: 1552408,
  id: '1.7.62243769',
  sell_price: {
    base: {
      amount: 1552408,
      asset_id: '1.3.0'
    },
    quote: {
      amount: 5880,
      asset_id: '1.3.850'
    }
  },
  seller: '1.2.376918'
};

const orderBuy5 = {
  deferred_fee: 578,
  expiration: '2023-04-05T14:07:21',
  for_sale: 10000000,
  id: '1.7.62243039',
  sell_price: {
    base: {
      amount: 10000000,
      asset_id: '1.3.0'
    },
    quote: {
      amount: 37915,
      asset_id: '1.3.850'
    }
  },
  seller: '1.2.429491'
};


const orderSell1 = {
  deferred_fee: 578,
  expiration: '2023-04-05T15:38:50',
  for_sale: 3602966,
  id: '1.7.62250730',
  sell_price: {
    base: {
      amount: 4000000,
      asset_id: '1.3.850'
    },
    quote: {
      amount: 1066400000,
      asset_id: '1.3.0'
    }
  },
  seller: '1.2.354664'
};

const orderSell2 = {
  deferred_fee: 0,
  expiration: '2023-04-05T14:48:21',
  for_sale: 18308,
  id: '1.7.62246651',
  sell_price: {
    base: {
      amount: 49903,
      asset_id: '1.3.850'
    },
    quote: {
      amount: 13319110,
      asset_id: '1.3.0'
    }
  },
  seller: '1.2.502341'
};

const orderSell3 = {
  deferred_fee: 0,
  expiration: '2018-04-20T18:46:31',
  for_sale: 136333,
  id: '1.7.62240965',
  sell_price: {
    base: {
      amount: 234500,
      asset_id: '1.3.850'
    },
    quote: {
      amount: 62879843,
      asset_id: '1.3.0'
    }
  },
  seller: '1.2.1310'
};

const orderSell4 = {
  deferred_fee: 578,
  expiration: '2019-04-05T12:46:40',
  for_sale: 139561,
  id: '1.7.62236557',
  sell_price: {
    base: {
      amount: 139561,
      asset_id: '1.3.850'
    },
    quote: {
      amount: 38435099,
      asset_id: '1.3.0'
    }
  },
  seller: '1.2.549541'
};

const orderSell5 = {
  deferred_fee: 578,
  expiration: '2018-04-12T06:56:56',
  for_sale: 181540,
  id: '1.7.62204518',
  sell_price: {
    base: {
      amount: 181540,
      asset_id: '1.3.850'
    },
    quote: {
      amount: 50000000,
      asset_id: '1.3.0'
    }
  },
  seller: '1.2.770077'
};

const ordersArray = [orderBuy1, orderSell5, orderSell4, orderBuy2, orderSell3, orderBuy3, orderSell2, orderSell1, orderBuy4, orderBuy5];

const loadLimitOrders = async (baseId, quoteId, limit = 500) => {
  const orders = ordersArray;
  const buyOrders = [];
  const sellOrders = [];
  orders.forEach((order) => {
    if (order.sell_price.base.asset_id === baseId) {
      buyOrders.push(order);
    } else {
      sellOrders.push(order);
    }
  });
  return new Promise((resolve) => {
    resolve({ buyOrders, sellOrders });
  });
};

class Market {
  constructor(base) {
    this.base = base;
    this.markets = {};
    this.fee = 578;
  }

  setDefaultObjects(assetId) {
    if (!this.markets[assetId]) {
      this.markets[assetId] = {
        orders: {
          buy: [], sell: []
        },
        callback: () => {}
      };
    }
  }

  async subscribeToMarket(assetId, callback) {
    if (assetId === this.base) return;
    const { buyOrders, sellOrders } = await loadLimitOrders(this.base, assetId);
    this.setDefaultObjects(assetId);
    // console.log('setting default: ' + assetId + ' : ', this.markets[assetId]);
    this.markets[assetId].orders.buy = buyOrders;
    console.log('buyOrders', buyOrders);
    this.markets[assetId].orders.sell = sellOrders;
    console.log('sellOrders', sellOrders);
    this.markets[assetId].callback = callback;
    callback();
  }
}

const markets = {};
markets['1.3.0'] = new Market('1.3.0');

export default markets;
