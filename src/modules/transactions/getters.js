import * as utils from '../../utils';

console.log(utils.getMemoSizeFast);

const getters = {
  getPendingOrders: state => state.pendingOrders,
  hasPendingOrders: state => state.pendingOrders.sellOrders.length
    || state.pendingOrders.buyOrders.length,
  getPendingDistribution: state => state.pendingDistributionUpdate,
  hasPendingTransfer: state => state.pendingTransfer !== false,
  areTransactionsProcessing: state => state.transactionsProcessing,
  getPendingTransfer: state => state.pendingTransfer,
  getOrderFee: state => state.fees.order.fee,
  getTransferFee: state => state.fees.transfer.fee,
  getMemoPrice: (state) => {
    return (memo) => {
      const transferPrice = state.fees.transfer.fee;
      if (memo) {
        const byteLength = utils.getMemoSizeFast(memo);
        const memoPrice = Math.floor((byteLength * state.fees.transfer.kbytePrice) / 1024);
        return transferPrice + memoPrice;
      }
      return transferPrice;
    };
  }
};

export default getters;
