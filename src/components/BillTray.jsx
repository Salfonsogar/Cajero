import { DENOMINACIONES, calcularRetiroCarreo } from '../logic/business';
import { useATM } from '../context/ATMContext';
import { useEffect, useState } from 'react';

const MAX_VISUAL = 60;

export default function BillTray() {
  const { state } = useATM();
  const [bills, setBills] = useState([]);

  useEffect(() => {
    if (state.step !== 'result') {
      setBills([]);
      return;
    }

    const cantidad = calcularRetiroCarreo(state.monto);
    const totalBills = cantidad.reduce((a, b) => a + b, 0);

    if (totalBills === 0) {
      setBills([]);
      return;
    }

    const newBills = [];
    let shown = 0;
    for (let i = 0; i < cantidad.length && shown < MAX_VISUAL; i++) {
      for (let k = 0; k < cantidad[i] && shown < MAX_VISUAL; k++) {
        newBills.push({
          id: shown,
          clase: DENOMINACIONES[i].clase,
          nombre: DENOMINACIONES[i].nombre,
          delay: shown * 16
        });
        shown++;
      }
    }

    if (totalBills > MAX_VISUAL) {
      newBills.push({
        id: 'overflow',
        overflow: true,
        count: totalBills - MAX_VISUAL
      });
    }

    setBills(newBills);
  }, [state.step, state.monto]);

  const totalBills = state.step === 'result'
    ? calcularRetiroCarreo(state.monto).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="slot">
      <div className="slot-label">Bandeja de billetes</div>
      <div className="bills">
        {bills.length === 0 && (
          <div className="empty-note">— sin retiro aún —</div>
        )}
        {bills.map((bill) =>
          bill.overflow ? (
            <div key="overflow" className="empty-note">+ {bill.count} billetes más</div>
          ) : (
            <div
              key={bill.id}
              className={`bill ${bill.clase}`}
              style={{ animationDelay: `${bill.delay}ms` }}
            >
              {bill.nombre}
            </div>
          )
        )}
      </div>
    </div>
  );
}
