import { PrivateKey, PublicKey, Aes } from 'bitsharesjs';
import { getAccountIdByOwnerPubkey } from './account';
import lib from '../../utils/lzma/lzma_worker-min.js';

const decryptWalletBackup = (wif, input) => {
  return new Promise((resolve, reject) => {
    let backupBuffer;
    if (!Buffer.isBuffer(input)) {
      backupBuffer = Buffer.from(input, 'binary');
    } else {
      backupBuffer = input;
    }

    const privateKey = PrivateKey.fromWif(wif);
    let publicKey;
    try {
      publicKey = PublicKey.fromBuffer(backupBuffer.slice(0, 33));
    } catch (e) {
      console.error(e, e.stack);
      throw new Error('Invalid backup file');
    }

    const slicedBuffer = backupBuffer.slice(33);
    let decryptedBuffer;
    try {
      decryptedBuffer = Aes.decrypt_with_checksum(
        privateKey,
        publicKey,
        null /* nonce */,
        slicedBuffer
      );
    } catch (error) {
      reject(new Error('invalid_decryption_key'));
      return;
    }

    console.log('Decrypted', decryptedBuffer);

    try {
      lib.LZMA_WORKER.decompress(decryptedBuffer, walletJson => {
        try {
          const wallet = JSON.parse(walletJson);
          console.log('Wallet obj', wallet);
          resolve(wallet);
        } catch (error) {
          console.error('Error parsing wallet json');
          reject(new Error('Error parsing wallet json'));
        }
      });
    } catch (error) {
      console.error('Error decompressing wallet', error, error.stack);
      reject(new Error('Error decompressing wallet'));
    }
  });
};

const restore = async (wif, backup) => {
  try {
    const wallet = await decryptWalletBackup(wif, backup);
    if (!wallet.linked_accounts.length) {
      const { pubkey } = wallet.private_keys[0];
      const id = await getAccountIdByOwnerPubkey(pubkey);
      wallet.linked_accounts[0] = { name: id[0] };
    }
    return { success: true, wallet };
  } catch (e) {
    return { success: false, error: e };
  }
};

const restoreBackup = async ({ password, backup }) => {
  const privateKey = PrivateKey.fromSeed(password || '');
  const result = await restore(privateKey.toWif(), backup);
  return result;
};


export default {
  restoreBackup
};
