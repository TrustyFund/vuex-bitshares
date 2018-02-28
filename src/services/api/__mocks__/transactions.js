const activePublicString = 'BTS5cRRWnDY5v1oLjAqUGqYTpyW8hU9DRu4Ewv2mvgoueNs68RmBG';
const ownerPublicString = 'BTS5AmuQyyhyzNyR5N3L6MoJUKiqZFgw7xTRnQr5XP5sLKbptCABX';

const transferAsset = async (fromId, to, assetId, amount, keys, memo = false) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (fromId !== '1.2.383374') {
        resolve({
          success: false,
          error: 'Wrong sender account'
        });
      }

      if (keys === null) {
        resolve({
          success: false,
          error: 'Wallet locked'
        });
      }

      const { active, owner } = keys;

      if (active.toPublicKey().toString() !== activePublicString ||
          owner.toPublicKey().toString() !== ownerPublicString) {
        resolve({
          success: false,
          error: 'Wrong keys provided'
        });
      }

      if (memo && memo !== 'test_memo') {
        resolve({
          success: false,
          error: 'Memo modifies somewhere'
        });
      }

      resolve({
        success: true,
        error: null
      });
    });
  });
};

export default { transferAsset };
