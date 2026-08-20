const tabs=[...document.querySelectorAll('[role="tab"]')];
const panels=[...document.querySelectorAll('[role="tabpanel"]')];

tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activateTab(index));
  tab.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    let next=index;
    if(event.key==='ArrowRight') next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft') next=(index-1+tabs.length)%tabs.length;
    if(event.key==='Home') next=0;
    if(event.key==='End') next=tabs.length-1;
    tabs[next].focus(); activateTab(next);
  });
});
function activateTab(index){
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1});
  panels.forEach((panel,i)=>{panel.hidden=i!==index;panel.classList.toggle('active',i===index)});
}

const filterButtons=[...document.querySelectorAll('.filter button')];
const foodCards=[...document.querySelectorAll('.food-card')];
filterButtons.forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.filter;
  filterButtons.forEach(item=>item.classList.toggle('active',item===button));
  foodCards.forEach(card=>{card.hidden=filter!=='all'&&!card.dataset.cat.split(' ').includes(filter)});
}));

const checks=[...document.querySelectorAll('#checklist input[type="checkbox"]:not(:disabled)')];
const key='fukuoka-2026-checklist';
try{
  const saved=JSON.parse(localStorage.getItem(key)||'[]');
  checks.forEach((check,index)=>{check.checked=Boolean(saved[index])});
}catch{}
checks.forEach(check=>check.addEventListener('change',()=>{
  localStorage.setItem(key,JSON.stringify(checks.map(item=>item.checked)));
}));
document.querySelector('.reset').addEventListener('click',()=>{
  checks.forEach(check=>{check.checked=false});
  localStorage.removeItem(key);
});
