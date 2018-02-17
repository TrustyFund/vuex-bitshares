/**
 * Is connection ready
 */
export function isReady(state) {
  return (state.rpcStatus === 'open') && state.wsConnected;
}

