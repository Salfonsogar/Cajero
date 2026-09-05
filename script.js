const DENOMINACIONES = [
  { valor: 10000, nombre: '$10.000', clase: 'd10000' },
  { valor: 20000, nombre: '$20.000', clase: 'd20000' },
  { valor: 50000, nombre: '$50.000', clase: 'd50000' },
  { valor: 100000, nombre: '$100.000', clase: 'd100000' }
];
const VALORES = DENOMINACIONES.map(d => d.valor);

function calcularRetiroCarreo(monto) {
  const cantidad = VALORES.map(() => 0);
  if (monto <= 0 || monto % VALORES[0] !== 0) return cantidad;

  let restante = monto;

  while (restante > 0) {
    const antes = restante;
    for (let skip = 0; skip < VALORES.length && restante > 0; skip++) {
      for (let j = skip; j < VALORES.length && restante >= VALORES[j]; j++) {
        cantidad[j]++;
        restante -= VALORES[j];
      }
    }
    if (restante === antes) break;
  }
  return cantidad;
}

function esMontoValido(monto) {
  return Number.isInteger(monto) && monto > 0 && monto % VALORES[0] === 0;
}

function formatCOP(n) {
  return '$' + n.toLocaleString('es-CO');
}

function estadoInicial() {
  return {
    step: 'account-type',
    accountType: null,
    accountNumber: '',
    pin: '',
    nequiCode: null,
    nequiTimer: null,
    nequiSecondsLeft: 60,
    monto: null,
    errorMsg: ''
  };
}

const state = estadoInicial();

const MONTOS_FIJOS = [20000, 50000, 100000, 200000, 500000];

const screenEl = document.getElementById('screen');
const controlsEl = document.getElementById('controls');
const billsEl = document.getElementById('bills');

function resetAll() {
  if (state.nequiTimer) clearInterval(state.nequiTimer);
  Object.assign(state, estadoInicial());
  billsEl.innerHTML = '<div class="empty-note">— sin retiro aún —</div>';
  render();
}

function goError(msg) {
  if (state.nequiTimer) clearInterval(state.nequiTimer);
  state.errorMsg = msg;
  state.step = 'error';
  render();
}

function render() {
  if (state.step === 'account-type') return renderAccountType();
  if (state.step === 'account-number') return renderAccountNumber();
  if (state.step === 'auth') return renderAuth();
  if (state.step === 'amount') return renderAmount();
  if (state.step === 'result') return renderResult();
  if (state.step === 'error') return renderErrorScreen();
}

function renderMenu(containerId, options, onSelect) {
  const html = `
    <div class="screen-menu" id="${containerId}">
      ${options.map((opt, i) => `
        <div class="screen-option" data-idx="${i}" tabindex="0" role="button">
          <span class="key">${i + 1}</span>
          <span class="opt-text"><span class="opt-title">${opt.title}</span></span>
        </div>
      `).join('')}
    </div>
  `;
  const wire = () => {
    document.getElementById(containerId).querySelectorAll('.screen-option').forEach(el => {
      const activar = () => onSelect(options[Number(el.dataset.idx)].value, el);
      el.addEventListener('click', activar);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activar(); }
      });
    });
  };
  return { html, wire };
}

let opcionesActuales = [];
let menuActualId = null;

function renderAccountType() {
  const opciones = [
    { title: 'NEQUI', value: 'nequi' },
    { title: 'Ahorro a la mano', value: 'mano' },
    { title: 'Cuenta de ahorros', value: 'ahorros' }
  ];
  opcionesActuales = opciones;
  menuActualId = 'acctMenu';

  const menu = renderMenu('acctMenu', opciones, (tipo) => {
    state.accountType = tipo;
    state.step = 'account-number';
    render();
  });

  screenEl.innerHTML = `
    <div class="prompt-line"><span class="caret">&gt;</span><span>Bienvenido al Cajero Automático</span></div>
    <div class="prompt-line"><span class="caret">&gt;</span><span>Seleccione el tipo de cuenta:</span></div>
    ${menu.html}
    <div class="field-hint">Toque una opción o presione 1, 2 o 3.</div>
  `;
  controlsEl.innerHTML = '';
  menu.wire();
}

