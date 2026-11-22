import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { Plus, Search, Pencil, Trash2, Download, RefreshCw, X, Truck, Clock3, MapPin, PackageCheck, CircleHelp } from 'lucide-react'
import './styles.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null
const STORE_KEY = 'paper-transport-units-v1'
const initialRows = [
 {id:'1',unit:'ภ.8',destination:'ศฝร.ภ.8 สุราษฎร์ธานี',registration:'52-4849',scheduled_departure:'10:00',actual_departure:'10:42',delay_minutes:42,stops:2,stops_detail:'ปราณบุรี 35 น. • บ้านเขา 11 น.',return_time:'22:30',gps_time:'20:51',gps_delay_minutes:-99,status:'ถึงที่หมาย',status_detail:'ตาม GPS • ถึงไม่มีต้นทาง',color:'#9471e8'},
 {id:'2',unit:'ภ.5',destination:'ศฝร.ภ.5 ลำปาง',registration:'52-7808',scheduled_departure:'10:30',actual_departure:'11:12',delay_minutes:42,stops:3,stops_detail:'ชัยนาท 19 น. • กำแพงเพชร 13 น. • เกาะคา 11 น.',return_time:'19:30',gps_time:'19:57',gps_delay_minutes:27,status:'ถึงที่หมาย',status_detail:'ตาม GPS • ยังไม่ยืนยัน',color:'#3dcdb1'},
 {id:'3',unit:'ภ.4',destination:'ศฝร.ภ.4 ขอนแก่น',registration:'51-2239',scheduled_departure:'11:00',actual_departure:'11:38',delay_minutes:38,stops:2,stops_detail:'ปากช่อง 27 นาที',return_time:'17:00',gps_time:'19:10',gps_delay_minutes:130,status:'ถึงที่หมาย',status_detail:'ตาม GPS • สัญญาณล่าสุด 20.30 น.',color:'#a3d94f'},
 {id:'4',unit:'ภ.3',destination:'ศฝร.ภ.3 นครราชสีมา',registration:'53-2129',scheduled_departure:'11:30',actual_departure:'12:05',delay_minutes:35,stops:1,stops_detail:'ปากช่อง 14 นาที',return_time:'15:30',gps_time:'16:45',gps_delay_minutes:75,status:'ถึงที่หมาย',status_detail:'ยืนยันปลายทางแล้ว',color:'#f7d447'},
 {id:'5',unit:'ภ.6',destination:'ศฝร.ภ.6 นครสวรรค์',registration:'52-7806',scheduled_departure:'12:00',actual_departure:'12:28',delay_minutes:28,stops:1,stops_detail:'ชัยนาท 16 นาที',return_time:'16:00',gps_time:'16:35',gps_delay_minutes:35,status:'ถึงที่หมาย',status_detail:'ยืนยันปลายทางแล้ว',color:'#24b4c5'},
 {id:'6',unit:'ภ.2',destination:'ศฝร.ภ.2 ชลบุรี',registration:'53-2049',scheduled_departure:'13:00',actual_departure:'13:22',delay_minutes:22,stops:0,stops_detail:'',return_time:'16:00',gps_time:'14:55',gps_delay_minutes:-65,status:'ถึงที่หมาย',status_detail:'กลับถึง บก.ภ.2 แล้ว',color:'#f28c32'},
 {id:'7',unit:'ภ.7',destination:'ศฝร.ภ.7 นครปฐม',registration:'53-2050',scheduled_departure:'13:30',actual_departure:'13:41',delay_minutes:11,stops:0,stops_detail:'',return_time:'16:30',gps_time:'14:52',gps_delay_minutes:-98,status:'ถึงที่หมาย',status_detail:'กำลังกลับ กกม.',color:'#50a9e8'},
 {id:'8',unit:'ภ.1',destination:'ศฝร.ภ.1 สระบุรี',registration:'51-2236',scheduled_departure:'14:00',actual_departure:'14:05',delay_minutes:5,stops:0,stops_detail:'',return_time:'16:00',gps_time:'15:54',gps_delay_minutes:-6,status:'ถึงที่หมาย',status_detail:'ต.หนองแค อ.เมืองสระบุรี',color:'#f46d79'},
 {id:'9',unit:'บช.น.',destination:'ศฝร.บช.น. ศาลายา',registration:'52-6901',scheduled_departure:'14:30',actual_departure:'14:30',delay_minutes:0,stops:0,stops_detail:'',return_time:'15:30',gps_time:'15:41',gps_delay_minutes:11,status:'ถึงที่หมาย',status_detail:'ส่งมอบแล้ว (รายงานพร้อมภาพ)',color:'#d987e9'},
 {id:'10',unit:'สพฐ.ตร.',destination:'สพฐ.ตร.',registration:'52-6900',scheduled_departure:'15:00',actual_departure:'14:51',delay_minutes:-9,stops:0,stops_detail:'',return_time:'16:00',gps_time:'16:09',gps_delay_minutes:9,status:'ถึงที่หมาย',status_detail:'ถึง สพฐ.ตร.',color:'#d5a06c'},
 {id:'11',unit:'บช.ศ.',destination:'บช.ศ. (วตร.)',registration:'52-7886',scheduled_departure:'15:30',actual_departure:'15:19',delay_minutes:-11,stops:0,stops_detail:'',return_time:'16:30',gps_time:'16:11',gps_delay_minutes:-19,status:'ถึงที่หมาย',status_detail:'กลับ บช.ศ.แล้ว',color:'#d9dde2'},
 {id:'12',unit:'ภ.9',destination:'สภ.คอหงส์ หาดใหญ่',registration:'52-7805',scheduled_departure:'16:00',actual_departure:'15:38',delay_minutes:-22,stops:4,stops_detail:'ปราณบุรี 29 • ทับสะแก 14 • ระนอง 10 • ไชยา 12 • ทุ่งสง 27 น.',return_time:'08:00*',gps_time:'',gps_delay_minutes:0,status:'กำลังเดินทาง',status_detail:'05.34 น. อ.คอหงส์ หาดใหญ่ มุ่งปลายทาง ~3 กม.',color:'#ec7aa8'}
]
const blank = () => ({id:'',unit:'',destination:'',registration:'',scheduled_departure:'08:00',actual_departure:'',delay_minutes:0,stops:0,stops_detail:'',return_time:'',gps_time:'',gps_delay_minutes:0,status:'กำลังเดินทาง',status_detail:'',color:'#3b82f6'})
const num = n => Number(n || 0)
const timeNow = '05.35 น.'
function App(){
 const [rows,setRows] = useState(() => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || initialRows } catch { return initialRows } })
 const [query,setQuery] = useState('')
 const [filter,setFilter] = useState('ทั้งหมด')
 const [modal,setModal] = useState(false)
 const [form,setForm] = useState(blank())
 const [isEdit,setIsEdit] = useState(false)
 const [busy,setBusy] = useState(false)
 const [message,setMessage] = useState('')
 const [remote,setRemote] = useState(Boolean(supabase))
 useEffect(()=>{ if(!supabase) return; (async()=>{ setBusy(true); const {data,error}=await supabase.from('transport_units').select('*').order('scheduled_departure'); if(!error && data?.length){setRows(data);setRemote(true)} else if(error){setMessage('เชื่อมต่อ Supabase ไม่สำเร็จ: '+error.message)} setBusy(false) })() },[])
 useEffect(()=>{ if(!remote) localStorage.setItem(STORE_KEY,JSON.stringify(rows)) },[rows,remote])
 const stats=useMemo(()=>({departed:rows.filter(r=>r.actual_departure).length,traveling:rows.filter(r=>r.status==='กำลังเดินทาง').length,rest:rows.filter(r=>r.status==='อยู่ระหว่างพักรถ').length,arrived:rows.filter(r=>r.status==='ถึงที่หมาย').length,stops:rows.reduce((a,r)=>a+num(r.stops),0)}),[rows])
 const visible=useMemo(()=>rows.filter(r=>[r.unit,r.destination,r.registration,r.status,r.status_detail].join(' ').toLowerCase().includes(query.toLowerCase())&&(filter==='ทั้งหมด'||r.status===filter)),[rows,query,filter])
 const openAdd=()=>{setForm(blank());setIsEdit(false);setModal(true)}
 const openEdit=r=>{setForm({...r});setIsEdit(true);setModal(true)}
 async function save(e){e.preventDefault();const next={...form,id:form.id||crypto.randomUUID(),delay_minutes:num(form.delay_minutes),stops:num(form.stops),gps_delay_minutes:num(form.gps_delay_minutes),updated_at:new Date().toISOString()};setBusy(true);setMessage('');if(supabase){const {error}=await supabase.from('transport_units').upsert(next);if(error){setMessage('บันทึกไม่สำเร็จ: '+error.message);setBusy(false);return}setRemote(true)}setRows(old=>isEdit?old.map(r=>r.id===next.id?next:r):[...old,next]);setModal(false);setBusy(false);setMessage('บันทึกข้อมูลเรียบร้อย')}
 async function remove(r){if(!confirm(`ยืนยันลบข้อมูล ${r.unit} (${r.registration}) หรือไม่?`))return;setBusy(true);if(supabase){const {error}=await supabase.from('transport_units').delete().eq('id',r.id);if(error){setMessage('ลบไม่สำเร็จ: '+error.message);setBusy(false);return}}setRows(old=>old.filter(x=>x.id!==r.id));setBusy(false);setMessage('ลบข้อมูลแล้ว')}
 async function resetDemo(){if(!confirm('โหลดข้อมูลตัวอย่าง 12 หน่วยกลับมาใหม่? ข้อมูลปัจจุบันจะถูกแทนที่'))return;if(supabase){const {error}=await supabase.from('transport_units').upsert(initialRows);if(error){setMessage(error.message);return}}setRows(initialRows);setMessage('โหลดข้อมูลตัวอย่างแล้ว')}
 function exportCSV(){const cols=['unit','destination','registration','scheduled_departure','actual_departure','delay_minutes','stops','stops_detail','return_time','gps_time','gps_delay_minutes','status','status_detail'];const csv=[['หน่วยสอบ','ปลายทาง','ทะเบียนรถ','เวลาแผน','เวลาออกจริง','เทียบแผน(นาที)','จุดพัก','รายละเอียดจุดพัก','กำหนดถึง','GPS ล่าสุด','ต่างจากแผน(นาที)','สถานะ','รายละเอียดสถานะ'],...rows.map(r=>cols.map(k=>r[k]??''))].map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\\r\\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\\ufeff'+csv],{type:'text/csv;charset=utf-8;'}));a.download='transport-dashboard.csv';a.click();URL.revokeObjectURL(a.href)}
 const set=(key,value)=>setForm(f=>({...f,[key]:value}))
 return <div className="app">
  <header className="hero">
   <div className="seal">✹</div><div className="hero-title"><h1>สรุปการขนส่งปัญหาข้อสอบ (ขาไป)</h1><p>12 หน่วยสอบ · กองบัญชาการศึกษา · ต้นทางโรงพิมพ์ พระประแดง · ข้อมูล GPS Teletec และ GPS Shadow (ไปรษณีย์ไทย)</p></div>
   <div className="clock"><small>ข้อมูล ณ</small><strong>{timeNow}</strong><span>พฤหัสบดี 19 พฤศจิกายน 2569 · ปรับปรุง 05.35 น.</span></div>
  </header>
  <section className="stats">
   <Stat color="navy" number={stats.departed} label="ออกจากโรงพิมพ์แล้ว" sub="ครบ 12 คัน · สูงสุด +42 นาที"/>
   <Stat color="blue" number={stats.traveling} label="กำลังเดินทาง" sub="ภ.9 ใกล้ถึงปลายทาง"/>
   <Stat color="orange" number={stats.rest} label="อยู่ระหว่างพักรถ" sub="—"/>
   <Stat color="green" number={stats.arrived} label="ถึงที่หมาย" sub="ยืนยัน 8 · ตาม GPS 3 (ภ.4, ภ.5, ภ.8)"/>
   <Stat color="red" number={stats.stops} label="ครั้งที่พัก ณ จุดพักรถ" sub="รวมทุกคัน (จุดละ 10 นาที)"/>
  </section>
  <main className="panel">
   <div className="toolbar">
    <div className="toolbar-title"><span className="live-dot"></span> สถานะการขนส่งแบบเรียลไทม์ <small>{remote?'เชื่อมต่อฐานข้อมูล':'โหมดสาธิต'}</small></div>
    <div className="actions"><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาหน่วย / ปลายทาง / ทะเบียน"/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>ทั้งหมด</option><option>ถึงที่หมาย</option><option>กำลังเดินทาง</option><option>อยู่ระหว่างพักรถ</option></select><button className="btn outline" onClick={exportCSV}><Download size={15}/> CSV</button><button className="btn primary" onClick={openAdd}><Plus size={16}/> เพิ่มหน่วย</button></div>
   </div>
   {message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')}><X size={14}/></button></div>}
   <div className="table-wrap"><table><thead><tr><th>หน่วยสอบ / ปลายทาง</th><th>ทะเบียนรถ</th><th>ออกตามแผน</th><th>ออกจริง</th><th>เทียบแผน<br/>(+ช้า / −ก่อน)</th><th>จุดพัก<br/>ตามแผน</th><th>พักจริง (ครั้ง)</th><th>ถึงตามแผน</th><th>ถึงจริง<br/>(+ช้า / −ก่อน)</th><th>สถานะ ณ 05.35 น.</th><th>จัดการ</th></tr></thead>
   <tbody>{visible.map(r=><tr key={r.id}><td className="unit-cell"><span className="unit-color" style={{background:r.color}}/><div><b>{r.unit}</b><small>{r.destination}</small></div></td><td className="reg">{r.registration}</td><td>{r.scheduled_departure}</td><td><span className="actual">{r.actual_departure||'—'}</span></td><td><span className={'delta '+(num(r.delay_minutes)>0?'late':num(r.delay_minutes)<0?'early':'neutral')}>{num(r.delay_minutes)>0?'+':''}{num(r.delay_minutes)} น.</span></td><td>{r.stops}</td><td><b className={num(r.stops)>0?'stop-num':''}>{r.stops}</b>{r.stops_detail&&<small className="stop-detail">{r.stops_detail}</small>}</td><td>{r.return_time}</td><td><b className={r.status==='ถึงที่หมาย'?'gps-good':'gps-time'}>{r.gps_time||'—'}</b>{r.gps_time&&<small className={'gps-delta '+(num(r.gps_delay_minutes)>0?'late':num(r.gps_delay_minutes)<0?'early':'neutral')}>{num(r.gps_delay_minutes)>0?'+':''}{num(r.gps_delay_minutes)} น.</small>}</td><td><span className={'status '+(r.status==='ถึงที่หมาย'?'arrived':r.status==='กำลังเดินทาง'?'travel':'rest')}>{r.status}</span><small className="status-detail">{r.status_detail}</small></td><td><div className="row-actions"><button aria-label="แก้ไข" title="แก้ไข" onClick={()=>openEdit(r)}><Pencil size={15}/></button><button aria-label="ลบ" title="ลบ" className="delete" onClick={()=>remove(r)}><Trash2 size={15}/></button></div></td></tr>)}
   {visible.length===0&&<tr><td colSpan="11" className="empty">ไม่พบข้อมูลที่ตรงกับการค้นหา</td></tr>}</tbody></table></div>
   <footer className="table-foot"><span>แสดง {visible.length} จาก {rows.length} หน่วยสอบ</span><span><CircleHelp size={13}/> เวลาออกจริง = เวลาที่รถเริ่มเคลื่อนออกจากโรงพิมพ์ · ข้อมูล GPS เป็นข้อมูลตัวอย่าง</span><button className="text-button" onClick={resetDemo}><RefreshCw size={13}/> คืนค่าตัวอย่าง</button></footer>
  </main>
  <div className="footnote">* เวลาและสถานะเป็นข้อมูลตัวอย่างตามภาพอ้างอิง · เมื่อตั้งค่า Supabase ข้อมูลจะบันทึกลงฐานข้อมูลส่วนกลางและใช้ร่วมกันได้หลายอุปกรณ์</div>
  {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><form className="modal" onSubmit={save}>
   <div className="modal-head"><div><h2>{isEdit?'แก้ไขข้อมูลหน่วยสอบ':'เพิ่มหน่วยสอบ'}</h2><p>กรอกข้อมูลการขนส่งและสถานะล่าสุด</p></div><button type="button" className="close" onClick={()=>setModal(false)}><X/></button></div>
   <div className="form-grid">
    <Field label="หน่วยสอบ" required><input required value={form.unit} onChange={e=>set('unit',e.target.value)} placeholder="เช่น ภ.8"/></Field>
    <Field label="ทะเบียนรถ" required><input required value={form.registration} onChange={e=>set('registration',e.target.value)} placeholder="เช่น 52-4849"/></Field>
    <Field label="ปลายทาง" wide><input value={form.destination} onChange={e=>set('destination',e.target.value)} placeholder="ชื่อหน่วยงาน / จังหวัด"/></Field>
    <Field label="เวลาออกตามแผน"><input type="time" value={form.scheduled_departure} onChange={e=>set('scheduled_departure',e.target.value)}/></Field>
    <Field label="เวลาออกจริง"><input type="time" value={form.actual_departure} onChange={e=>set('actual_departure',e.target.value)}/></Field>
    <Field label="เทียบแผน (นาที)"><input type="number" value={form.delay_minutes} onChange={e=>set('delay_minutes',e.target.value)}/></Field>
    <Field label="จำนวนจุดพัก"><input type="number" min="0" value={form.stops} onChange={e=>set('stops',e.target.value)}/></Field>
    <Field label="รายละเอียดจุดพัก" wide><input value={form.stops_detail} onChange={e=>set('stops_detail',e.target.value)} placeholder="เช่น ปราณบุรี 15 นาที"/></Field>
    <Field label="กำหนดถึงปลายทาง"><input type="text" value={form.return_time} onChange={e=>set('return_time',e.target.value)} placeholder="เช่น 22:30"/></Field>
    <Field label="เวลา GPS ล่าสุด"><input type="time" value={form.gps_time} onChange={e=>set('gps_time',e.target.value)}/></Field>
    <Field label="ต่างจากแผน GPS (นาที)"><input type="number" value={form.gps_delay_minutes} onChange={e=>set('gps_delay_minutes',e.target.value)}/></Field>
    <Field label="สถานะ"><select value={form.status} onChange={e=>set('status',e.target.value)}><option>กำลังเดินทาง</option><option>อยู่ระหว่างพักรถ</option><option>ถึงที่หมาย</option></select></Field>
    <Field label="รายละเอียดสถานะ" wide><input value={form.status_detail} onChange={e=>set('status_detail',e.target.value)} placeholder="รายละเอียดเพิ่มเติม"/></Field>
    <Field label="สีประจำหน่วย"><input type="color" value={form.color} onChange={e=>set('color',e.target.value)}/></Field>
   </div>
   <div className="modal-actions"><button type="button" className="btn outline" onClick={()=>setModal(false)}>ยกเลิก</button><button className="btn primary" type="submit" disabled={busy}>{busy?'กำลังบันทึก…':'บันทึกข้อมูล'}</button></div>
  </form></div>}
 </div>
}
function Stat({color,number,label,sub}){return <div className={`stat ${color}`}><strong>{number}</strong><div><b>{label}</b><small>{sub}</small></div></div>}
function Field({label,required,wide,children}){return <label className={`field ${wide?'wide':''}`}><span>{label}{required&&<i> *</i>}</span>{children}</label>}
createRoot(document.getElementById('root')).render(<App/>)
