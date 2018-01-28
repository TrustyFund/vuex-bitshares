/**
 * Return object with keys = id of each element of array (element.id)
 * @param {Array} array - array of data elements
 */
export const arrayToObject = (array) => {
  const obj = {};
  array.forEach(item => {
    obj[item.id] = item;
  });
  return obj;
};

