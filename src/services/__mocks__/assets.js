const assetsData = [
  {
    id: '1.3.0',
    symbol: 'BTS',
    precision: 5,
    issuer: '1.2.3',
    options: {
      max_supply: '360057050210207',
      market_fee_percent: 0,
      max_market_fee: '1000000000000000',
      issuer_permissions: 0,
      flags: 0,
      core_exchange_rate: {
        base: {
          amount: 1,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 1,
          asset_id: '1.3.0'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.0'
  },
  {
    id: '1.3.1999',
    symbol: 'OPEN.EOS',
    precision: 6,
    issuer: '1.2.96397',
    options: {
      max_supply: '1000000000000000',
      market_fee_percent: 20,
      max_market_fee: '100000000000000',
      issuer_permissions: 79,
      flags: 5,
      core_exchange_rate: {
        base: {
          amount: 334100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 100000000,
          asset_id: '1.3.1999'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.1999'
  },
  {
    id: '1.3.121',
    symbol: 'USD',
    precision: 4,
    issuer: '1.2.0',
    options: {
      max_supply: '1000000000000000',
      market_fee_percent: 0,
      max_market_fee: '1000000000000000',
      issuer_permissions: 511,
      flags: 128,
      core_exchange_rate: {
        base: {
          amount: 2953,
          asset_id: '1.3.121'
        },
        quote: {
          amount: 92632,
          asset_id: '1.3.0'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.121',
    bitasset_data_id: '2.4.21'
  },
  {
    id: '1.3.2001',
    symbol: 'OPEN.OMG',
    precision: 8,
    issuer: '1.2.96397',
    options: {
      max_supply: '1000000000000000',
      market_fee_percent: 20,
      max_market_fee: '100000000000000',
      issuer_permissions: 79,
      flags: 5,
      core_exchange_rate: {
        base: {
          amount: 306100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: '10000000000',
          asset_id: '1.3.2001'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.2001'
  },
  {
    id: '1.3.113',
    symbol: 'CNY',
    precision: 4,
    issuer: '1.2.0',
    options: {
      max_supply: '1000000000000000',
      market_fee_percent: 0,
      max_market_fee: '1000000000000000',
      issuer_permissions: 511,
      flags: 128,
      core_exchange_rate: {
        base: {
          amount: 7843,
          asset_id: '1.3.113'
        },
        quote: {
          amount: 38980,
          asset_id: '1.3.0'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.113',
    bitasset_data_id: '2.4.13'
  },
  {
    id: '1.3.859',
    symbol: 'OPEN.LTC',
    precision: 8,
    issuer: '1.2.96397',
    options: {
      max_supply: '1000000000000000',
      market_fee_percent: 20,
      max_market_fee: '1000000000000000',
      issuer_permissions: 79,
      flags: 133,
      core_exchange_rate: {
        base: {
          amount: 792600000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 2500000000,
          asset_id: '1.3.859'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.859'
  },
  {
    id: '1.3.1999',
    symbol: 'OPEN.EOS',
    precision: 6,
    issuer: '1.2.96397',
    options: {
      max_supply: '1000000000000000',
      market_fee_percent: 20,
      max_market_fee: '100000000000000',
      issuer_permissions: 79,
      flags: 5,
      core_exchange_rate: {
        base: {
          amount: 334100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 100000000,
          asset_id: '1.3.1999'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.1999'
  },
  {
    id: '1.3.1893',
    symbol: 'TRFND',
    precision: 8,
    issuer: '1.2.416265',
    options: {
      max_supply: '1000000000000000',
      market_fee_percent: 500,
      max_market_fee: '100000000000',
      issuer_permissions: 79,
      flags: 1,
      core_exchange_rate: {
        base: {
          amount: 2000000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 100000000,
          asset_id: '1.3.1893'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.1893'
  },
  {
    id: '1.3.861',
    symbol: 'OPEN.BTC',
    precision: 8,
    issuer: '1.2.96397',
    options: {
      max_supply: '1000000000000000',
      market_fee_percent: 20,
      max_market_fee: '1000000000000000',
      issuer_permissions: 79,
      flags: 135,
      core_exchange_rate: {
        base: {
          amount: '9295900000',
          asset_id: '1.3.0'
        },
        quote: {
          amount: 500000000,
          asset_id: '1.3.861'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.861'
  },
  {
    id: '1.3.2220',
    symbol: 'ARISTO',
    precision: 4,
    issuer: '1.2.496767',
    options: {
      max_supply: 1000000000,
      market_fee_percent: 0,
      max_market_fee: 0,
      issuer_permissions: 79,
      flags: 0,
      core_exchange_rate: {
        base: {
          amount: 100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 10000,
          asset_id: '1.3.2220'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.2220'
  },
  {
    id: '1.3.2379',
    symbol: 'ARCOIN',
    precision: 4,
    issuer: '1.2.356266',
    options: {
      max_supply: 1000000000,
      market_fee_percent: 0,
      max_market_fee: 0,
      issuer_permissions: 0,
      flags: 0,
      core_exchange_rate: {
        base: {
          amount: 100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 10000,
          asset_id: '1.3.2379'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.2379'
  },
  {
    id: '1.3.119',
    symbol: 'JPY',
    precision: 2,
    issuer: '1.2.0',
    options: {
      max_supply: '1000000000000000',
      market_fee_percent: 0,
      max_market_fee: '1000000000000000',
      issuer_permissions: 511,
      flags: 128,
      core_exchange_rate: {
        base: {
          amount: 3423,
          asset_id: '1.3.119'
        },
        quote: {
          amount: 88072,
          asset_id: '1.3.0'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.119',
    bitasset_data_id: '2.4.19'
  },
  {
    id: '1.3.136',
    symbol: 'ROSE',
    precision: 0,
    issuer: '1.2.19747',
    options: {
      max_supply: 100000000,
      market_fee_percent: 10,
      max_market_fee: 999,
      issuer_permissions: 79,
      flags: 129,
      core_exchange_rate: {
        base: {
          amount: 1,
          asset_id: '1.3.136'
        },
        quote: {
          amount: 4000000,
          asset_id: '1.3.0'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.136'
  },
  {
    id: '1.3.1085',
    symbol: 'JIJIN',
    precision: 2,
    issuer: '1.2.117444',
    options: {
      max_supply: '10000000000',
      market_fee_percent: 10,
      max_market_fee: 100000,
      issuer_permissions: 5,
      flags: 5,
      core_exchange_rate: {
        base: {
          amount: 100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 100,
          asset_id: '1.3.1085'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.1085'
  },
  {
    id: '1.3.1159',
    symbol: 'GAMES',
    precision: 0,
    issuer: '1.2.383',
    options: {
      max_supply: '1000000000000000',
      market_fee_percent: 0,
      max_market_fee: 0,
      issuer_permissions: 79,
      flags: 0,
      core_exchange_rate: {
        base: {
          amount: 100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 1,
          asset_id: '1.3.1159'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.1159'
  },
  {
    id: '1.3.1473',
    symbol: 'CVCOIN',
    precision: 4,
    issuer: '1.2.277233',
    options: {
      max_supply: '150000000000',
      market_fee_percent: 30,
      max_market_fee: 1000020000,
      issuer_permissions: 79,
      flags: 5,
      core_exchange_rate: {
        base: {
          amount: 50000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 10000,
          asset_id: '1.3.1473'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.1473'
  },
  {
    id: '1.3.2297',
    symbol: 'LZMSCORE',
    precision: 5,
    issuer: '1.2.373184',
    options: {
      max_supply: '1000000000000',
      market_fee_percent: 0,
      max_market_fee: 0,
      issuer_permissions: 79,
      flags: 0,
      core_exchange_rate: {
        base: {
          amount: 100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 100000,
          asset_id: '1.3.2297'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.2297'
  },
  {
    id: '1.3.2841',
    symbol: 'ZOMBIES',
    precision: 3,
    issuer: '1.2.473766',
    options: {
      max_supply: '100000000000000',
      market_fee_percent: 800,
      max_market_fee: '100000000000000',
      issuer_permissions: 1,
      flags: 1,
      core_exchange_rate: {
        base: {
          amount: 100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 100000,
          asset_id: '1.3.2841'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.2841'
  },
  {
    id: '1.3.2894',
    symbol: 'ZALUPA',
    precision: 4,
    issuer: '1.2.649072',
    options: {
      max_supply: '1000000000000000',
      market_fee_percent: 0,
      max_market_fee: 0,
      issuer_permissions: 79,
      flags: 0,
      core_exchange_rate: {
        base: {
          amount: 100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 10000,
          asset_id: '1.3.2894'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.2894'
  },
  {
    id: '1.3.2935',
    symbol: 'ELECTRON',
    precision: 4,
    issuer: '1.2.546295',
    options: {
      max_supply: '100000000000',
      market_fee_percent: 0,
      max_market_fee: 0,
      issuer_permissions: 79,
      flags: 0,
      core_exchange_rate: {
        base: {
          amount: 100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 10000,
          asset_id: '1.3.2935'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.2935'
  },
  {
    id: '1.3.3016',
    symbol: 'IDIOT',
    precision: 4,
    issuer: '1.2.304500',
    options: {
      max_supply: '8000000000000',
      market_fee_percent: 0,
      max_market_fee: 0,
      issuer_permissions: 79,
      flags: 0,
      core_exchange_rate: {
        base: {
          amount: 100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 10000,
          asset_id: '1.3.3016'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.3016'
  },
  {
    id: '1.3.3143',
    symbol: 'MESSAGES',
    precision: 0,
    issuer: '1.2.546295',
    options: {
      max_supply: 1000000,
      market_fee_percent: 0,
      max_market_fee: 0,
      issuer_permissions: 79,
      flags: 0,
      core_exchange_rate: {
        base: {
          amount: 100000,
          asset_id: '1.3.0'
        },
        quote: {
          amount: 1,
          asset_id: '1.3.3143'
        }
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      extensions: []
    },
    dynamic_asset_data_id: '2.3.3143'
  }
];

const fetch = (assetsArray) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      try {
        // return by ids or by names
        let result = assetsData.filter(asset => assetsArray.indexOf(asset.id) > -1);
        if (!result.length) {
          result = assetsData.filter(asset => assetsArray.indexOf(asset.symbol) > -1);
        }
        resolve(result);
      } catch (error) {
        console.log(error);
        resolve(null);
      }
    });
  });
};

export default {
  fetch
};

