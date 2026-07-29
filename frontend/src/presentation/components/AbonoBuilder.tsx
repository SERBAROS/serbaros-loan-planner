import { useState } from 'react';
import { AbonoDefinition, AbonoGrupoRecurrenteItem, UnidadPeriodo } from '../../domain/entities/loan';
import { money } from '../format';
import CurrencyInput from './CurrencyInput';

interface AbonoBuilderProps {
  value: AbonoDefinition[];
  onChange: (v: AbonoDefinition[]) => void;
  currencyCode: string;
  title: string;
  helpText?: string;
}

type TipoAbono = 'PUNTUAL' | 'RECURRENTE' | 'GRUPO_RECURRENTE';

interface PuntualDraft {
  monto: string;
  modo: 'cuota' | 'fecha';
  numeroCuota: string;
  fecha: string;
}

interface RecurrenteDraft {
  monto: string;
  cada: string;
  unidad: UnidadPeriodo;
  fechaInicio: string;
  fechaFin: string;
}

interface GrupoItemDraft {
  key: number;
  monto: string;
  cada: string;
  unidad: UnidadPeriodo;
  fechaInicio: string;
  fechaFin: string;
}

interface GrupoDraft {
  nombre: string;
  items: GrupoItemDraft[];
}

let idSeq = 0;
function newId(prefix: string) {
  return `${prefix}-${++idSeq}-${Date.now()}`;
}

const emptyPuntual: PuntualDraft = { monto: '', modo: 'cuota', numeroCuota: '', fecha: '' };
const emptyRecurrente: RecurrenteDraft = { monto: '', cada: '1', unidad: 'MESES', fechaInicio: '', fechaFin: '' };
function newGrupoItem(): GrupoItemDraft {
  return { key: ++idSeq, monto: '', cada: '1', unidad: 'MESES', fechaInicio: '', fechaFin: '' };
}
const emptyGrupo = (): GrupoDraft => ({ nombre: '', items: [newGrupoItem()] });

function resumenAbono(a: AbonoDefinition, currencyCode: string): string {
  if (a.tipo === 'PUNTUAL') {
    const cuando = a.numeroCuota != null ? `en la cuota ${a.numeroCuota}` : `el ${a.fecha}`;
    return `Puntual — ${money(a.monto, currencyCode)} ${cuando}`;
  }
  if (a.tipo === 'RECURRENTE') {
    const unidadTxt = a.unidad === 'ANIOS' ? (a.cada === 1 ? 'año' : 'años') : a.cada === 1 ? 'mes' : 'meses';
    const hasta = a.fechaFin ? `, hasta ${a.fechaFin}` : '';
    return `Recurrente — ${money(a.monto, currencyCode)} cada ${a.cada} ${unidadTxt}, desde ${a.fechaInicio}${hasta}`;
  }
  const detalles = a.items
    .map((i) => `${money(i.monto, currencyCode)} cada ${i.cada} ${i.unidad === 'ANIOS' ? 'años' : 'meses'}`)
    .join(' + ');
  return `${a.nombre} (grupo) — ${detalles}`;
}

