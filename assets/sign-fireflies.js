/* Night meadow fireflies: emerge on grass taps and ease away from touch. */
(() => {
 'use strict';
 const style=document.createElement('style');
 style.textContent=`
 .sign-fireflies{position:absolute;inset:0;z-index:7;pointer-events:none;overflow:visible}
 .sign-firefly{position:absolute;width:24px;height:24px;margin:-12px;border:0;border-radius:50%;background:transparent;padding:0;pointer-events:auto;touch-action:manipulation;-webkit-tap-highlight-color:transparent;cursor:pointer}
 .sign-firefly:after{content:"";position:absolute;left:11px;top:11px;width:2px;height:2px;border-radius:50%;background:#fff0b1;box-shadow:0 0 2px 1px #f5df9b66}
 .sign-firefly:focus-visible{outline:2px solid #fff0b1;outline-offset:1px}
 `;
 document.head.append(style);
 const seen=new WeakSet(),flies=[];let layer,board,last=performance.now(),frame=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const night=()=>document.body.classList.contains('night');
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function clear(){flies.splice(0).forEach(f=>f.el.remove());}
 function sync(){
  const root=document.getElementById('sign-wildflowers');
  if(!root){if(board&&!board.isConnected){clear();layer?.remove();layer=board=null;}return;}
  const next=root.closest('.noticeboard');
  if(next!==board){clear();layer?.remove();board=next;layer=document.createElement('div');layer.className='sign-fireflies';layer.setAttribute('aria-label','Fireflies');board.append(layer);}
  root.querySelectorAll('.sign-wildflower-targets button').forEach((button,i)=>{
   if(seen.has(button))return;seen.add(button);
   button.addEventListener('click',e=>{if(night())release(button,e);});
  });
 }
 function release(button,e){
  if(!board||!layer)return;
  const b=board.getBoundingClientRect(),r=button.getBoundingClientRect();
  {
   const el=document.createElement('button');
   el.type='button';el.className='sign-firefly';el.setAttribute('aria-label','Firefly. Tap to make it dodge.');
   const x=(e.detail===0?r.left+r.width/2:e.clientX)-b.left;
   const y=(e.detail===0?r.bottom-r.height*.10:e.clientY)-b.top;
   el.style.transform=`translate(${x}px,${y}px)`;
   layer.append(el);
   const f={el,x,y,baseX:x,baseY:y,phase:Math.random()*Math.PI*2,age:0,vx:0,vy:0,dx:0,dy:0};
   flies.push(f);
   el.addEventListener('click',e=>{
    e.stopPropagation();
    const center=b.left+f.x, direction=e.clientX<center?1:-1;
    f.vx+=direction*(reduced.matches?22:85);
    f.vy-=reduced.matches?8:42;
   });
  }
  while(flies.length>9)flies.shift().el.remove();
  if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}
 }
 function tick(now){
  frame=0;
  const dt=Math.min(.04,(now-last)/1000);last=now;
  if(!night()||!board?.isConnected){clear();return;}
  for(const f of flies){
   f.age+=dt;
   if(f.age<0){f.el.hidden=true;continue;}
   f.el.hidden=false;
   const rise=reduced.matches?24:Math.min(155,f.age*16);
   f.dx+=f.vx*dt;f.dy+=f.vy*dt;
   f.vx*=Math.exp(-3.0*dt);f.vy*=Math.exp(-3.0*dt);
   f.dx*=Math.exp(-.22*dt);f.dy*=Math.exp(-.22*dt);
   const sway=reduced.matches?0:(Math.sin(f.age*1.18+f.phase)-Math.sin(f.phase))*18;
   f.x=clamp(f.baseX+sway+f.dx,22,board.clientWidth-22);
   f.y=f.baseY-rise+(reduced.matches?0:(Math.sin(f.age*1.8+f.phase)-Math.sin(f.phase))*5)+f.dy;
   f.el.style.transform=`translate(${f.x}px,${f.y}px)`;
   f.el.style.opacity=Math.min(1,f.age*2.5)*(f.age>13?clamp((17-f.age)/4,0,1):1);
  }
  for(let i=flies.length-1;i>=0;i--)if(flies[i].age>17){flies[i].el.remove();flies.splice(i,1);}
  if(flies.length)frame=requestAnimationFrame(tick);
 }
 sync();
 const main=document.getElementById('main');
 if(main)new MutationObserver(sync).observe(main,{childList:true,subtree:true});
 new MutationObserver(()=>{if(!night())clear();}).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
