'use strict';
const slides=[...document.querySelectorAll('.slide')];
const chapters=['Убираем всё лишнее','Нужное оставляем','Зачем обновление','Примеры понятного пути','Список страниц','Цель обновления'];
const prev=document.getElementById('prev'),next=document.getElementById('next');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp=n=>Math.max(0,Math.min(slides.length-1,n));
const fromHash=()=>{const m=location.hash.match(/^#slide-(\d+)$/);return m?clamp(Number(m[1])-1):0;};
let current=fromHash();
const routeDemo=document.getElementById('route-demo'),simplifyButton=document.getElementById('simplify');
const detourReveal=document.querySelector('.detour-reveal');
const detourTags=[...document.querySelectorAll('.detour-tag')];
let routeTimers=[];
let routeFrame=0;
function clearRouteTimers(){routeTimers.forEach(clearTimeout);routeTimers=[];cancelAnimationFrame(routeFrame);}
function simplifyRoute(){
  if(simplifyButton.disabled)return;
  clearRouteTimers();
  simplifyButton.disabled=true;
  const finishRoute=()=>{
    routeDemo.classList.add('simplified');
    routeTimers.push(setTimeout(()=>{
      simplifyButton.disabled=false;
      simplifyButton.textContent='Показать ещё раз';
    },reduced.matches?0:4800));
  };
  if(reduced.matches){
    routeDemo.classList.add('filling','reached');
    detourTags.forEach(tag=>tag.classList.add('crossed'));
    finishRoute();
    return;
  }
  // Measure the route up to the far edge of each label on its horizontal leg.
  const path=document.querySelector('.detour-path');
  const total=path.getTotalLength();
  const box=path.ownerSVGElement.getBoundingClientRect();
  const legs=[
    ['M12 160H150Q170 160 170 140V65Q170 45 190 45H',190,310],
    ['M12 160H150Q170 160 170 140V65Q170 45 190 45H310Q330 45 330 65V255Q330 275 350 275H',350,460],
    ['M12 160H150Q170 160 170 140V65Q170 45 190 45H310Q330 45 330 65V255Q330 275 350 275H460Q480 275 480 255V65Q480 45 500 45H',500,640]
  ];
  const milestones=detourTags.map((tag,i)=>{
    const [prefix,min,max]=legs[i];
    const x=Math.max(min,Math.min(max,(tag.getBoundingClientRect().right-box.left)/box.width*1000));
    const segment=document.createElementNS('http://www.w3.org/2000/svg','path');
    segment.setAttribute('d',prefix+x);
    return segment.getTotalLength()/total;
  });
  routeDemo.classList.add('filling');
  // Read actual visual progress so the strikes stay synchronized with the line.
  const followLine=()=>{
    const progress=1-parseFloat(getComputedStyle(detourReveal).strokeDashoffset);
    detourTags.forEach((tag,i)=>{if(progress>=milestones[i])tag.classList.add('crossed');});
    if(progress>=1){
      routeDemo.classList.add('reached');
      routeTimers.push(setTimeout(finishRoute,1500));
      return;
    }
    routeFrame=requestAnimationFrame(followLine);
  };
  routeFrame=requestAnimationFrame(followLine);
}
function resetRoute(auto=false){
  clearRouteTimers();
  routeDemo.classList.add('resetting');
  routeDemo.classList.remove('filling','simplified','reached');
  detourTags.forEach(tag=>tag.classList.remove('crossed'));
  void routeDemo.offsetWidth;
  routeDemo.classList.remove('resetting');
  simplifyButton.disabled=false;
  simplifyButton.textContent='Убрать лишнее';
  if(auto){if(reduced.matches)simplifyRoute();else routeTimers.push(setTimeout(simplifyRoute,500));}
}
simplifyButton.addEventListener('click',()=>routeDemo.classList.contains('simplified')?resetRoute(true):simplifyRoute());
const dots=slides.map((slide,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`${i+1}. ${chapters[i]}`);b.addEventListener('click',()=>go(i));document.querySelector('.dots').append(b);return b;});
function update(){slides.forEach((s,i)=>{s.hidden=i!==current;s.inert=i!==current;s.classList.toggle('active',i===current);});dots.forEach((b,i)=>b.setAttribute('aria-current',i===current?'true':'false'));prev.disabled=current===0;next.disabled=current===slides.length-1;document.getElementById('counter').textContent=`${String(current+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;document.getElementById('progress').style.width=`${(current+1)/slides.length*100}%`;}
function go(target,write=true){target=clamp(target);if(target===current)return;clearRouteTimers();slides[current].classList.remove('entering');current=target;if(write)history.pushState(null,'',`#slide-${current+1}`);update();const s=slides[current];s.scrollTop=0;if(!reduced.matches)s.classList.add('entering');s.querySelector('h1,h2').focus({preventScroll:true});if(current===1)resetRoute(true);}
update();history.replaceState(null,'',`#slide-${current+1}`);
if(current===1)resetRoute(true);
prev.addEventListener('click',()=>go(current-1));next.addEventListener('click',()=>go(current+1));
window.addEventListener('hashchange',()=>go(fromHash(),false));window.addEventListener('popstate',()=>go(fromHash(),false));
window.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,[contenteditable=true]'))return;if(e.target.closest('button,a')&&[' ','Enter'].includes(e.key))return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(current+1);}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1);}else if(e.key==='Home'){e.preventDefault();go(0);}else if(e.key==='End'){e.preventDefault();go(slides.length-1);}});
document.getElementById('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}});