const LARGO_CUENTA = { nequi: 10, mano: 11, ahorros: 11 };

function renderAccountNumber() {
  const maxlen = LARGO_CUENTA[state.accountType];
  menuActualId = null;
  opcionesActuales = [];

  screenEl.innerHTML = `
  <div class="prompt-line"><span class="caret">&gt;</span><span>Ingrese el número de cuenta.</span></div>
  <input class="field-input" id="acctInput" type="text" inputmode="numeric" maxlength="${maxlen}" placeholder="${'0'.repeat(maxlen)}" value="${state.accountNumber}">
  <div id="acctFeedback"></div>
`;

  controlsEl.innerHTML = `
  <button class="btn btn-ghost" id="backBtn">← Volver</button>
  <button class="btn btn-primary" id="nextBtn" disabled>Continuar</button>
`;

  const input = document.getElementById('acctInput');
  const feedback = document.getElementById('acctFeedback');
  const nextBtn = document.getElementById('nextBtn');

  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, maxlen);
    const valido = validarCuenta(state.accountType, input.value);
    feedback.innerHTML = (input.value.length === maxlen && !valido)
      ? `<div class="prompt-line"><span class="caret error">!</span><span class="error">Número inválido para este tipo de cuenta</span></div>`
      : '';
    nextBtn.disabled = !valido;
  });

  document.getElementById('backBtn').addEventListener('click', () => {
    state.step = 'account-type';
    render();
  });

  nextBtn.addEventListener('click', () => {
    state.accountNumber = input.value;
    state.step = 'auth';
    render();
  });

  input.focus();
}

const VALIDACIONES_CUENTA = {
  nequi: /^[0-9]{10}$/,
  mano: /^[01]3[0-9]{9}$/,
  ahorros: /^[0-9]{11}$/
};

function validarCuenta(tipo, num) {
  const regex = VALIDACIONES_CUENTA[tipo];
  return regex ? regex.test(num) : false;
}

function renderAuth() {
  menuActualId = null;
  opcionesActuales = [];
  if (state.accountType === 'nequi') return renderAuthNequi();
  return renderAuthPin();
}

function renderAuthNequi() {
  function nuevoCodigo() {
    state.nequiCode = String(Math.floor(100000 + Math.random() * 900000));
    state.nequiSecondsLeft = 60;
  }
  if (!state.nequiCode) nuevoCodigo();

  screenEl.innerHTML = `
  <div class="prompt-line"><span class="caret">&gt;</span><span>Clave dinámica de seguridad NEQUI</span></div>
  <div class="code-box" id="codeBox"></div>
  <div class="timer-row">
    <span id="secLabel" class="muted"></span>
    <div class="timer-bar"><div class="timer-fill" id="timerFill" style="width:100%"></div></div>
  </div>
  <div class="field-hint">Esta clave es solo visible en pantalla y se renueva automáticamente cada 60 segundos.</div>
`;

  controlsEl.innerHTML = `
  <button class="btn btn-ghost" id="backBtn">← Volver</button>
  <button class="btn btn-primary" id="nextBtn">Continuar</button>
`;

  function paintCode() {
    const codeBox = document.getElementById('codeBox');
    const secLabel = document.getElementById('secLabel');
    const timerFill = document.getElementById('timerFill');
    if (!codeBox || !secLabel || !timerFill) return false;
    codeBox.innerHTML = state.nequiCode.split('').map(d => `<div class="code-digit">${d}</div>`).join('');
    secLabel.textContent = `expira en ${state.nequiSecondsLeft}s`;
    timerFill.style.width = (state.nequiSecondsLeft / 60 * 100) + '%';
    return true;
  }
  paintCode();

  if (state.nequiTimer) clearInterval(state.nequiTimer);
  state.nequiTimer = setInterval(() => {
    state.nequiSecondsLeft--;
    if (state.nequiSecondsLeft <= 0) nuevoCodigo();
    if (!paintCode()) clearInterval(state.nequiTimer);
  }, 1000);

  document.getElementById('backBtn').addEventListener('click', () => {
    clearInterval(state.nequiTimer);
    state.nequiTimer = null;
    state.nequiCode = null;
    state.step = 'account-number';
    render();
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    clearInterval(state.nequiTimer);
    state.nequiTimer = null;
    state.step = 'amount';
    render();
  });
}

