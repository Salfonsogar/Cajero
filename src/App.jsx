import { useATM } from './context/ATMContext';
import Machine from './components/Machine';
import Screen from './components/Screen';
import Controls from './components/Controls';
import BillTray from './components/BillTray';
import AccountType from './components/AccountType';
import AccountNumber from './components/AccountNumber';
import AuthPin from './components/AuthPin';
import AuthNequi from './components/AuthNequi';
import Amount from './components/Amount';
import Result from './components/Result';
import ErrorScreen from './components/ErrorScreen';

function StepRenderer() {
  const { state, dispatch } = useATM();

  switch (state.step) {
    case 'account-type':
      return <AccountType />;
    case 'account-number':
      return <AccountNumber />;
    case 'auth':
      return state.accountType === 'nequi' ? <AuthNequi /> : <AuthPin />;
    case 'amount':
      return <Amount />;
    case 'result':
      return (
        <>
          <Result />
          <Controls>
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'RESET' })}>Nuevo retiro</button>
          </Controls>
        </>
      );
    case 'error':
      return <ErrorScreen />;
    default:
      return null;
  }
}

export default function App() {
  return (
    <Machine>
      <Screen>
        <StepRenderer />
      </Screen>
      <BillTray />
    </Machine>
  );
}
