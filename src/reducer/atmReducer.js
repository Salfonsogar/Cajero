export const initialState = {
  step: 'account-type',
  accountType: null,
  accountNumber: '',
  pin: '',
  nequiCode: null,
  nequiSecondsLeft: 60,
  monto: null,
  errorMsg: ''
};

export function atmReducer(state, action) {
  switch (action.type) {
    case 'SELECT_ACCOUNT_TYPE':
      return {
        ...state,
        accountType: action.payload,
        step: 'account-number',
        accountNumber: '',
        errorMsg: ''
      };

    case 'SET_ACCOUNT_NUMBER':
      return {
        ...state,
        accountNumber: action.payload
      };

    case 'GO_AUTH':
      return {
        ...state,
        step: 'auth'
      };

    case 'SET_PIN':
      return {
        ...state,
        pin: action.payload
      };

    case 'GO_AMOUNT':
      return {
        ...state,
        step: 'amount',
        pin: '',
        nequiCode: null,
        nequiSecondsLeft: 60
      };

    case 'SET_AMOUNT':
      return {
        ...state,
        monto: action.payload,
        step: 'result'
      };

    case 'SET_ERROR':
      return {
        ...state,
        step: 'error',
        errorMsg: action.payload
      };

    case 'GO_BACK_ACCOUNT_TYPE':
      return {
        ...state,
        step: 'account-type',
        accountNumber: '',
        errorMsg: ''
      };

    case 'GO_BACK_ACCOUNT_NUMBER':
      return {
        ...state,
        step: 'account-number',
        errorMsg: ''
      };

    case 'GO_BACK_AMOUNT':
      return {
        ...state,
        step: 'auth'
      };

    case 'NEQUI_TICK':
      return {
        ...state,
        nequiSecondsLeft: action.payload
      };

    case 'NEQUI_NEW_CODE':
      return {
        ...state,
        nequiCode: action.payload.code,
        nequiSecondsLeft: 60
      };

    case 'NEQUI_CLEAR':
      return {
        ...state,
        nequiCode: null,
        nequiSecondsLeft: 60
      };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}