function renderAuthPin() {
  screenEl.innerHTML = `
  <div class="prompt-line"><span class="caret">&gt;</span><span>Ingrese su clave de 4 dígitos</span></div>
  <input class="field-input pin" id="pinInput" type="password" inputmode="numeric" maxlength="4" placeholder="••••">
  <div class="field-hint">La clave no se muestra en pantalla.</div>
`;
  controlsEl.innerHTML = `
  <button class="btn btn-ghost" id="backBtn">← Volver</button>
  <button class="btn btn-primary" id="nextBtn" disabled>Confirmar</button>
`;

  const input = document.getElementById('pinInput');
  const nextBtn = document.getElementById('nextBtn');

  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 4);
    nextBtn.disabled = input.value.length !== 4;
  });

  document.getElementById('backBtn').addEventListener('click', () => {
    state.step = 'account-number';
    render();
  });

  nextBtn.addEventListener('click', () => {
    state.pin = input.value;
    state.step = 'amount';
    render();
  });

  input.focus();
}

function renderAmount() {
  let monto = null;

  const opciones = MONTOS_FIJOS.map(m => ({ title: formatCOP(m), value: m }));
  opciones.push({ title: 'Otro valor', value: 'otro' });
  opcionesActuales = opciones;
  menuActualId = 'amountMenu';

  const menu = renderMenu('amountMenu', opciones, (valor, el) => {
    document.querySelectorAll('#amountMenu .screen-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');

    const otroWrap = document.getElementById('otroWrap');
    const otroInput = document.getElementById('otroInput');
    const retirarBtn = document.getElementById('retirarBtn');

    if (valor === 'otro') {
      monto = null;
      otroWrap.style.display = 'block';
      retirarBtn.disabled = true;
      otroInput.value = '';
      otroInput.focus();
    } else {
      monto = valor;
      otroWrap.style.display = 'none';
      retirarBtn.disabled = false;
    }
    document.getElementById('amountFeedback').innerHTML = '';
  });

  screenEl.innerHTML = `
  <div class="prompt-line"><span class="caret">&gt;</span><span>Seleccione el valor a retirar:</span></div>
  <div class="field-hint">No se dispensan billetes de $5.000. Solo múltiplos de $10.000.</div>
  ${menu.html}
  <div id="otroWrap" style="display:none; margin-top:8px;">
    <div class="prompt-line"><span class="caret">$</span>
      <input class="field-input" id="otroInput" type="text" inputmode="numeric" placeholder="Ingrese un valor">
    </div>
  </div>
  <div id="amountFeedback"></div>
`;

  controlsEl.innerHTML = `
  <button class="btn btn-ghost" id="backBtn">← Volver</button>
  <button class="btn btn-primary" id="retirarBtn" disabled>Retirar</button>
`;

  menu.wire();

  const otroInput = document.getElementById('otroInput');
  const retirarBtn = document.getElementById('retirarBtn');
  const feedback = document.getElementById('amountFeedback');

  otroInput.addEventListener('input', () => {
    otroInput.value = otroInput.value.replace(/[^0-9]/g, '');
    monto = otroInput.value ? parseInt(otroInput.value, 10) : null;
    retirarBtn.disabled = !monto;
  });

  document.getElementById('backBtn').addEventListener('click', () => {
    state.step = 'auth';
    render();
  });

  retirarBtn.addEventListener('click', () => {
    if (!monto || monto <= 0) {
      feedback.innerHTML = `<div class="prompt-line"><span class="caret error">!</span><span class="error">Seleccione o ingrese un valor</span></div>`;
      return;
    }
    if (!esMontoValido(monto)) {
      goError(`No es posible entregar ${formatCOP(monto)} con las denominaciones disponibles ($10.000, $20.000, $50.000, $100.000).`);
      return;
    }
    state.monto = monto;
    state.step = 'result';
    render();
  });
}

