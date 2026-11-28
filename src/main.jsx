import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { Plus, Search, Pencil, Trash2, Download, RefreshCw, X, Settings2, ChevronUp, ChevronDown, Columns3, Save, ArrowUpDown } from 'lucide-react'
import './styles.css'
import imported from './imported-data.json'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null
const LOCAL_KEY = 'exam-transport-dashboard-v3'
const initialSettings = {
  dashboardTitle: 'ระบบติดตามการขนส่งข้อสอบ',
  dashboardSubtitle: 'กองบัญชาการศึกษา · รายละเอียดรถขนส่งข้อสอบ',
  outboundTitle: imported.outbound.title,
  returnTitle: '',
  sourceNote: 'ข้อมูลจากตารางรายละเอียดรถขนส่งข้อสอบ',
  savedLabel: 'ข้อมูล ณ',
  updatedLabel: 'ปรับปรุงล่าสุด'
}
const clone = v => JSON.parse(JSON.stringify(v))
const initialState = () => ({ sheets: { outbound: clone(imported.outbound), return: { title: '', subtitle: '', headers: [], rows: [] } }, settings: clone(initialSettings), savedAt: new Date().toISOString() })
const fmtTime = value => new Intl.DateTimeFormat('th-TH',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Bangkok'}).format(new Date(value)).replace(':','.')+' น.'
const fmtDate = value => new Intl.DateTimeFormat('th-TH',{day:'numeric',month:'short',year:'2-digit',timeZone:'Asia/Bangkok'}).format(new Date(value))
function App(){
 const [state,setState] = useState(()=>{try{return JSON.parse(localStorage.getItem(LOCAL_KEY))||initialState()}catch{return initialState()}})
 const [tab,setTab] = useState('outbound')
 const [query,setQuery] = useState('')
 const [modal,setModal] = useState(false)
 const [settingsOpen,setSettingsOpen] = useState(false)
 const [headersOpen,setHeadersOpen] = useState(false)
 const [editing,setEditing] = useState(null)
 const [form,setForm] = useState({})
 const [settingsForm,setSettingsForm] = useState(state.settings)
 const [headersForm,setHeadersForm] = useState([])
 const [busy,setBusy] = useState(false)
 const [message,setMessage] = useState('')
 const [remote,setRemote] = useState(false)
 const sheet = state.sheets[tab]
 const rows = sheet.rows
 const visible = useMemo(()=>rows.filter(r=>JSON.stringify(r.data).toLowerCase().includes(query.toLowerCase())),[rows,query])
 useEffect(()=>{localStorage.setItem(LOCAL_KEY,JSON.stringify(state))},[state])
 useEffect(()=>{
  if(!supabase)return
  let cancelled=false
  ;(async()=>{
   setBusy(true)
   const [r,s]=await Promise.all([
    supabase.from('transport_dashboard_rows').select('*').order('sheet_key').order('row_order'),
    supabase.from('transport_dashboard_settings').select('*').eq('id',1).maybeSingle()
   ])
   if(cancelled){return}
   if(r.error||s.error){setMessage('Supabase ยังไม่ได้ตั้งค่าตารางใหม่ กรุณารันไฟล์ supabase.sql เวอร์ชันนี้: '+(r.error?.message||s.error?.message));setBusy(false);return}
   if(r.data?.length){const next=initialState();{const key='outbound';const loaded=r.data.filter(x=>x.sheet_key===key).map(x=>({id:x.id,order:x.row_order,data:x.row_data||{}}));if(loaded.length)next.sheets[key].rows=loaded.sort((a,b)=>a.order-b.order)}if(s.data?.settings)next.settings={...next.settings,...s.data.settings};if(s.data?.saved_at)next.savedAt=s.data.saved_at;setState(next);setRemote(true)}
   else {const seed=[];for(const key of ['outbound'])for(const row of state.sheets[key].rows)seed.push({id:row.id,sheet_key:key,row_order:row.order,row_data:row.data,updated_at:state.savedAt});const {error}=await supabase.from('transport_dashboard_rows').upsert(seed);if(error)setMessage('โหลดข้อมูลตั้งต้นไม่สำเร็จ: '+error.message);else {await supabase.from('transport_dashboard_settings').upsert({id:1,settings:state.settings,saved_at:state.savedAt});setRemote(true)}}
   setBusy(false)
  })()
  return()=>{cancelled=true}
 // initialize remote once; seeded state is only used if database is empty
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[])
 const saveState = async next => {
  const savedAt=new Date().toISOString();next={...next,savedAt};setBusy(true);setMessage('')
  if(supabase){
   const activeRows=next.sheets[tab].rows
   const payload=activeRows.map((r,i)=>({id:r.id,sheet_key:tab,row_order:i+1,row_data:r.data,updated_at:savedAt}))
   const {error}=await supabase.from('transport_dashboard_rows').upsert(payload)
   if(error){setMessage('บันทึกไม่สำเร็จ: '+error.message);setBusy(false);return}
   const {error:settingsError}=await supabase.from('transport_dashboard_settings').upsert({id:1,settings:next.settings,saved_at:savedAt})
   if(settingsError){setMessage('บันทึกข้อมูลแล้ว แต่บันทึกหัว Dashboard ไม่สำเร็จ: '+settingsError.message);setBusy(false);return}
   setRemote(true)
  }
  setState(next);setBusy(false);setMessage('บันทึกข้อมูลเรียบร้อย')
 }
 const openAdd=()=>{setEditing(null);setForm(Object.fromEntries(sheet.headers.map(h=>[h,''])));setModal(true)}
 const openEdit=row=>{setEditing(row.id);setForm({...row.data});setModal(true)}
 const saveRow=async e=>{e.preventDefault();const next=clone(state);const list=next.sheets[tab].rows;if(editing){const idx=list.findIndex(r=>r.id===editing);if(idx>=0)list[idx].data=form}else list.push({id:crypto.randomUUID(),order:list.length+1,data:form});next.sheets[tab].rows=list.map((r,i)=>({...r,order:i+1}));setModal(false);await saveState(next)}
 const deleteRow=async row=>{if(!confirm('ยืนยันลบรายการนี้หรือไม่?'))return;const next=clone(state);next.sheets[tab].rows=next.sheets[tab].rows.filter(r=>r.id!==row.id).map((r,i)=>({...r,order:i+1}));if(supabase){const {error}=await supabase.from('transport_dashboard_rows').delete().eq('id',row.id);if(error){setMessage('ลบไม่สำเร็จ: '+error.message);return}}await saveState(next)}
 const moveRow=async (row,dir)=>{const next=clone(state),list=next.sheets[tab].rows,idx=list.findIndex(r=>r.id===row.id),to=idx+dir;if(to<0||to>=list.length)return;[list[idx],list[to]]=[list[to],list[idx]];list.forEach((r,i)=>r.order=i+1);await saveState(next)}
 const openHeaders=()=>{setHeadersForm([...sheet.headers]);setHeadersOpen(true)}
 const saveHeaders=async()=>{const next=clone(state);const old=next.sheets[tab].headers;const newHeaders=headersForm.map((h,i)=>h.trim()||old[i]);next.sheets[tab].rows=next.sheets[tab].rows.map(r=>{const data={};newHeaders.forEach((h,i)=>{data[h]=r.data[old[i]]??''});return {...r,data}});next.sheets[tab].headers=newHeaders;setHeadersOpen(false);await saveState(next)}
 const saveSettings=async()=>{const next=clone(state);next.settings=settingsForm;setSettingsOpen(false);await saveState(next)}
 const exportCSV=()=>{const csv=[sheet.headers,...rows.map(r=>sheet.headers.map(h=>r.data[h]??''))].map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}));a.download='transport-sheet1.csv';a.click();URL.revokeObjectURL(a.href)}
 const restore=async()=>{if(!confirm('คืนค่าข้อมูลจาก Sheet1 ในไฟล์ Excel? การแก้ไขปัจจุบันจะถูกแทนที่'))return;const next=initialState();await saveState(next)}
 return <div className="app">
  <header className="hero"><div className="seal">✹</div><div className="hero-title"><h1>{state.settings.dashboardTitle}</h1><p>{state.settings.dashboardSubtitle}</p></div><div className="clock"><small>{state.settings.savedLabel}</small><strong>{fmtTime(state.savedAt)}</strong><span>{fmtDate(state.savedAt)} · {state.settings.updatedLabel}</span></div><button className="hero-settings" title="แก้ไขข้อมูลส่วนบน" onClick={()=>{setSettingsForm({...state.settings});setSettingsOpen(true)}}><Settings2 size={17}/></button></header>
  
  <main className="panel"><div className="table-heading"><div><h2>{state.settings.outboundTitle}</h2><p>{state.settings.sourceNote}</p></div><button className="btn outline" onClick={()=>{setSettingsForm({...state.settings});setSettingsOpen(true)}}><Pencil size={15}/> แก้ไขส่วนบน</button></div>
   <div className="toolbar"><div className="toolbar-title"><span className="live-dot"></span> รายละเอียดการขนส่งข้อสอบ (ข้อมูลจาก Sheet1) <small>{remote?'ฐานข้อมูลกลาง':'บันทึกในอุปกรณ์นี้'}{busy?' · กำลังดำเนินการ':''}</small></div><div className="actions"><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาข้อมูลในตาราง"/></div><button className="btn outline" onClick={openHeaders}><Columns3 size={15}/> แก้หัวตาราง</button><button className="btn outline" onClick={exportCSV}><Download size={15}/> CSV</button><button className="btn primary" onClick={openAdd}><Plus size={16}/> เพิ่มรายการ</button></div></div>
   {message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')}><X size={14}/></button></div>}
   <div className="table-wrap"><table className="data-table"><thead><tr><th className="order-col">จัดลำดับ</th>{sheet.headers.map((h,i)=><th key={i}>{h}</th>)}<th>จัดการ</th></tr></thead><tbody>{visible.map(row=><tr key={row.id}><td className="order-col"><div className="order-actions"><button title="เลื่อนขึ้น" disabled={row.order===1} onClick={()=>moveRow(row,-1)}><ChevronUp size={15}/></button><span>{row.order}</span><button title="เลื่อนลง" disabled={row.order===rows.length} onClick={()=>moveRow(row,1)}><ChevronDown size={15}/></button></div></td>{sheet.headers.map((h,i)=><td key={i} className={i===1?'destination-cell':''}>{String(row.data[h]??'')||'—'}</td>)}<td><div className="row-actions"><button title="แก้ไขรายการ" onClick={()=>openEdit(row)}><Pencil size={15}/></button><button title="ลบรายการ" className="delete" onClick={()=>deleteRow(row)}><Trash2 size={15}/></button></div></td></tr>)}{visible.length===0&&<tr><td colSpan={sheet.headers.length+2} className="empty">ไม่พบข้อมูล</td></tr>}</tbody></table></div>
   <footer className="table-foot"><span>แสดง {visible.length} จาก {rows.length} รายการ</span><span><ArrowUpDown size={13}/> ใช้ปุ่มลูกศรในคอลัมน์ “จัดลำดับ” เพื่อเรียงหน่วยได้เอง</span><button className="text-button" onClick={restore}><RefreshCw size={13}/> คืนค่าจาก Excel</button></footer>
  </main><div className="footnote">{state.settings.sourceNote} · ใช้ข้อมูลจาก Sheet1 เท่านั้น · ข้อมูลวันที่ในไฟล์ต้นฉบับแสดงปีแบบย่อ “69” ตามบริบทของชื่อเอกสาร</div>
  {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><form className="modal" onSubmit={saveRow}><div className="modal-head"><div><h2>{editing?'แก้ไขรายการ':'เพิ่มรายการ'}</h2><p>แก้ไขข้อมูลทุกช่องของรายการนี้ได้</p></div><button type="button" className="close" onClick={()=>setModal(false)}><X/></button></div><div className="form-grid">{sheet.headers.map((h,i)=><label className="field" key={i}><span>{h}</span><input value={form[h]??''} onChange={e=>setForm(f=>({...f,[h]:e.target.value}))}/></label>)}</div><div className="modal-actions"><button type="button" className="btn outline" onClick={()=>setModal(false)}>ยกเลิก</button><button className="btn primary" type="submit" disabled={busy}><Save size={15}/>{busy?'กำลังบันทึก…':'บันทึกข้อมูล'}</button></div></form></div>}
  {headersOpen&&<div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><h2>แก้ไขหัวตาราง</h2><p>แก้ชื่อคอลัมน์ได้ โดยข้อมูลเดิมจะย้ายตามหัวข้อเดิม</p></div><button className="close" onClick={()=>setHeadersOpen(false)}><X/></button></div><div className="header-editor">{headersForm.map((h,i)=><label className="field" key={i}><span>คอลัมน์ {i+1}</span><input value={h} onChange={e=>setHeadersForm(a=>a.map((x,j)=>j===i?e.target.value:x))}/></label>)}</div><div className="modal-actions"><button className="btn outline" onClick={()=>setHeadersOpen(false)}>ยกเลิก</button><button className="btn primary" onClick={saveHeaders} disabled={busy}><Save size={15}/> บันทึกหัวตาราง</button></div></div></div>}
  {settingsOpen&&<div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><h2>แก้ไขข้อมูลส่วนบน Dashboard</h2><p>ปรับชื่อระบบ คำอธิบาย และหัวข้อของแต่ละตาราง</p></div><button className="close" onClick={()=>setSettingsOpen(false)}><X/></button></div><div className="form-grid"><Field label="ชื่อ Dashboard" wide value={settingsForm.dashboardTitle} onChange={v=>setSettingsForm(s=>({...s,dashboardTitle:v}))}/><Field label="คำอธิบายด้านบน" wide value={settingsForm.dashboardSubtitle} onChange={v=>setSettingsForm(s=>({...s,dashboardSubtitle:v}))}/><Field label="หัวข้อตารางขาไป" wide value={settingsForm.outboundTitle} onChange={v=>setSettingsForm(s=>({...s,outboundTitle:v}))}/><Field label="ข้อความแหล่งข้อมูล" wide value={settingsForm.sourceNote} onChange={v=>setSettingsForm(s=>({...s,sourceNote:v}))}/><Field label="ป้ายกำกับเวลา" value={settingsForm.savedLabel} onChange={v=>setSettingsForm(s=>({...s,savedLabel:v}))}/><Field label="ป้ายกำกับปรับปรุง" value={settingsForm.updatedLabel} onChange={v=>setSettingsForm(s=>({...s,updatedLabel:v}))}/></div><div className="modal-actions"><button className="btn outline" onClick={()=>setSettingsOpen(false)}>ยกเลิก</button><button className="btn primary" onClick={saveSettings} disabled={busy}><Save size={15}/> บันทึกข้อมูลส่วนบน</button></div></div></div>}
 </div>
}
function Field({label,value,onChange,wide}){return <label className={`field ${wide?'wide':''}`}><span>{label}</span><input value={value??''} onChange={e=>onChange(e.target.value)}/></label>}
createRoot(document.getElementById('root')).render(<App/>)
