export const getDefaultState = () => {
  return {
    pendingDistributionUpdate: null,
    pendingOrders: {
      sellOrders: [],
      buyOrders: []
    },
    pendingTransfer: false,
    pending: false,
    error: null,
    transactionsProcessing: false,
    sellOrdersProcessed: false,
    fees: {
      order: {
        fee: 0
      },
      transfer: {
        fee: 0,
        kbytePrice: 0
      }
    }
  };
};
