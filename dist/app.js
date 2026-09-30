'use strict';
const slides=[...document.querySelectorAll('.slide')];
const chapters=['Убираем всё лишнее','Нужное оставляем','Список страниц','Цель обновления'];
const prev=document.getElementById('prev'),next=document.getElementById('next');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp=n=>Math.max(0,Math.min(slides.length-1,n));
const fromHash=()=>{const m=location.hash.match(/^#slide-(\d+)$/);return m?clamp(Number(m[1])-1):0;};
let current=fromHash();
const routeDemo=document.getElementById('route-demo'),simplifyButton=document.getElementById('simplify');
let routeTimers=[];
function clearRouteTimers(){routeTimers.forEach(clearTimeout);routeTimers=[];}
function simplifyRoute(){clearRouteTimers();routeDemo.classList.add('removing');routeTimers.push(setTimeout(()=>{routeDemo.classList.add('simplified');simplifyButton.textContent='Показать ещё раз';document.getElementById('route-status').textContent='Меньше действий до результата.';},reduced.matches?0:450));}
function resetRoute(auto=false){clearRouteTimers();routeDemo.classList.remove('removing','simplified');simplifyButton.textContent='Убрать лишнее';document.getElementById('route-status').textContent='Так сокращаем путь пользователя.';if(auto){if(reduced.matches)simplifyRoute();else routeTimers.push(setTimeout(simplifyRoute,2200));}}
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
