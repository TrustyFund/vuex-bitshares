export const getDefaultState = () => {
  return {
    userId: null,
    keys: {
      active: null,
      owner: null
    },
    userType: null,
    wallet: {
      passwordPubkey: null,
      encryptedBrainkey: null,
      encryptionKey: null,
      aesPrivate: null
    },
    userData: null
  };
};