export default function AbonoBuilder({ value, onChange, currencyCode, title, helpText }: AbonoBuilderProps) {
  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState<TipoAbono>('PUNTUAL');
  const [puntual, setPuntual] = useState<PuntualDraft>(emptyPuntual);
  const [recurrente, setRecurrente] = useState<RecurrenteDraft>(emptyRecurrente);
  const [grupo, setGrupo] = useState<GrupoDraft>(emptyGrupo());
  const [error, setError] = useState('');

  function resetDrafts() {
    setPuntual(emptyPuntual);
    setRecurrente(emptyRecurrente);
    setGrupo(emptyGrupo());
    setError('');
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addGrupoItem() {
    setGrupo((g) => ({ ...g, items: [...g.items, newGrupoItem()] }));
  }

  function removeGrupoItem(key: number) {
    setGrupo((g) => ({ ...g, items: g.items.filter((i) => i.key !== key) }));
  }

  function updateGrupoItem(key: number, patch: Partial<GrupoItemDraft>) {
    setGrupo((g) => ({ ...g, items: g.items.map((i) => (i.key === key ? { ...i, ...patch } : i)) }));
  }

  function handleAdd() {
    setError('');
    if (tipo === 'PUNTUAL') {
      if (!(Number(puntual.monto) > 0)) return setError('El monto debe ser mayor a 0.');
      if (puntual.modo === 'cuota' && !(Number(puntual.numeroCuota) > 0)) return setError('Indica el número de cuota.');
      if (puntual.modo === 'fecha' && !puntual.fecha) return setError('Indica la fecha.');
      const nuevo: AbonoDefinition = {
        id: newId('puntual'),
        tipo: 'PUNTUAL',
        monto: Number(puntual.monto),
        ...(puntual.modo === 'cuota' ? { numeroCuota: Number(puntual.numeroCuota) } : { fecha: puntual.fecha }),
      };
      onChange([...value, nuevo]);
    } else if (tipo === 'RECURRENTE') {
      if (!(Number(recurrente.monto) > 0)) return setError('El monto debe ser mayor a 0.');
      if (!(Number(recurrente.cada) > 0)) return setError('La periodicidad debe ser mayor a 0.');
      if (!recurrente.fechaInicio) return setError('Indica la fecha de inicio.');
      const nuevo: AbonoDefinition = {
        id: newId('recurrente'),
        tipo: 'RECURRENTE',
        monto: Number(recurrente.monto),
        cada: Number(recurrente.cada),
        unidad: recurrente.unidad,
        fechaInicio: recurrente.fechaInicio,
        fechaFin: recurrente.fechaFin || null,
      };
      onChange([...value, nuevo]);
    } else {
      if (!grupo.nombre.trim()) return setError('Ponle un nombre al grupo.');
      const items: AbonoGrupoRecurrenteItem[] = [];
      for (const item of grupo.items) {
        if (!(Number(item.monto) > 0) || !(Number(item.cada) > 0) || !item.fechaInicio) {
          return setError('Cada abono del grupo necesita monto, periodicidad y fecha de inicio.');
        }
        items.push({
          monto: Number(item.monto),
          cada: Number(item.cada),
          unidad: item.unidad,
          fechaInicio: item.fechaInicio,
          fechaFin: item.fechaFin || null,
        });
      }
      const nuevo: AbonoDefinition = { id: newId('grupo'), tipo: 'GRUPO_RECURRENTE', nombre: grupo.nombre.trim(), items };
      onChange([...value, nuevo]);
    }
    resetDrafts();
    setShowForm(false);
  }

  return (
    <div>
      <h2 className="form-section-title">{title}</h2>
      {helpText && (
        <p className="field-hint" style={{ marginBottom: 12 }}>
          {helpText}
        </p>
      )}

      {value.length > 0 && (
        <div className="table-wrap" style={{ marginBottom: 16 }}>
          <table className="amort-table">
            <tbody>
              {value.map((a, i) => (
                <tr key={a.id ?? i}>
                  <td style={{ whiteSpace: 'normal' }}>{resumenAbono(a, currencyCode)}</td>
                  <td style={{ width: 1 }}>
                    <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => remove(i)}>
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!showForm && (
        <button type="button" className="btn" style={{ marginBottom: 24 }} onClick={() => setShowForm(true)}>
          + Agregar abono
        </button>
      )}

      {showForm && (
        <div className="simulate-preview" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button type="button" className={tipo === 'PUNTUAL' ? 'btn btn-primary' : 'btn'} onClick={() => setTipo('PUNTUAL')} style={{ flex: 1 }}>
              Puntual
            </button>
            <button
              type="button"
              className={tipo === 'RECURRENTE' ? 'btn btn-primary' : 'btn'}
              onClick={() => setTipo('RECURRENTE')}
              style={{ flex: 1 }}
            >
              Recurrente
            </button>
            <button
              type="button"
              className={tipo === 'GRUPO_RECURRENTE' ? 'btn btn-primary' : 'btn'}
              onClick={() => setTipo('GRUPO_RECURRENTE')}
              style={{ flex: 1 }}
            >
              Grupo recurrente
            </button>
          </div>

          {error && <div className="error-box">{error}</div>}

          {tipo === 'PUNTUAL' && (
            <>
              <div className="field">
                <label>Monto</label>
                <CurrencyInput value={puntual.monto} onChange={(v) => setPuntual((p) => ({ ...p, monto: v }))} currencyCode={currencyCode} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>¿Cuándo?</label>
                  <select value={puntual.modo} onChange={(e) => setPuntual((p) => ({ ...p, modo: e.target.value as 'cuota' | 'fecha' }))}>
                    <option value="cuota">Por número de cuota</option>
                    <option value="fecha">Por fecha</option>
                  </select>
                </div>
                <div className="field">
                  {puntual.modo === 'cuota' ? (
                    <>
                      <label>Número de cuota</label>
                      <input
                        type="number"
                        step="1"
                        min={1}
                        value={puntual.numeroCuota}
                        onChange={(e) => setPuntual((p) => ({ ...p, numeroCuota: e.target.value }))}
                      />
                    </>
                  ) : (
                    <>
                      <label>Fecha</label>
                      <input type="date" value={puntual.fecha} onChange={(e) => setPuntual((p) => ({ ...p, fecha: e.target.value }))} />
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {tipo === 'RECURRENTE' && (
            <>
              <div className="field">
                <label>Monto (cada vez)</label>
                <CurrencyInput value={recurrente.monto} onChange={(v) => setRecurrente((r) => ({ ...r, monto: v }))} currencyCode={currencyCode} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Cada</label>
                  <input type="number" step="1" min={1} value={recurrente.cada} onChange={(e) => setRecurrente((r) => ({ ...r, cada: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Unidad</label>
                  <select value={recurrente.unidad} onChange={(e) => setRecurrente((r) => ({ ...r, unidad: e.target.value as UnidadPeriodo }))}>
                    <option value="MESES">Meses</option>
                    <option value="ANIOS">Años</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Fecha de inicio</label>
                  <input type="date" value={recurrente.fechaInicio} onChange={(e) => setRecurrente((r) => ({ ...r, fechaInicio: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Fecha límite (opcional)</label>
                  <input type="date" value={recurrente.fechaFin} onChange={(e) => setRecurrente((r) => ({ ...r, fechaFin: e.target.value }))} />
                  <span className="field-hint">Vacío = se repite hasta el final del préstamo.</span>
                </div>
              </div>
            </>
          )}

          {tipo === 'GRUPO_RECURRENTE' && (
            <>
              <div className="field">
                <label>Nombre del grupo</label>
                <input
                  value={grupo.nombre}
                  onChange={(e) => setGrupo((g) => ({ ...g, nombre: e.target.value }))}
                  placeholder="Ej. Prestaciones sociales"
                />
              </div>
              {grupo.items.map((item, idx) => (
                <div key={item.key} style={{ border: '1px solid var(--border-soft)', borderRadius: 4, padding: 12, marginBottom: 10 }}>
                  <div className="field-hint" style={{ marginBottom: 8 }}>
                    Abono {idx + 1} del grupo
                  </div>
                  <div className="field">
                    <label>Monto (cada vez)</label>
                    <CurrencyInput value={item.monto} onChange={(v) => updateGrupoItem(item.key, { monto: v })} currencyCode={currencyCode} />
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>Cada</label>
                      <input type="number" step="1" min={1} value={item.cada} onChange={(e) => updateGrupoItem(item.key, { cada: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Unidad</label>
                      <select value={item.unidad} onChange={(e) => updateGrupoItem(item.key, { unidad: e.target.value as UnidadPeriodo })}>
                        <option value="MESES">Meses</option>
                        <option value="ANIOS">Años</option>
                      </select>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>Fecha de inicio</label>
                      <input type="date" value={item.fechaInicio} onChange={(e) => updateGrupoItem(item.key, { fechaInicio: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Fecha límite (opcional)</label>
                      <input type="date" value={item.fechaFin} onChange={(e) => updateGrupoItem(item.key, { fechaFin: e.target.value })} />
                    </div>
                  </div>
                  {grupo.items.length > 1 && (
                    <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => removeGrupoItem(item.key)}>
                      Quitar este abono del grupo
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn" style={{ marginBottom: 16 }} onClick={addGrupoItem}>
                + Agregar otro abono al grupo
              </button>
            </>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-primary" onClick={handleAdd}>
              Agregar
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                resetDrafts();
                setShowForm(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
