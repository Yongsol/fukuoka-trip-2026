const DB_NAME='fukuoka-planner'; const STORE='attachments'; const MAX=15*1024*1024;
export function safeFilename(name='file') { return String(name).split(/[\\/]/).pop().replace(/[^\p{L}\p{N}._-]/gu,'_').slice(0,120) || 'file'; }
export function isAllowedAttachment(file) { return !!file && file.size <= MAX && ['application/pdf','image/jpeg','image/png','image/webp'].includes(file.type); }
export function attachmentRecord(file,id=crypto.randomUUID(),createdAt=new Date().toISOString()) { return {id,name:safeFilename(file.name),type:file.type,size:file.size,createdAt,blob:file}; }
export function attachmentMetadata({id,name,type,size,createdAt}) { return {id,name,type,size,createdAt}; }
function db() { return new Promise((resolve,reject)=>{ const request=indexedDB.open(DB_NAME,1); request.onupgradeneeded=()=>request.result.createObjectStore(STORE,{keyPath:'id'}); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); }); }
async function operation(mode, action) {
  const database=await db();
  return new Promise((resolve,reject)=>{
    let requestResult;
    let settled=false;
    const finish=(callback,value)=>{if(settled)return;settled=true;database.close();callback(value);};
    let tx;
    try {
      tx=database.transaction(STORE,mode);
      const request=action(tx.objectStore(STORE));
      request.onsuccess=()=>{requestResult=request.result;};
      request.onerror=()=>{};
      tx.oncomplete=()=>finish(resolve,requestResult);
      tx.onabort=()=>finish(reject,tx.error||new Error('저장 작업이 취소되었습니다.'));
      tx.onerror=()=>{};
    } catch(error) {
      finish(reject,error);
    }
  });
}
export async function addAttachment(file) { if(!isAllowedAttachment(file)) throw new Error('PDF/JPG/PNG/WebP 파일(15MB 이하)만 저장할 수 있어요.'); const record=attachmentRecord(file); await operation('readwrite',s=>s.add(record)); return attachmentMetadata(record); }
export async function listAttachments() { return (await operation('readonly',s=>s.getAll())).map(attachmentMetadata).toSorted((a,b)=>b.createdAt.localeCompare(a.createdAt)); }
export async function getAttachment(id) { return operation('readonly',s=>s.get(id)); }
export async function deleteAttachment(id) { await operation('readwrite',s=>s.delete(id)); }
