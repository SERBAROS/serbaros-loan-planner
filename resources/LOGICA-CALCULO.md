## Lógica de cálculo - (replicada del Excel)

- **Tasa mensual** = `(1 + TEA)^(1/12) - 1`
- **Cuota**: en el Excel original, "Valor de la cuota" (D8) es un **valor
  tecleado a mano**, no una fórmula. La app hace lo mismo: calcula un PMT
  teórico como sugerencia (`monto·r / (1-(1+r)^-n)`), pero permite ingresar
  la cuota real que dio el banco. Por eso el número de cuotas *reales* hasta
  saldar el crédito puede ser distinto al número de cuotas *solicitado*
  (en el archivo original, con cuota de 1.554.384 el crédito se termina de
  pagar en la cuota 66, no en la 60 — la app reproduce exactamente ese
  comportamiento).
- **Interés/capital por cuota**: interés = saldo inicial × tasa mensual;
  capital = cuota − interés.
- **Fechas**: cada cuota cae 30 días después de la anterior (igual que
  `=I(anterior)+30` en el Excel), a partir del "Mes Inicio Amort.".
- **Saldos anuales**: suma acumulada de intereses cada 12 cuotas (columna J
  del Excel).

Los números fueron verificados contra el archivo original y coinciden
exactamente (fila 1, fila 12, fila 24 y los saldos anuales de cada año).