function construirReporteHTML(cantidad) {
  const rows = DENOMINACIONES.map((d, i) => `
    <div class="breakdown-row"><span>Billetes de ${d.nombre}</span><span class="dots"></span><span>${cantidad[i]}</span></div>
  `).join('');

  const NOMBRE_TIPO = {
    nequi: 'NEQUI',
    mano: 'Ahorro a la mano',
    ahorros: 'Cuenta de ahorros'
  }[state.accountType];

  const numeroReportado = state.accountType === 'nequi'
    ? '0' + state.accountNumber
    : state.accountNumber;

  const N = 1000;
  const valorMenor = state.monto - 10000;
  const proyeccion = valorMenor * N;

  return `
    <div class="prompt-line"><span class="caret">&gt;</span><span>Tipo de cuenta: ${NOMBRE_TIPO}</span></div>
    <div class="prompt-line"><span class="caret muted">·</span><span class="muted">Número de cuenta: ${numeroReportado}</span></div>
    <div class="breakdown">
      <div class="prompt-line"><span class="caret">&gt;</span><span>Desglose para ${formatCOP(state.monto)}:</span></div>
      ${rows}
      <div class="total-row"><span>Total entregado</span><span>${formatCOP(state.monto)}</span></div>
    </div>
    <div class="predict-box">
      <div>Predicción:</div>
      <div>Valor de referencia: <b>${formatCOP(valorMenor)}</b></div>
      <div>Proyección estimada: <b>${formatCOP(proyeccion)}</b></div>
    </div>
  `;
}

function pintarBandejaBilletes(cantidad) {
  billsEl.innerHTML = '';
  const totalBills = cantidad.reduce((a, b) => a + b, 0);
  if (totalBills === 0) {
    billsEl.innerHTML = '<div class="empty-note">— no hay billetes para este monto —</div>';
    return;
  }

  const MAX_VISUAL = 60;
  let shown = 0, delay = 0;
  for (let i = 0; i < cantidad.length && shown < MAX_VISUAL; i++) {
    for (let k = 0; k < cantidad[i] && shown < MAX_VISUAL; k++) {
      const bill = document.createElement('div');
      bill.className = `bill ${DENOMINACIONES[i].clase}`;
      bill.style.animationDelay = `${delay}ms`;
      bill.textContent = DENOMINACIONES[i].nombre;
      billsEl.appendChild(bill);
      shown++;
      delay += 16;
    }
  }

  if (totalBills > MAX_VISUAL) {
    const note = document.createElement('div');
    note.className = 'empty-note';
    note.textContent = `+ ${totalBills - MAX_VISUAL} billetes más`;
    billsEl.appendChild(note);
  }
}

function renderResult() {
  menuActualId = null;
  opcionesActuales = [];

  const cantidad = calcularRetiroCarreo(state.monto);

  screenEl.innerHTML = construirReporteHTML(cantidad);

  controlsEl.innerHTML = `<button class="btn btn-primary" id="nuevoBtn">Nuevo retiro</button>`;
  document.getElementById('nuevoBtn').addEventListener('click', resetAll);

  pintarBandejaBilletes(cantidad);
}

function renderErrorScreen() {
  menuActualId = null;
  opcionesActuales = [];

  screenEl.innerHTML = `
  <div class="prompt-line"><span class="caret error">!</span><span class="error">Operación no disponible</span></div>
  <div class="prompt-line"><span class="muted">${state.errorMsg}</span></div>
  <div class="prompt-line" style="margin-top:10px;"><span class="caret">&gt;</span><span>El proceso debe iniciarse nuevamente.</span></div>
`;
  controlsEl.innerHTML = `<button class="btn btn-primary" id="restartBtn">Iniciar de nuevo</button>`;
  document.getElementById('restartBtn').addEventListener('click', resetAll);
  billsEl.innerHTML = '<div class="empty-note">— sin retiro aún —</div>';
}

document.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (!menuActualId || opcionesActuales.length === 0) return;

  const idx = parseInt(e.key, 10) - 1;
  if (idx < 0 || idx >= opcionesActuales.length) return;

  const el = document.querySelector(`#${menuActualId} [data-idx="${idx}"]`);
  if (el) el.click();
});

render();
