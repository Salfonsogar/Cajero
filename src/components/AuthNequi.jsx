import { useEffect, useState } from 'react';
import { useATM } from '../context/ATMContext';
import Controls from './Controls';

function nuevoCodigo() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function AuthNequi() {
  const { state, dispatch } = useATM();
  const [code, setCode] = useState(state.nequiCode || nuevoCodigo());
  const [secondsLeft, setSecondsLeft] = useState(state.nequiSecondsLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const newCode = nuevoCodigo();
          setCode(newCode);
          dispatch({ type: 'NEQUI_NEW_CODE', payload: { code: newCode } });
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <>
      <div className="prompt-line"><span className="caret">&gt;</span><span>Clave dinámica de seguridad NEQUI</span></div>
      <div className="code-box">
        {code.split('').map((d, i) => (
          <div key={i} className="code-digit">{d}</div>
        ))}
      </div>
      <div className="timer-row">
        <span className="muted">expira en {secondsLeft}s</span>
        <div className="timer-bar">
          <div className="timer-fill" style={{ width: (secondsLeft / 60 * 100) + '%' }}></div>
        </div>
      </div>
      <div className="field-hint">Esta clave es solo visible en pantalla y se renueva automáticamente cada 60 segundos.</div>
      <Controls>
        <button
          className="btn btn-ghost"
          onClick={() => {
            dispatch({ type: 'NEQUI_CLEAR' });
            dispatch({ type: 'GO_BACK_ACCOUNT_NUMBER' });
          }}
        >← Volver</button>
        <button
          className="btn btn-primary"
          onClick={() => dispatch({ type: 'GO_AMOUNT' })}
        >Continuar</button>
      </Controls>
    </>
  );
}
