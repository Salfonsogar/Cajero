import { useState } from 'react';
import { useATM } from '../context/ATMContext';
import Controls from './Controls';

export default function AuthPin() {
  const { dispatch } = useATM();
  const [pin, setPin] = useState('');

  const handleChange = (e) => {
    const limpio = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(limpio);
  };

  return (
    <>
      <div className="prompt-line"><span className="caret">&gt;</span><span>Ingrese su clave de 4 dígitos</span></div>
      <input
        className="field-input pin"
        type="password"
        inputMode="numeric"
        maxLength={4}
        placeholder="••••"
        value={pin}
        onChange={handleChange}
        autoFocus
      />
      <div className="field-hint">La clave no se muestra en pantalla.</div>
      <Controls>
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'GO_BACK_ACCOUNT_NUMBER' })}>← Volver</button>
        <button
          className="btn btn-primary"
          disabled={pin.length !== 4}
          onClick={() => {
            dispatch({ type: 'SET_PIN', payload: pin });
            dispatch({ type: 'GO_AMOUNT' });
          }}
        >Confirmar</button>
      </Controls>
    </>
  );
}
