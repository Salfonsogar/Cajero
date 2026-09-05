import { useState } from 'react';
import { useATM } from '../context/ATMContext';
import { LARGO_CUENTA, validarCuenta } from '../logic/business';
import Controls from './Controls';

export default function AccountNumber() {
  const { state, dispatch } = useATM();
  const maxlen = LARGO_CUENTA[state.accountType];
  const [valor, setValor] = useState(state.accountNumber);
  const [feedback, setFeedback] = useState('');

  const REGLAS = {
    nequi: { longitud: 10, regla: '10 dígitos numéricos' },
    mano:   { longitud: 11, regla: '11 dígitos, debe comenzar con 03 o 13' },
    ahorros:{ longitud: 11, regla: '11 dígitos numéricos' }
  };

  const regla = REGLAS[state.accountType];
  const handleChange = (e) => {
    const limpio = e.target.value.replace(/[^0-9]/g, '').slice(0, maxlen);
    setValor(limpio);
    const valido = validarCuenta(state.accountType, limpio);
    setFeedback(
      limpio.length === maxlen && !valido
        ? 'Número inválido para este tipo de cuenta'
        : ''
    );
  };

  const valido = validarCuenta(state.accountType, valor);

  return (
    <>
      <div className="prompt-line"><span className="caret">&gt;</span><span>Ingrese el número de cuenta.</span></div>
      <input
        className="field-input"
        type="text"
        inputMode="numeric"
        maxLength={maxlen}
        placeholder={'0'.repeat(maxlen)}
        value={valor}
        onChange={handleChange}
        autoFocus
      />
      <div className="field-hint">
        Requisito: {regla.regla}. ({valor.length}/{maxlen})
      </div>
      {feedback && (
        <div className="prompt-line"><span className="caret error">!</span><span className="error">{feedback}</span></div>
      )}
      <Controls>
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'GO_BACK_ACCOUNT_TYPE' })}>← Volver</button>
        <button
          className="btn btn-primary"
          disabled={!valido}
          onClick={() => {
            dispatch({ type: 'SET_ACCOUNT_NUMBER', payload: valor });
            dispatch({ type: 'GO_AUTH' });
          }}
        >Continuar</button>
      </Controls>
    </>
  );
}
