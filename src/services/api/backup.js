import { key, PrivateKey, PublicKey, Aes } from 'bitsharesjs';
import { getAccountIdByOwnerPubkey } from './account';
import lib from '../../utils/lzma/lzma_worker-min.js';


const restoreBackup = async ({ password, backup }) => {
  const privateKey = PrivateKey.fromSeed(password || "");
  const result = await restore(privateKey.toWif(), backup, 'test');
  return result;
}

const restore = async (backup_wif, backup, wallet_name) => {
    try {
        const wallet = await decryptWalletBackup(backup_wif, backup);
        console.log('Wallet restore', wallet);
        if (!wallet.linked_accounts.length) {
            const pubkey = wallet.private_keys[0].pubkey;
            const id = await getAccountIdByOwnerPubkey(pubkey);
            wallet.linked_accounts[0] = { name: id[0] };
        }
        return { success: true, wallet };
    } catch (e) {
        return { success: false, error: e }
    }
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


        console.log('restoreBackup', backup_buffer, backup_wif)

        backup_buffer = backup_buffer.slice(33);
        try {
            backup_buffer = Aes.decrypt_with_checksum(
                private_key,
                public_key,
                null /*nonce*/,
                backup_buffer
            );
        } catch (error) {
            reject("invalid_decryption_key");
            return;
        }

        console.log('Decrypted', backup_buffer);

        try {
            lib.LZMA_WORKER.decompress(backup_buffer, wallet_string => {
                try {
                    let wallet_object = JSON.parse(wallet_string);
                    console.log('Wallet obj', wallet_object)
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