import { useEffect, useState } from 'react';
import { Activity, BriefcaseBusiness, Clock3, Users } from 'lucide-react';
import { clienteApi } from '../servicios/api';
import { usarHoras } from '../contextos/ContextoHoras';

type Analytics = { users:number; projects:number; clients:number; time_entries:number; minutes_total:number; hours_by_day:{fecha:string;minutos:number}[]; hours_by_project:{id:number;nombre:string;minutos:number}[] };

export const VistaDashboard = () => {
  const { usuario } = usarHoras();
  const [stats,setStats]=useState<Analytics|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{clienteApi.get<Analytics>('/admin/analytics').then(setStats).catch(e=>setError(e instanceof Error?e.message:'No se pudieron cargar las analíticas.'));},[]);
  const cards=[
    {label:'Usuarios',value:stats?.users??'—',icon:Users,color:'text-blue-600 bg-blue-50'},
    {label:'Proyectos',value:stats?.projects??'—',icon:BriefcaseBusiness,color:'text-violet-600 bg-violet-50'},
    {label:'Clientes',value:stats?.clients??'—',icon:Activity,color:'text-amber-600 bg-amber-50'},
    {label:'Horas imputadas',value:stats?`${Math.floor(stats.minutes_total/60)} h ${stats.minutes_total%60} m`:'—',icon:Clock3,color:'text-emerald-600 bg-emerald-50'},
  ];
  const days=stats?.hours_by_day??[]; const maxDay=Math.max(1,...days.map(d=>Number(d.minutos)));
  const projects=stats?.hours_by_project??[]; const maxProject=Math.max(1,...projects.map(p=>Number(p.minutos)));
  return <div className="space-y-6 animate-fade-in">
    <header><h2 className="text-xl font-extrabold text-slate-800">¡Hola, {usuario.nombre.split(' ')[0]}!</h2><p className="mt-1 text-sm text-slate-500">Resumen basado en la actividad registrada.</p></header>
    {error&&<div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(c=>{const Icon=c.icon;return <article key={c.label} className="app-card p-5"><div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}><Icon className="h-5 w-5"/></div><div className="text-2xl font-extrabold text-slate-800">{c.value}</div><div className="mt-1 text-xs font-medium text-slate-500">{c.label}</div></article>;})}</div>
    <div className="grid gap-5 xl:grid-cols-5">
      <article className="app-card overflow-hidden xl:col-span-3"><header className="app-card-header"><div><h3 className="text-sm font-bold text-slate-800">Horas por día</h3><p className="text-xs text-slate-500">Registros existentes en la base</p></div></header><div className="flex h-64 items-end gap-2 overflow-x-auto px-5 pb-5 pt-8">{days.map(d=><div key={d.fecha} className="flex h-full min-w-7 flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] text-slate-500">{(Number(d.minutos)/60).toFixed(1)}h</span><div title={`${d.fecha}: ${d.minutos} min`} className="w-full rounded-t-md bg-[#22C55E] transition-all" style={{height:`${Math.max(3,Number(d.minutos)/maxDay*75)}%`}}/><span className="text-[9px] text-slate-400">{d.fecha.slice(5)}</span></div>)}{!days.length&&!error&&<p className="m-auto text-sm text-slate-400">Sin horas registradas aún.</p>}</div></article>
      <article className="app-card overflow-hidden xl:col-span-2"><header className="app-card-header"><div><h3 className="text-sm font-bold text-slate-800">Horas por proyecto</h3><p className="text-xs text-slate-500">Proyectos con más tiempo registrado</p></div></header><div className="space-y-4 p-5">{projects.map(p=><div key={p.id}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate font-semibold text-slate-700">{p.nombre}</span><span className="shrink-0 text-slate-500">{(Number(p.minutos)/60).toFixed(1)} h</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#22C55E]" style={{width:`${Number(p.minutos)/maxProject*100}%`}}/></div></div>)}{!projects.length&&!error&&<p className="text-sm text-slate-400">Aún no hay datos por proyecto.</p>}</div></article>
    </div>
    {stats&&<p className="text-right text-xs text-slate-400">{stats.time_entries} registros · {stats.clients} clientes</p>}
  </div>;
};
