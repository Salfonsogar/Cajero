import { useATM } from '../context/ATMContext';
import Controls from './Controls';

export default function ErrorScreen() {
  const { state, dispatch } = useATM();

  return (
    <>
      <div className="prompt-line"><span className="caret error">!</span><span className="error">Operación no disponible</span></div>
      <div className="prompt-line"><span className="muted">{state.errorMsg}</span></div>
      <div className="prompt-line" style={{ marginTop: 10 }}><span className="caret">&gt;</span><span>El proceso debe iniciarse nuevamente.</span></div>
      <Controls>
        <button className="btn btn-primary" onClick={() => dispatch({ type: 'RESET' })}>Iniciar de nuevo</button>
      </Controls>
    </>
  );
}
