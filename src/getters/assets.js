export function getAssetById({assets}){
  if (assets){
    return (id) => {
      return (assets[id]) ? assets[id] : false;
    }
  }
}

export function getAssetFieldById({assets}){
  if (assets){
    return (field,id) => {
      return (assets[id]) ? assets[id][field] : false;
    }
  }
}