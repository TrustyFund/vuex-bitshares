import { key, PrivateKey, PublicKey, Aes } from 'bitsharesjs';
import { decompress } from '../../../node_modules/lzma/src/lzma.js';

const restoreBackup = async ({ password, backup }) => {
  console.log('restoreBackup')
  const privateKey = PrivateKey.fromSeed(password || "");
  const walletName = 'test';
  const result = await restore(privateKey.toWif(), backup, walletName);
  return result;
}

const restore = (backup_wif, backup, wallet_name) => {
  return new Promise(resolve => {
    resolve(
      decryptWalletBackup(backup_wif, backup).then(wallet_object => {
          return WalletActions.restore(wallet_name, wallet_object);
      })
    );
  });
}

const decryptWalletBackup = (backup_wif, backup_buffer) => {
    return new Promise((resolve, reject) => {
        if (!Buffer.isBuffer(backup_buffer))
            backup_buffer = new Buffer(backup_buffer, "binary");

        let private_key = PrivateKey.fromWif(backup_wif);
        let public_key;
        try {
            public_key = PublicKey.fromBuffer(backup_buffer.slice(0, 33));
        } catch (e) {
            console.error(e, e.stack);
            throw new Error("Invalid backup file");
        }

        backup_buffer = backup_buffer.slice(33);
        try {
            backup_buffer = Aes.decrypt_with_checksum(
                private_key,
                public_key,
                null /*nonce*/,
                backup_buffer
            );
        } catch (error) {
            console.error("Error decrypting wallet", error, error.stack);
            reject("invalid_decryption_key");
            return;
        }

        try {
            decompress(backup_buffer, wallet_string => {
                try {
                    let wallet_object = JSON.parse(wallet_string);
                    resolve(wallet_object);
                } catch (error) {
                    if (!wallet_string) wallet_string = "";
                    console.error(
                        "Error parsing wallet json",
                        wallet_string.substring(0, 10) + "..."
                    );
                    reject("Error parsing wallet json");
                }
            });
        } catch (error) {
            console.error("Error decompressing wallet", error, error.stack);
            reject("Error decompressing wallet");
            return;
        }
    });
}

export default {
    restoreBackup
}