import { createContext, useContext, useReducer } from 'react';
import { atmReducer, initialState } from '../reducer/atmReducer';

const ATMContext = createContext(null);

export function ATMProvider({ children }) {
  const [state, dispatch] = useReducer(atmReducer, initialState);

  return (
    <ATMContext.Provider value={{ state, dispatch }}>
      {children}
    </ATMContext.Provider>
  );
}

export function useATM() {
  const context = useContext(ATMContext);
  if (!context) {
    throw new Error('useATM debe usarse dentro de un ATMProvider');
  }
  return context;
}
