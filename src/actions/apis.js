import * as apis from "../services/api";
import * as types from '../mutations'


export const initApis = ({ commit, store },callback) => {

	let connectionStatus = function(status){
		switch(status){
			case "closed":
				commit(types.WS_DISCONNECTED);
			break;
			case "error":
				commit(types.WS_ERROR);
			break;
		}
	}

	apis.initApis(connectionStatus).then((result)=>{
		commit(types.WS_CONNECTED);
		callback();
	});
}

