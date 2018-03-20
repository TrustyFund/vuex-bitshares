import { Apis } from 'bitsharesjs-ws';
import { ChainTypes, ChainValidation } from "bitsharesjs";

const {object_type,impl_object_type} = ChainTypes;

let limit_order  = parseInt(object_type.limit_order, 10);
let history = parseInt(object_type.operation_history, 10);


let order_prefix = "1." + limit_order + ".";
let history_prefix = "1." + history + ".";




let marketSubscriptions = {};

const onUpdate = (updated_objects) => {
  let cancelledOrders = [];
  let closedCallOrders = [];


  for( let a = 0; a < updated_objects.length; ++a ) {
    for( let i = 0; i < updated_objects[a].length; ++i ) {
      let obj = updated_objects[a][i];
      if( ChainValidation.is_object_id( obj ) ) {
        if( obj.search( order_prefix ) == 0 ) {
          //console.log("REMOVE", obj);
        }
      } else {
        smthNew(obj);
      }
    }
  }
}

const smthNew = ( object ) => {
   if (!("id" in object)) {
    console.log("object with no id:", object);
    return;
  }

  if (object.id.startsWith(history_prefix)){
    const [type, payload] = object.op;
    if (type === ChainTypes.operations.fill_order) {
      console.log("FILL ORDER", payload);
    }
  }

  return;

  if( object.id.startsWith(order_prefix)){
    let { base, quote } = object.sell_price;
    console.log("NEW ORDER", object);
    if (base.asset_id === '1.3.0' && quote.asset_id === '1.3.113' || 
        base.asset_id === '1.3.113' && quote.asset_id === '1.3.0') {
      
    }

    if (marketSubscriptions[base.asset_id] !== undefined && marketSubscriptions[base.asset_id][quote.asset_id] != undefined) {
      //marketSubscriptions[base.asset_id][quote.asset_id](object);
    }
  } 
}

const subscribeToMarket = (base, quote, callback) => {
  if (marketSubscriptions[base] === undefined) {
    marketSubscriptions[base] = {};
    marketSubscriptions[base][quote] = callback;
    return
  }

  if (marketSubscriptions[base][qute] === undefined) {
    marketSubscriptions[base][quote] = callback;
  }
}

const unsubscribeToMarket = ({ base, quote }) => {
  delete marketSubscriptions[base][quote];
}

const fillBook = async (books, {base, quote}) => {
  if (books[base] === undefined) {
    books[base] = {};
  }

  if (books[quote] === undefined) {
    books[quote] = {};
  }

  books[base][quote] = [];
  books[quote][base] = [];

  const allOrders = await Apis.instance().db_api().exec('get_limit_orders', [base, quote, 200]);
  allOrders.forEach((order) => {
    books[order.sell_price.base.asset_id][order.sell_price.quote.asset_id].push(order);
  });
  return books;
}

const main = async () => {
 await Apis.instance('wss://openledger.hk/ws', true).init_promise;
 Apis.instance().db_api().exec( "set_subscribe_callback", [ onUpdate, true ] );
}


main().catch(console.error);