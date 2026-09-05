import { useATM } from '../context/ATMContext';
import Menu from './Menu';

const opciones = [
  { title: 'NEQUI', value: 'nequi' },
  { title: 'Ahorro a la mano', value: 'mano' },
  { title: 'Cuenta de ahorros', value: 'ahorros' }
];

export default function AccountType() {
  const { dispatch } = useATM();

  return (
    <>
      <div className="prompt-line"><span className="caret">&gt;</span><span>Bienvenido al Cajero Automático</span></div>
      <div className="prompt-line"><span className="caret">&gt;</span><span>Seleccione el tipo de cuenta:</span></div>
      <Menu
        id="acctMenu"
        options={opciones}
        onSelect={(tipo) => dispatch({ type: 'SELECT_ACCOUNT_TYPE', payload: tipo })}
      />
      <div className="field-hint">Toque una opción o presione 1, 2 o 3.</div>
    </>
  );
}
