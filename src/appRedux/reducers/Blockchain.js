
import {
      UPDATE_ADDRESS,
      UPDATE_VIRTUOSO_BALANCE,
      UPDATE_BALANCE,
      UPDATE_VRT1
} from "../../constants/Blockchain";

const initialSettings = {
  address: "",
  virtuosoBalance: 0,
  balance: 0,
  VRT1: 0
};


const SettingsReducer = (state = initialSettings, action) => {
  switch (action.type) {

    case UPDATE_ADDRESS:
      return {
        initialSettings,
        address: action.address
      };
    case UPDATE_VIRTUOSO_BALANCE:
      return {
        ...state,
        virtuosoBalance: action.virtuosoBalance
      };

    case UPDATE_BALANCE:
      return {
        ...state,
        balance: action.balance
      };

    case UPDATE_VRT1:
      return {
        ...state,
        VRT1: action.VRT1
      };
    default:
      return state;
  }
};

export default SettingsReducer;
