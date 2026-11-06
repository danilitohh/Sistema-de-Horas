import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { clienteApi } from '../servicios/api';

type Section = 'admin-users' | 'admin-clients' | 'admin-roles' | 'admin-projects';
type Usuario = { id:number; nombre:string; correo:string; roles_idroles:number; rol:string };
type Cliente = { id:number; name:string };
type Rol = { idroles:number; nombre:string; users_count:number };
type Proyecto = { id:number; name:string; client_id:number; color:string; estimated_hours:number; client?:{name:string} };

const input = 'form-input';
const btn = 'inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#16A34A] disabled:opacity-50';

export function VistaGestionAdmin({ section }: { section: Section }) {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string,string>>({});

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (section === 'admin-users') setUsers((await clienteApi.get<{data:Usuario[]}>('/admin/users')).data);
      if (section === 'admin-clients') setClients((await clienteApi.get<{data:Cliente[]}>('/clients')).data);
      if (section === 'admin-roles') setRoles((await clienteApi.get<{data:Rol[]}>('/admin/roles')).data);
      if (section === 'admin-projects') {
        const [p,c] = await Promise.all([clienteApi.get<{data:Proyecto[]}>('/projects'), clienteApi.get<{data:Cliente[]}>('/clients')]);
        setProjects(p.data); setClients(c.data);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar los datos.'); }
    finally { setLoading(false); }
  }, [section]);
  useEffect(() => { void load(); }, [load]);

  const begin = (row?: Usuario | Cliente | Rol) => {
    setEditing(row ? ('id' in row ? row.id : row.idroles) : -1);
    if (section === 'admin-users') {
      const u = row as Usuario | undefined;
      setForm(u ? { nombre:u.nombre, correo:u.correo, roles_idroles:String(u.roles_idroles), contrasena:'' } : { nombre:'', correo:'', roles_idroles:'2', contrasena:'' });
    } else if (section === 'admin-clients') setForm(row ? { name:(row as Cliente).name } : { name:'' });
    else if (section === 'admin-projects') { const p=row as Proyecto|undefined; setForm(p?{name:p.name,client_id:String(p.client_id),color:p.color,estimated_hours:String(p.estimated_hours)}:{name:'',client_id:String(clients[0]?.id??''),color:'#22C55E',estimated_hours:'0'}); }
    else setForm({ nombre:(row as Rol | undefined)?.nombre ?? '' });
    setError(''); setNotice('');
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (editing === null) return;
    setBusy(true); setError('');
    try {
      if (section === 'admin-users') {
        const body: Record<string,string|number> = { ...form, roles_idroles:Number(form.roles_idroles) };
        if (editing === -1) await clienteApi.post('/admin/users', body);
        else { if (!body.contrasena) delete body.contrasena; await clienteApi.patch(`/admin/users/${editing}`, body); }
      } else if (section === 'admin-clients') {
        if (editing === -1) await clienteApi.post('/clients', form);
        else await clienteApi.patch(`/clients/${editing}`, form);
      } else if (section === 'admin-projects') {
        const body={...form,client_id:Number(form.client_id),estimated_hours:Number(form.estimated_hours)};
        if(editing===-1) await clienteApi.post('/projects',body); else await clienteApi.patch(`/projects/${editing}`,body);
      } else if (editing !== -1) await clienteApi.patch(`/admin/roles/${editing}`, form);
      setEditing(null); setNotice('Cambios guardados.'); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar.'); }
    finally { setBusy(false); }
  };

  const remove = async (id:number) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    setBusy(true); setError('');
    try { await clienteApi.delete(section === 'admin-users' ? `/admin/users/${id}` : section==='admin-projects'?`/projects/${id}`:`/clients/${id}`); setNotice('Registro eliminado.'); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo eliminar.'); }
    finally { setBusy(false); }
  };

  const titles = { 'admin-users':'Gestión de Usuarios', 'admin-clients':'Gestión de Clientes', 'admin-roles':'Gestión de Roles', 'admin-projects':'Gestión de Proyectos' };
  const rows = section === 'admin-users' ? users : section === 'admin-clients' ? clients : section==='admin-projects'?projects:roles;
  return <section className="space-y-5 animate-fade-in">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-800">{titles[section]}</h2><p className="mt-1 text-sm text-slate-500">Administra la información del sistema.</p></div><div className="flex gap-2"><button onClick={() => void load()} className="rounded-xl border border-slate-200 p-2.5 text-slate-600" title="Actualizar"><RefreshCw className="h-4 w-4"/></button>{section !== 'admin-roles' && <button onClick={() => begin()} className={btn}><Plus className="h-4 w-4"/>Nuevo</button>}</div></header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}{notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
    {editing !== null && <form onSubmit={save} className="app-card grid gap-3 p-5 sm:grid-cols-2">
      {section === 'admin-users' && <><label className="text-sm font-medium">Nombre<input required className={input} value={form.nombre??''} onChange={e=>setForm({...form,nombre:e.target.value})}/></label><label className="text-sm font-medium">Correo<input required type="email" className={input} value={form.correo??''} onChange={e=>setForm({...form,correo:e.target.value})}/></label><label className="text-sm font-medium">{editing===-1?'Contraseña':'Nueva contraseña'}<input type="password" minLength={8} required={editing===-1} className={input} value={form.contrasena??''} onChange={e=>setForm({...form,contrasena:e.target.value})}/></label><label className="text-sm font-medium">Rol<select className={input} value={form.roles_idroles} onChange={e=>setForm({...form,roles_idroles:e.target.value})}><option value="1">Administrador</option><option value="2">Usuario</option></select></label></>}
      {section === 'admin-clients' && <label className="text-sm font-medium">Nombre del cliente<input required className={input} value={form.name??''} onChange={e=>setForm({...form,name:e.target.value})}/></label>}
      {section === 'admin-projects' && <><label className="text-sm font-medium">Proyecto<input required className={input} value={form.name??''} onChange={e=>setForm({...form,name:e.target.value})}/></label><label className="text-sm font-medium">Cliente<select required className={input} value={form.client_id??''} onChange={e=>setForm({...form,client_id:e.target.value})}>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="text-sm font-medium">Color<input type="color" className={input} value={form.color??'#22C55E'} onChange={e=>setForm({...form,color:e.target.value})}/></label><label className="text-sm font-medium">Horas estimadas<input required type="number" min="0" step="0.25" className={input} value={form.estimated_hours??'0'} onChange={e=>setForm({...form,estimated_hours:e.target.value})}/></label></>}
      {section === 'admin-roles' && <label className="text-sm font-medium">Nombre del rol<input required maxLength={45} className={input} value={form.nombre??''} onChange={e=>setForm({...form,nombre:e.target.value})}/></label>}
      <div className="flex items-end gap-2"><button disabled={busy} className={btn}><Save className="h-4 w-4"/>Guardar</button><button type="button" onClick={()=>setEditing(null)} className="rounded-xl border border-slate-200 p-2.5"><X className="h-4 w-4"/></button></div>
    </form>}
    <div className="app-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{(section==='admin-users'?['Nombre','Correo','Rol','Acciones']:section==='admin-clients'?['Cliente','Acciones']:section==='admin-projects'?['Proyecto','Cliente','Horas estimadas','Acciones']:['Rol','Usuarios','Acciones']).map(h=><th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">
      {rows.map((r:any)=><tr key={r.id??r.idroles} className="hover:bg-slate-50/70">{section==='admin-users'?<><td className="px-5 py-3 font-semibold">{r.nombre}</td><td className="px-5 py-3">{r.correo}</td><td className="px-5 py-3">{r.rol}</td></>:section==='admin-clients'?<td className="px-5 py-3 font-semibold">{r.name}</td>:section==='admin-projects'?<><td className="px-5 py-3 font-semibold">{r.name}</td><td className="px-5 py-3">{r.client?.name}</td><td className="px-5 py-3">{r.estimated_hours} h</td></>:<><td className="px-5 py-3 font-semibold">{r.nombre}</td><td className="px-5 py-3">{r.users_count}</td></>}<td className="px-5 py-3"><div className="flex gap-2"><button onClick={()=>begin(r)} className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700" aria-label="Editar"><Pencil className="h-4 w-4"/></button>{section!=='admin-roles'&&<button onClick={()=>void remove(r.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Eliminar"><Trash2 className="h-4 w-4"/></button>}</div></td></tr>)}
      </tbody></table>{loading&&<p className="p-6 text-sm text-slate-500">Cargando…</p>}{!loading&&rows.length===0&&<p className="p-6 text-sm text-slate-500">Aún no hay registros.</p>}</div></div>
  </section>;
}
