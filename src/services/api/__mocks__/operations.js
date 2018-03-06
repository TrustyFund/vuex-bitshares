const testOperations = {
  '1.2.3': [{
    id: '1111'
  }, {
    id: '2222'
  }, {
    id: '3333'
  }, {
    id: '4444'
  }, {
    id: '5555'
  }]
};

const singleTestOperation = {
  id: 'test-update-operation'
};

const assets = {
  '1.2.3': ['1.3.0']
};

const Operations = {
  parseOperations: ({ operations, userId }) => {
    return new Promise((resolve) => {
      process.nextTick(() => {
        if (operations[0].type === 'super-operation' && userId === '1.2.3') {
          resolve({
            operations: [singleTestOperation],
            assetsIds: assets[userId]
          });
        }
      });
    });
  },
  // fetches user's operations
  getUserOperations: ({ userId, limit }) => {
    return new Promise((resolve) => {
      process.nextTick(() => {
        if (testOperations[userId]) {
          resolve({
            success: true,
            data: {
              operations: testOperations[userId].slice(0, limit),
              assetsIds: assets[userId]
            }
          });
        } else {
          resolve({
            success: false,
            error: 'Error fetching account operations'
          });
        }
      });
    });
  }
};

// Operations.prepareOperationTypes();

export default Operations;
