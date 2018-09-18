[![Build Status](https://travis-ci.org/TrustyFund/vuex-bitshares.svg?branch=master)](https://travis-ci.org/TrustyFund/vuex-bitshares)

## Installation

Standalone:
```sh
cd your-project
npm install --save vuex-bitshares
```

Dev: 
```sh
cd your-project
git submodule add git@github.com:bitshares/vuex-bitshares.git
npm install --save file:vuex-bitshares
```


Then while initiating store:
```js
import Vue from 'vue';
import Vuex from 'vuex';
import vuexBitshares from 'vuex-bitshares';
...

Vue.use(Vuex);
const store = new Vuex.Store({...}) // Your modules
vuexBitshares(store);
export default store;
```

