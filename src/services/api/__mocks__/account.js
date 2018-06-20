const suggestedBrainkey = 'glink omental webless pschent knopper brumous ' +
  'scarry were wasting isopod raper barbas maco kirn tegua mitome';

export const suggestBrainkey = () => {
  return suggestedBrainkey;
};

const users = ['hobb1t'];

export const getUser = async (nameOrId) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      resolve({
        success: users.includes(nameOrId)
      });
    });
  });
};

export const getAccountIdByOwnerPubkey = ownerPubkey => {
  return new Promise((resolve) => {
    if (ownerPubkey === 'BTS5AmuQyyhyzNyR5N3L6MoJUKiqZFgw7xTRnQr5XP5sLKbptCABX') {
      resolve(['1.2.512210']);
    } else {
      resolve({
        success: false
      });
    }
  });
};

export const createAccount = ({ name }) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (name === 'hobb1t') {
        resolve({
          success: true,
          id: '1.2.512210'
        });
      } else {
        resolve({
          success: false
        });
      }
    });
  });
};

export default {
  suggestBrainkey, getUser, getAccountIdByOwnerPubkey, createAccount
};
