import {
      UPDATE_ADDRESS,
      UPDATE_VIRTUOSO_BALANCE,
      UPDATE_BALANCE,
      UPDATE_VRT1
} from "../../constants/Blockchain";



export function updateAddress(address) {
  return (dispatch) => {
    dispatch({type: UPDATE_ADDRESS, address});
  }
}

export function updateVirtuosoBalance(virtuosoBalance) {
  return (dispatch) => {
    dispatch({type: UPDATE_VIRTUOSO_BALANCE, virtuosoBalance});
  }
}

export function updateBalance(balance) {
  return (dispatch) => {
    dispatch({type: UPDATE_BALANCE, balance});
  }
}
export function updateVRT1(VRT1) {
  return (dispatch) => {
    dispatch({type: UPDATE_VRT1, VRT1});
  }
}
