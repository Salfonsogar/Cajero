export const DENOMINACIONES = [
  { valor: 10000, nombre: '$10.000', clase: 'd10000' },
  { valor: 20000, nombre: '$20.000', clase: 'd20000' },
  { valor: 50000, nombre: '$50.000', clase: 'd50000' },
  { valor: 100000, nombre: '$100.000', clase: 'd100000' }
];

export const VALORES = DENOMINACIONES.map(d => d.valor);

export const MONTOS_FIJOS = [20000, 50000, 100000, 200000, 500000];

export const LARGO_CUENTA = { nequi: 10, mano: 11, ahorros: 11 };

export const VALIDACIONES_CUENTA = {
  nequi: /^[0-9]{10}$/,
  mano: /^[01]3[0-9]{9}$/,
  ahorros: /^[0-9]{11}$/
};

export function calcularRetiroCarreo(monto) {
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

export function esMontoValido(monto) {
  return Number.isInteger(monto) && monto > 0 && monto % VALORES[0] === 0;
}

export function formatCOP(n) {
  return '$' + n.toLocaleString('es-CO');
}

export function validarCuenta(tipo, num) {
  const regex = VALIDACIONES_CUENTA[tipo];
  return regex ? regex.test(num) : false;
}
