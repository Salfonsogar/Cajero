import { useState } from 'react';
import { useATM } from '../context/ATMContext';
import { MONTOS_FIJOS, formatCOP, esMontoValido } from '../logic/business';
import Menu from './Menu';
import Controls from './Controls';

export default function Amount() {
  const { state, dispatch } = useATM();
  const [monto, setMonto] = useState(null);
  const [otroValor, setOtroValor] = useState('');
  const [showOtro, setShowOtro] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(null);

  const opciones = [
    ...MONTOS_FIJOS.map(m => ({ title: formatCOP(m), value: m })),
    { title: 'Otro valor', value: 'otro' }
  ];

  const handleSelect = (valor) => {
    const idx = opciones.findIndex(o => o.value === valor);
    setSelectedIdx(idx);
    setFeedback('');

    if (valor === 'otro') {
      setMonto(null);
      setShowOtro(true);
      setOtroValor('');
    } else {
      setMonto(valor);
      setShowOtro(false);
    }
  };

  const handleOtroChange = (e) => {
    const limpio = e.target.value.replace(/[^0-9]/g, '');
    setOtroValor(limpio);
    setMonto(limpio ? parseInt(limpio, 10) : null);
  };

  const handleRetirar = () => {
    if (!monto || monto <= 0) {
      setFeedback('Seleccione o ingrese un valor');
      return;
    }
    if (!esMontoValido(monto)) {
      dispatch({
        type: 'SET_ERROR',
        payload: `No es posible entregar ${formatCOP(monto)} con las denominaciones disponibles ($10.000, $20.000, $50.000, $100.000).`
      });
      return;
    }
    dispatch({ type: 'SET_AMOUNT', payload: monto });
  };

  return (
    <>
      <div className="prompt-line"><span className="caret">&gt;</span><span>Seleccione el valor a retirar:</span></div>
      <div className="field-hint">No se dispensan billetes de $5.000. Solo múltiplos de $10.000.</div>
      <Menu
        id="amountMenu"
        options={opciones}
        currentIdx={selectedIdx}
        onSelect={handleSelect}
      />
      {showOtro && (
        <div style={{ marginTop: 8 }}>
          <div className="prompt-line">
            <span className="caret">$</span>
            <input
              className="field-input"
              type="text"
              inputMode="numeric"
              placeholder="Ingrese un valor"
              value={otroValor}
              onChange={handleOtroChange}
              autoFocus
            />
          </div>
        </div>
      )}
      {feedback && (
        <div className="prompt-line"><span className="caret error">!</span><span className="error">{feedback}</span></div>
      )}
      <Controls>
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'GO_BACK_AMOUNT' })}>← Volver</button>
        <button
          className="btn btn-primary"
          disabled={!monto}
          onClick={handleRetirar}
        >Retirar</button>
      </Controls>
    </>
  );
}
