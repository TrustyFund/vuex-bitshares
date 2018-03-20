// Persistent Storage for data cache management MOCK
const PersistentStorage = {
  storage: {},
  saveUserData: ({ id, encryptedBrainkey }) => {
    PersistentStorage.storage.userId = id;
    PersistentStorage.storage.encryptedBrainkey = encryptedBrainkey;
  },
  getSavedUserData: () => {
    return {
      userId: PersistentStorage.storage.userId,
      encryptedBrainkey: PersistentStorage.storage.encryptedBrainkey
    };
  },
  saveNodesData: ({ data }) => {
    PersistentStorage.storage.nodes = data;
  },
  getSavedNodesData: () => {
    return PersistentStorage.storage.nodes;
  },
  clearSavedUserData: () => {
    delete PersistentStorage.storage.userId;
    delete PersistentStorage.storage.encryptedBrainkey;
  }
};

export default PersistentStorage;
