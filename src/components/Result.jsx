import { DENOMINACIONES, calcularRetiroCarreo, formatCOP } from '../logic/business';
import { useATM } from '../context/ATMContext';

const NOMBRE_TIPO = {
  nequi: 'NEQUI',
  mano: 'Ahorro a la mano',
  ahorros: 'Cuenta de ahorros'
};

export default function Result() {
  const { state } = useATM();
  const cantidad = calcularRetiroCarreo(state.monto);

  const numeroReportado = state.accountType === 'nequi'
    ? '0' + state.accountNumber
    : state.accountNumber;

  const N = 1000;
  const valorMenor = state.monto - 10000;
  const proyeccion = valorMenor * N;

  return (
    <>
      <div className="prompt-line"><span className="caret">&gt;</span><span>Tipo de cuenta: {NOMBRE_TIPO[state.accountType]}</span></div>
      <div className="prompt-line"><span className="caret muted">·</span><span className="muted">Número de cuenta: {numeroReportado}</span></div>
      <div className="breakdown">
        <div className="prompt-line"><span className="caret">&gt;</span><span>Desglose para {formatCOP(state.monto)}:</span></div>
        {DENOMINACIONES.map((d, i) => (
          <div key={i} className="breakdown-row">
            <span>Billetes de {d.nombre}</span>
            <span className="dots"></span>
            <span>{cantidad[i]}</span>
          </div>
        ))}
        <div className="total-row">
          <span>Total entregado</span>
          <span>{formatCOP(state.monto)}</span>
        </div>
      </div>
      <div className="predict-box">
        <div>Predicción:</div>
        <div>Valor de referencia: <b>{formatCOP(valorMenor)}</b></div>
        <div>Proyección estimada: <b>{formatCOP(proyeccion)}</b></div>
      </div>
    </>
  );
}
