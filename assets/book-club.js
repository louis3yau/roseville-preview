(()=>{'use strict';const $=s=>document.querySelector(s),stage=$('#stage'),dialog=$('#reader'),controls=$('#controls');let books=[],book,origin,mode='front',records=new Map(),formOpen=false;const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const mark=()=>'<img class="mark" src="../assets/church-footer-logo.png" alt="">';const today=()=>new Intl.DateTimeFormat('en-AU',{day:'2-digit',month:'short',year:'2-digit',timeZone:'Australia/Sydney'}).format(new Date()).toUpperCase();const safeUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:''}catch{return ''}};const fit=(el,max,min=5)=>{if(!el)return;let size=max;const child=el.firstElementChild||el;el.style.fontSize=size+'px';while(size>min&&(child.scrollWidth>el.clientWidth-4||child.scrollHeight>el.clientHeight-3)){size-=.5;el.style.fontSize=size+'px'}};function fitAll(){
 const face=stage.querySelector(':scope > .front');if(!face)return;
 const family='Arial';const W=face.clientWidth;
 function width(s,n,weight,tracking){measure.font=weight+' '+n+'px '+family;return measure.measureText(s).width+Math.max(0,s.length-1)*n*tracking}
 function apply(el,value,max,min,tracking,weight,linesMax){
  if(!el)return;const text=String(value||'').toUpperCase().trim();const words=text.split(/\s+/);const aw=el.clientWidth-6,ah=el.clientHeight-2;let best;
  const choices=[[text]];if(linesMax>1)for(let k=1;k<words.length;k++)choices.push([words.slice(0,k).join(' '),words.slice(k).join(' ')]);
  for(let n=max;n>=min;n-=.25){const fits=choices.filter(lines=>lines.length*n*1.16<=ah&&lines.every(l=>width(l,n,weight,tracking)<=aw));if(fits.length){fits.sort((a,b)=>a.length-b.length||Math.abs(width(a[0],n,weight,tracking)-width(a[1]||a[0],n,weight,tracking))-Math.abs(width(b[0],n,weight,tracking)-width(b[1]||b[0],n,weight,tracking)));best={n,lines:fits[0]};break}}
  if(!best){let n=min;const lines=choices[choices.length-1];n=Math.min(n,ah/(lines.length*1.16),...lines.map(l=>min*aw/Math.max(1,width(l,min,weight,tracking))));best={n,lines}}
  el.style.fontSize=best.n+'px';el.style.letterSpacing=tracking+'em';el.style.fontWeight=weight;el.replaceChildren(...best.lines.map(l=>{const s=document.createElement('span');s.textContent=l;return s}));
 }
 apply(face.querySelector('.author'),book.author,Math.min(20,W*.052),5,.13,'400',1);
 apply(face.querySelector('.titlefit'),book.title,Math.min(44,W*.13),5,.035,'700',2);
 apply(face.querySelector('.subtitle'),book.subtitle,Math.min(13,W*.032),4,.13,'400',2);
}

let lift=0,busy=false;const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const measure=document.createElement('canvas').getContext('2d');
// Localised dry-paper abrasion for the Tolstoy edition only; no perimeter stroke.
function tolstoyWear(b,side='front'){
 if(b.id!=='RBC0001')return '';
 const narrow=side==='spine',W=narrow?54:300,H=450;
 let seed=side==='back'?73:narrow?21:41;
 const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 // Only localised rubbed ink: two cover corners, one larger spine-end patch.
 // No perimeter strokes, crease lines, or general surface grain.
 const clusters=narrow?[[13,430,12,19,105]]:side==='back'?[[289,436,8,9,44]]:[[10,12,8,8,54],[288,438,9,8,60]];
 let marks='';
 for(const [cx,cy,rx,ry,count] of clusters){
  for(let i=0;i<count;i++){
   const angle=rand()*Math.PI*2,d=Math.sqrt(rand()),rough=.75+.25*Math.sin(angle*3+.7);
   const x=cx+Math.cos(angle)*rx*d*rough,y=cy+Math.sin(angle)*ry*d*rough;
   if(x<1.8||x>W-1.8||y<1.8||y>H-1.8)continue;
   const a=.18+rand()*(narrow?1.25:1.05),c=.2+rand()*(narrow?1.8:1.15);
   const fill=rand()<.72?'#e9bc80':'#b47843',opacity=.24+rand()*.48;
   marks+='<path d="M'+(x-a).toFixed(2)+' '+y.toFixed(2)+' l'+(a*.72).toFixed(2)+' '+(-c).toFixed(2)+' '+(a*1.23).toFixed(2)+' '+(c*.65).toFixed(2)+' '+(-a*.38).toFixed(2)+' '+(c*.83).toFixed(2)+' Z" fill="'+fill+'" opacity="'+opacity.toFixed(2)+'"/>';
  }
 }
 return '<svg class="tolstoy-wear" aria-hidden="true" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;overflow:hidden;display:block;background:transparent!important;box-shadow:none!important;border:0!important;filter:none!important">'+marks+'</svg>';
}
function spine(b){const el=document.createElement('button');el.className='spine '+(b.spine==='solid'?'solid':'');el.style.setProperty('--edition',b.colour);el.style.width=b.thickness+'px';el.style.height=b.height+'px';el.setAttribute('aria-label','Open '+b.title);const w=b.thickness,H=b.height,solid=b.spine==='solid';
function zone(text,top,portion,weight,max,fill,wrap){
 const length=H*portion-12,cross=w-10;const words=text.toUpperCase().trim().split(/\s+/);const full=words.join(' ');
 let best=null;
 for(let n=max;n>=1;n-=.25){
  measure.font=weight+' '+n+'px Arial';
  const candidates=[[full]];
  if(wrap)for(let k=1;k<words.length;k++)candidates.push([words.slice(0,k).join(' '),words.slice(k).join(' ')]);
  const valid=candidates.filter(lines=>lines.length*n*1.18<=cross&&lines.every(l=>measure.measureText(l).width<=length-3));
  if(valid.length){best={n,lines:valid.sort((a,b)=>a.length-b.length||Math.max(...a.map(l=>measure.measureText(l).width))-Math.max(...b.map(l=>measure.measureText(l).width)))[0]};break}
 }
 if(!best){measure.font=weight+' 1px Arial';best={n:Math.min(1,(length-3)/Math.max(1,measure.measureText(full).width)),lines:[full]}}
 return '<g transform="translate('+(w/2)+' '+(H*(top+portion/2))+') rotate(90)" fill="'+fill+'" font-family="Arial, Helvetica, sans-serif" font-weight="'+weight+'" font-size="'+best.n+'" text-anchor="middle">'+best.lines.map((l,i)=>'<text x="0" y="'+((i-(best.lines.length-1)/2)*best.n*1.18+best.n*.34)+'">'+esc(l)+'</text>').join('')+'</g>';
}
el.innerHTML='<svg class="spine-art" viewBox="0 0 '+w+' '+H+'" width="100%" height="100%" aria-hidden="true">'+(solid?'':'<rect x="0" y="'+H*.286+'" width="'+w+'" height="'+H*.388+'" fill="#f8eacb"/>')+zone(b.author,0,.286,'400',9,'#191917',false)+zone(b.title,.286,.388,'700',10.5,solid?'#f8eacb':'#191917',true)+'</svg>'+mark();
const art=el.innerHTML;el.innerHTML='<div class="book-solid"><div class="solid-spine">'+art+tolstoyWear(b,'spine')+'</div><div class="solid-front">'+front(b)+'</div><div class="solid-back">'+miniBack(b)+tolstoyWear(b,'back')+'</div><div class="solid-edges"></div><div class="solid-top"></div><div class="solid-bottom"></div></div>';el.querySelectorAll('[tabindex]').forEach(n=>n.removeAttribute('tabindex'));attachPhysics(el,b);return el}

const field=$('#club'),bodies=[];let activeDrag=null,frame=0,last=0,layer=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function axes(b){if(b.kind==='apple'){const p=corners(b);return p.map((a,i)=>{const c=p[(i+1)%p.length],dx=c[0]-a[0],dy=c[1]-a[1],m=Math.hypot(dx,dy)||1;return [-dy/m,dx/m]})}const c=Math.cos(b.angle),s=Math.sin(b.angle);return [[c,s],[-s,c]]}
function corners(b){if(b.kind==='apple'){const c=Math.cos(b.angle),s=Math.sin(b.angle),k=b.w/110;return [[28,31],[63,30],[76,35],[85,43],[90,63],[88,76],[80,92],[68,104],[55,107],[34,106],[21,97],[12,85],[6,69],[5.5,63],[9,48],[18,37]].map(([x,y])=>{const u=(x-50)*k,v=(y-55)*k;return [b.x+u*c-v*s,b.y+u*s+v*c]})}const [u,v]=axes(b);const w=Math.abs(Math.cos(b.yaw||0))*b.w+Math.abs(Math.sin(b.yaw||0))*b.h*2/3;return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,j])=>[b.x+i*u[0]*w/2+j*v[0]*b.h/2,b.y+i*u[1]*w/2+j*v[1]*b.h/2])}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]}
function cross(a,b){return a[0]*b[1]-a[1]*b[0]}
function contact(a,b){const A=corners(a),B=corners(b);let depth=Infinity,n;for(const axis of [...axes(a),...axes(b)]){const x=A.map(p=>dot(p,axis)),y=B.map(p=>dot(p,axis)),over=Math.min(Math.max(...x),Math.max(...y))-Math.max(Math.min(...x),Math.min(...y));if(over<=0)return null;if(over<depth){depth=over;n=axis}}if(dot([b.x-a.x,b.y-a.y],n)<0)n=n.map(x=>-x);const pa=A.slice().sort((p,q)=>dot(q,n)-dot(p,n)),pb=B.slice().sort((p,q)=>dot(p,n)-dot(q,n));return {n,depth,p:[(pa[0][0]+pb[0][0])/2,(pa[0][1]+pb[0][1])/2]}}
function impulse(a,b,n,p,depth){if(b){const impact=Math.hypot(a.vx-b.vx,a.vy-b.vy);for(const [q,o] of [[a,b],[b,a]]){if(q.displayRest&&(o.drag||impact>65)){q.displayRest=false;q.asleep=false;q.quiet=0}if(q.asleep&&!q.displayRest&&Math.abs(n[0])>.65&&(o.drag||impact>230)){q.asleep=false;q.quiet=0}}}const ia=a.drag||a.asleep||a.displayRest?0:1/a.mass,ib=b?(b.drag||b.asleep||b.displayRest?0:1/b.mass):0,ja=a.drag||a.asleep||a.displayRest?0:1/a.inertia,jb=b?(b.drag||b.asleep||b.displayRest?0:1/b.inertia):0;if(!ia&&!ib)return;const ra=[p[0]-a.x,p[1]-a.y],rb=b?[p[0]-b.x,p[1]-b.y]:[0,0];const av=[a.vx-a.spin*ra[1],a.vy+a.spin*ra[0]],bv=b?[b.vx-b.spin*rb[1],b.vy+b.spin*rb[0]]:[0,0];const rv=[bv[0]-av[0],bv[1]-av[1]],vel=dot(rv,n),ca=cross(ra,n),cb=cross(rb,n);const den=ia+ib+ca*ca*ja+cb*cb*jb;if(vel<0&&den>0){const j=-1.08*vel/den;a.vx-=j*n[0]*ia;a.vy-=j*n[1]*ia;a.spin-=j*ca*ja;if(b){b.vx+=j*n[0]*ib;b.vy+=j*n[1]*ib;b.spin+=j*cb*jb}const t=[-n[1],n[0]],ct=cross(ra,t),dt=cross(rb,t),fden=ia+ib+ct*ct*ja+dt*dt*jb;if(fden){const f=clamp(-dot(rv,t)/fden,-j*.5,j*.5);a.vx-=f*t[0]*ia;a.vy-=f*t[1]*ia;a.spin-=f*ct*ja;if(b){b.vx+=f*t[0]*ib;b.vy+=f*t[1]*ib;b.spin+=f*dt*jb}}}const correction=Math.max(0,depth-.15)*.72/(ia+ib);a.x-=n[0]*correction*ia;a.y-=n[1]*correction*ia;if(b){b.x+=n[0]*correction*ib;b.y+=n[1]*correction*ib}}
function wall(b,n,limit){const c=corners(b),m=Math.max(...c.map(p=>dot(p,n))),pts=c.filter(p=>m-dot(p,n)<.8),p=pts.reduce((s,q)=>[s[0]+q[0]/pts.length,s[1]+q[1]/pts.length],[0,0]);const d=m-limit;if(d>0)impulse(b,null,n,p,d)}
function support(b){const bottom=Math.max(...corners(b).map(p=>p[1]));if(bottom>=field.clientHeight-10)return true;return bodies.some(q=>q!==b&&q.y>b.y&&Math.abs(b.x-q.x)<(Math.abs(Math.sin(b.angle))*b.h+Math.abs(Math.sin(q.angle))*q.h+b.w+q.w)/2&&Math.abs(bottom-Math.min(...corners(q).map(p=>p[1])))<5)}
function extent(b){const c=corners(b);return {l:Math.min(...c.map(p=>p[0])),r:Math.max(...c.map(p=>p[0])),t:Math.min(...c.map(p=>p[1])),b:Math.max(...c.map(p=>p[1]))}}
function supportLevel(b){const e=extent(b),floor=field.clientHeight-8;if(e.b>=floor-2.5)return floor;let best=Infinity;for(const q of bodies){if(q===b||q.drag||q.y<=b.y)continue;const f=extent(q),over=Math.min(e.r,f.r)-Math.max(e.l,f.l);if(over>Math.min((e.r-e.l)*.3,8)&&Math.abs(e.b-f.t)<4.5)best=Math.min(best,f.t)}return best}
function leaning(b){const e=extent(b),tilt=Math.sin(b.angle)*Math.cos(b.angle);if(Math.abs(tilt)<.035)return false;for(const q of bodies){if(q===b)continue;const f=extent(q),over=Math.min(e.b,f.b)-Math.max(e.t,f.t);if(over<b.h*.22)continue;const topX=b.x-Math.sin(b.angle)*Math.sign(Math.cos(b.angle))*b.h*.42;if(topX<b.x&&q.x<b.x&&Math.abs(e.l-f.r)<5)return true;if(topX>b.x&&q.x>b.x&&Math.abs(e.r-f.l)<5)return true}return false}
function verticalSpan(poly,x){let lo=Infinity,hi=-Infinity;for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length];if(x<Math.min(p[0],q[0])-.0001||x>Math.max(p[0],q[0])+.0001)continue;const dx=q[0]-p[0];if(Math.abs(dx)<.0001){lo=Math.min(lo,p[1],q[1]);hi=Math.max(hi,p[1],q[1]);continue}const y=p[1]+(q[1]-p[1])*(x-p[0])/dx;lo=Math.min(lo,y);hi=Math.max(hi,y)}return {top:lo,bottom:hi}}
function appleSupport(b,tolerance=1.5){const A=corners(b),e=extent(b),floor=field.clientHeight-8;let best=null;const floorGap=floor-e.b;if(Math.abs(floorGap)<=tolerance){const bottom=A.filter(p=>p[1]>=e.b-1.4);best={gap:floorGap,x:bottom.reduce((s,p)=>s+p[0],0)/bottom.length,slope:0,body:null}}for(const q of bodies){if(q===b||q.drag||q.y<=b.y)continue;const B=corners(q),f=extent(q),lo=Math.max(e.l,f.l),hi=Math.min(e.r,f.r);if(hi-lo<.5||e.b<f.t-tolerance||e.t>f.b)continue;const xs=[lo,hi,...A.map(p=>p[0]),...B.map(p=>p[0])].filter(x=>x>=lo&&x<=hi);let gap=Infinity,contactX=0;for(const x of xs){const av=verticalSpan(A,x),bv=verticalSpan(B,x);if(!Number.isFinite(av.bottom)||!Number.isFinite(bv.top))continue;const g=bv.top-av.bottom;if(g<gap){gap=g;contactX=x}}if(Math.abs(gap)>tolerance)continue;const x1=Math.max(f.l+.01,contactX-1),x2=Math.min(f.r-.01,contactX+1),slope=(verticalSpan(B,x2).top-verticalSpan(B,x1).top)/Math.max(.01,x2-x1);const candidate={gap,x:contactX,slope:Number.isFinite(slope)?slope:0,body:q};if(!best||Math.abs(gap)<Math.abs(best.gap))best=candidate}return best}
function parkApple(b,p){b.y+=p.gap;b.vx=b.vy=b.spin=b.yawVelocity=0;b.asleep=true;b.appleQuiet=0;b.appleSupportBody=p.body;b.appleSupportPose=p.body?{x:p.body.x,y:p.body.y,a:p.body.angle,yaw:p.body.yaw}:null}
function settle(b,t){if(b.drag||b.displayRest||b.asleep)return;if(b.kind==='apple'){const p=appleSupport(b,2);if(!p){b.appleQuiet=0;b.spin*=Math.exp(-.65*t);return}const speed=Math.hypot(b.vx,b.vy),radius=b.w*.35;const stableSurface=Math.abs(p.slope)<.10;const stableCenter=Math.abs(p.x-b.x)<radius*.22;
if(Math.abs(p.gap)<1.5&&b.vy>=-12)b.y+=p.gap*.6;
// Rolling resistance is applied only during real contact. No angle targets.
b.vx*=Math.exp(-(stableSurface?5.2:2.4)*t);b.spin*=Math.exp(-(stableSurface?5.8:2.8)*t);
if(!stableSurface&&Math.abs(b.vx)<32)b.vx+=clamp(p.slope*100,-70,70)*t;
if(stableSurface&&speed<32&&Math.abs(b.spin)<.9){if(!stableCenter){b.spin+=clamp((p.x-b.x)*-.09,-1.8,1.8)*t;}else b.spin*=Math.exp(-8*t)}
if(!p.body&&stableSurface&&speed<65&&Math.abs(b.spin)<1.6){
 // Pick a broad supporting face, not a single corner. Roll gradually while maintaining floor contact.
 const hull=corners({...b,angle:0}), candidates=[];
 for(let i=0;i<hull.length;i++){const u=hull[i],v=hull[(i+1)%hull.length],dx=v[0]-u[0],dy=v[1]-u[1],length=Math.hypot(dx,dy);if(length<b.w*.16)continue;
 let angle=-Math.atan2(dy,dx);for(let j=0;j<2;j++,angle+=Math.PI){const delta=Math.atan2(Math.sin(angle-b.angle),Math.cos(angle-b.angle)),pose={...b,angle:b.angle+delta},poly=corners(pose),bottom=Math.max(...poly.map(q=>q[1])),a=poly[i],c=poly[(i+1)%poly.length];if(bottom-a[1]>1||bottom-c[1]>1)continue;const lo=Math.min(a[0],c[0]),hi=Math.max(a[0],c[0]);if(b.x<lo-b.w*.04||b.x>hi+b.w*.04)continue;candidates.push({delta,score:Math.abs(delta)-length/b.w*.35})}}
 candidates.sort((a,c)=>a.score-c.score);const target=candidates[0];
 if(target){const d=target.delta;if(Math.abs(d)>.012){const step=Math.sign(d)*Math.min(Math.abs(d),Math.max(.18,Math.abs(d)*3.8)*t);b.angle+=step;b.x-=step*radius*.65;b.spin=0;b.vy=0;b.y+=field.clientHeight-8-extent(b).b;b.appleQuiet=0;return}b.angle+=d;b.y+=field.clientHeight-8-extent(b).b;b.spin=0;if(speed<18){b.appleQuiet=(b.appleQuiet||0)+t;if(b.appleQuiet>.22)parkApple(b,{...p,gap:0});return}}
 }
 if(p.body&&stableSurface&&stableCenter&&speed<18&&Math.abs(b.spin)<.32){b.appleQuiet=(b.appleQuiet||0)+t;if(b.appleQuiet>.25)parkApple(b,p)}else b.appleQuiet=0;return}const level=supportLevel(b);if(!Number.isFinite(level)){b.quiet=0;return}
 const target=Math.round(b.angle/(Math.PI/2))*Math.PI/2,delta=target-b.angle,flat=Math.abs(Math.sin(target))>.9,slow=Math.abs(b.vy)<90;
 if(!slow){b.quiet=0;return}
 b.yawVelocity*=Math.exp(-12*t);const spineTurn=Math.round(b.yaw/(2*Math.PI))*2*Math.PI,offset=b.yaw-spineTurn;const edge=Math.abs(offset)>Math.PI*.72?spineTurn+Math.sign(offset)*Math.PI:spineTurn,y=b.yaw-edge;b.yaw-=y*Math.min(1,10*t);if(Math.abs(y)<.025){b.yaw=edge;b.yawVelocity=0}
 if(flat&&Math.abs(delta)<.35){b.spin+=delta*100*t;b.spin*=Math.exp(-17*t);b.vx*=Math.exp(-18*t);if(Math.abs(delta)<.045&&Math.abs(b.spin)<.4&&Math.abs(b.vx)<10&&Math.abs(y)<.04){b.quiet=(b.quiet||0)+t;if(b.quiet>.12){b.angle=target;b.yaw=edge;b.y=level-(extent(b).b-b.y);b.vx=b.vy=b.spin=b.yawVelocity=0;b.asleep=true;b.supportY=level}}else b.quiet=0;return}
 if(!flat&&Math.abs(delta)<.55){if(leaning(b)){b.spin*=Math.exp(-16*t);b.vx*=Math.exp(-12*t);return}
 // The narrow end is unstable. A tiny persistent torque initiates toppling;
 // do not spring the book back to a vertical pose.
 const sign=Math.abs(delta)>.035?Math.sign(-delta):b.tipSign||1;
 b.spin+=sign*(8+18*Math.abs(delta))*t;b.vx*=Math.exp(-5*t);return}
 b.vx*=Math.exp(-5*t)
}
// Flexible leaf is decorative, never part of the rigid collision hull.
function flexLeaf(b){
 const leaf=b.el.querySelector('.apple-leaf');if(!leaf)return;
 const svg=leaf.ownerSVGElement,ns='http://www.w3.org/2000/svg',floor=field.clientHeight-8,rect=field.getBoundingClientRect(),matrix=svg.getScreenCTM();
 if(!matrix)return;
 const inverse=matrix.inverse(),pivot=[51,29],world=p=>{const v=svg.createSVGPoint();v.x=p[0];v.y=p[1];const t=v.matrixTransform(matrix);return [t.x-rect.left,t.y-rect.top]},local=p=>{const v=svg.createSVGPoint();v.x=p[0]+rect.left;v.y=p[1]+rect.top;const t=v.matrixTransform(inverse);return [t.x,t.y]};
 if(!b.leafSamples){const length=leaf.getTotalLength();b.leafSamples=Array.from({length:40},(_,i)=>{const p=leaf.getPointAtLength(length*i/39);return [p.x,p.y]})}
 const obstacles=bodies.filter(q=>q!==b&&q.el.style.visibility!=='hidden').map(q=>corners(q));
 function penetration(p,poly){let sign=0,min=Infinity;for(let i=0;i<poly.length;i++){const a=poly[i],c=poly[(i+1)%poly.length],dx=c[0]-a[0],dy=c[1]-a[1],v=(dx*(p[1]-a[1])-dy*(p[0]-a[0]))/(Math.hypot(dx,dy)||1);if(Math.abs(v)>.001){const n=Math.sign(v);if(sign&&n!==sign)return 0;sign=n}min=Math.min(min,Math.abs(v))}return min+.4}
 function pressure(deg,stretch=1){const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);let max=0;for(const p of b.leafSamples){const u=(p[0]-51)*stretch,v=(p[1]-29)*stretch;if(Math.hypot(u,v)<2)continue;const pt=world([51+u*c-v*s,29+u*s+v*c]);max=Math.max(max,pt[1]-floor+.3);for(const poly of obstacles)max=Math.max(max,penetration(pt,poly))}return max}
 let target=0,stretch=1,best=pressure(0);
 if(best>.15){let bestScore=Infinity;for(const k of [1,.94,.86,.76,.66]){for(let d=0;d<=40;d+=4){for(const sign of (d?[1,-1]:[1])){const angle=d*sign,p=pressure(angle,k),score=p*20+d*.025+(1-k)*6;if(score<bestScore){bestScore=score;target=angle;stretch=k}}}if(bestScore<1)break}}
 const now=performance.now(),dt=Math.min(.05,Math.max(.001,(now-(b.leafTime||now-16))/1000));b.leafTime=now;
 let pos=b.leafAngle||0,velocity=b.leafVelocity||0,scale=b.leafStretch??1;
 if(reduced()){pos=target;velocity=0;scale=stretch}
 else{const steps=Math.max(1,Math.ceil(dt/.004)),h=dt/steps;for(let i=0;i<steps;i++){velocity+=((target-pos)*850-velocity*27)*h;pos+=velocity*h;if(Math.abs(pos)>40){pos=Math.sign(pos)*40;velocity*=.15}}if(Math.abs(target-pos)<.12&&Math.abs(velocity)<1){pos=target;velocity=0}scale+=(stretch-scale)*(1-Math.exp(-22*dt))}
 b.leafAngle=pos;b.leafVelocity=velocity;b.leafStretch=scale;
 const idle=target===0&&best<=.15&&b.asleep&&!b.drag&&!reduced()?Math.sin(now/750)*3:0;
 leaf.setAttribute('transform','translate(51 29) rotate('+(pos+idle)+') scale('+scale+') translate(-51 -29)');
 // If a book physically covers the leaf even at maximum flex, occlude just
 // the intersecting pixels. The mask lives on an untransformed parent, so
 // it stays aligned with the real book rather than rotating with the leaf.
 if(!b.leafOcclusion){const defs=document.createElementNS(ns,'defs'),mask=document.createElementNS(ns,'mask'),white=document.createElementNS(ns,'rect'),cut=document.createElementNS(ns,'path'),wrap=document.createElementNS(ns,'g');mask.id='apple-leaf-occlusion';mask.setAttribute('maskUnits','userSpaceOnUse');mask.setAttribute('maskContentUnits','userSpaceOnUse');mask.setAttribute('x','-100');mask.setAttribute('y','-100');mask.setAttribute('width','300');mask.setAttribute('height','310');white.setAttribute('x','-100');white.setAttribute('y','-100');white.setAttribute('width','300');white.setAttribute('height','310');white.setAttribute('fill','white');cut.setAttribute('fill','black');mask.append(white,cut);defs.append(mask);svg.prepend(defs);leaf.parentNode.insertBefore(wrap,leaf);wrap.append(leaf);b.leafOcclusion={wrap,cut}}
 const {wrap,cut}=b.leafOcclusion;
 if(pressure(pos+idle,scale)>.15){const polys=obstacles.concat([[[ -10000,floor],[10000,floor],[10000,floor+10000],[-10000,floor+10000]]]);cut.setAttribute('d',polys.map(poly=>'M'+poly.map(p=>local(p).map(v=>v.toFixed(2)).join(' ')).join(' L')+' Z').join(' '));wrap.setAttribute('mask','url(#apple-leaf-occlusion)')}else{wrap.removeAttribute('mask');cut.setAttribute('d','')}
}

function drawBody(b){if(b.shadow){const c=corners(b),gap=Math.max(0,field.clientHeight-8-Math.max(...c.map(p=>p[1]))),width=Math.max(...c.map(p=>p[0]))-Math.min(...c.map(p=>p[0]));b.shadow.style.left=b.x+'px';b.shadow.style.top=(field.clientHeight-6)+'px';b.shadow.style.bottom='auto';b.shadow.style.width=Math.max(7,width*.92+gap*.12)+'px';b.shadow.style.height=(3+gap*.04)+'px';b.shadow.style.opacity=String(gap<5?.035:gap<35?.018*(1-gap/45):0);b.shadow.style.filter='blur('+(2+gap*.045)+'px)';b.shadow.style.visibility=b.el.style.visibility==='hidden'?'hidden':'visible'}b.el.style.transform='translate3d('+(b.x-b.w/2)+'px,'+(b.y-b.h/2)+'px,0) rotate('+b.angle+'rad)';if(b.kind==='apple'){flexLeaf(b);return}b.el.querySelector('.book-solid').style.transform='rotateY('+(b.yaw||0)+'rad)';b.el.classList.toggle('spine-only',Math.abs(Math.atan2(Math.sin(b.yaw||0),Math.cos(b.yaw||0)))<.025);b.el.classList.toggle('supported',!b.drag&&support(b))}
function tick(now){frame=0;const dt=Math.min(.04,(now-(last||now))/1000);last=now;if(dialog.open||reduced())return;const bounds=field.getBoundingClientRect(),W=document.documentElement.clientWidth-bounds.left,L=-bounds.left,T=-bounds.top,H=field.clientHeight-8;
 for(let k=0;k<6;k++){const t=dt/6;for(const b of bodies){if(b.asleep&&!b.displayRest){if(b.kind==='apple'){const p=appleSupport(b,1.8),q=b.appleSupportBody,pose=b.appleSupportPose,moved=q&&(q.drag||!pose||Math.hypot(q.x-pose.x,q.y-pose.y)>.7||Math.abs(q.angle-pose.a)>.018||Math.abs(q.yaw-pose.yaw)>.018);if(!p||p.body!==q&&q||moved||Math.abs(p.slope)>.12){b.asleep=false;b.appleQuiet=0}else{b.y+=p.gap;b.vx=b.vy=b.spin=0}}else{const level=supportLevel(b);if(!Number.isFinite(level)||Math.abs(level-b.supportY)>5){b.asleep=false;b.quiet=0}}}if(!b.drag&&!b.asleep&&!b.displayRest){b.vy=Math.min(1600,b.vy+2600*t);b.x+=b.vx*t;b.y+=b.vy*t;b.angle+=b.spin*t;b.yaw=(b.yaw||0)+(b.yawVelocity||0)*t;b.yawVelocity=(b.yawVelocity||0)*Math.exp(-2.8*t);b.vx*=Math.exp(-.6*t);b.vy*=Math.exp(-.25*t);b.spin*=Math.exp(-(b.kind==='apple'?.65:.9)*t)}wall(b,[0,1],H);wall(b,[1,0],W);wall(b,[-1,0],-L);wall(b,[0,-1],-T)}
 for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){const a=bodies[i],b=bodies[j],c=contact(a,b);if(c){impulse(a,b,c.n,c.p,c.depth);if(Math.abs(c.n[1])>.8){const upper=a.y<b.y?a:b,lower=upper===a?b:a;if(upper.kind!=='apple'&&!upper.drag&&!upper.asleep&&!upper.displayRest&&Math.abs(Math.cos(upper.angle))>.92&&Math.abs(Math.sin(lower.angle))>.75){upper.spin+=((upper.x-lower.x)<0?-1:1)*t*8}}}}for(const b of bodies){if(b.kind==='apple')b.spin=clamp(b.spin,-10,10);settle(b,t)}}
 bodies.forEach(drawBody);frame=requestAnimationFrame(tick)}
function wake(){if(!frame&&!restacking&&!dialog.open&&!reduced()){last=0;frame=requestAnimationFrame(tick)}}
function resetBooks(){const scale=Math.min(.653,field.clientWidth/510);const total=bodies.filter(b=>b.kind!=='apple').reduce((s,b)=>s+b.data.thickness*scale+5,0);let x=(field.clientWidth-total)/2;const H=field.clientHeight-8;for(const [i,b] of bodies.entries()){if(b.kind==='apple'){const size=Math.max(56,Math.min(88,field.clientWidth*.21));b.w=b.h=size;b.x=Math.min(field.clientWidth-size/2-12,field.clientWidth/2+total/2+size/2+22);b.y=H-size/2;b.angle=b.yaw=b.vx=b.vy=b.spin=b.yawVelocity=0;b.y=H-(extent(b).b-b.y);b.mass=.95;b.inertia=b.mass*Math.pow(size*.36,2)*.55;b.drag=false;b.asleep=true;b.displayRest=false;b.appleQuiet=0;b.appleRestAngle=null;b.supportY=H;b.el.style.width=size+'px';b.el.style.height=size+'px';drawBody(b);continue}b.w=b.data.thickness*scale;b.h=b.data.height*scale;b.el.style.width=b.w+'px';b.el.style.height=b.h+'px';b.el.style.setProperty('--bw',b.w+'px');b.el.style.setProperty('--bh',b.h+'px');b.el.style.setProperty('--coverw',(b.h*2/3)+'px');b.x=x+b.w/2;b.angle=i===bodies.filter(q=>q.kind!=='apple').length-1?-.07:0;b.y=H-(Math.abs(Math.cos(b.angle))*b.h+Math.abs(Math.sin(b.angle))*b.w)/2;b.yaw=0;b.yawVelocity=0;b.vx=b.vy=b.spin=0;b.mass=b.w*b.h/4000;b.inertia=b.mass*(b.w*b.w+b.h*b.h)/12;b.drag=false;b.asleep=false;b.displayRest=true;b.quiet=0;b.tipSign=i%2?1:-1;b.el.style.zIndex=i+1;drawBody(b);x+=b.w+5}layer=bodies.length;if(frame)cancelAnimationFrame(frame);frame=0;last=0}
let keyboardBookFocus=false;document.addEventListener('keydown',e=>{if(e.key==='Tab')keyboardBookFocus=true},true);document.addEventListener('pointerdown',()=>{keyboardBookFocus=false;field.querySelectorAll('[data-keyboard-focus]').forEach(el=>delete el.dataset.keyboardFocus)},true);
function attachPhysics(el,data){const b={el,data,kind:data.kind||'book',w:data.thickness,h:data.height,x:0,y:0,angle:0,yaw:0,yawVelocity:0,vx:0,vy:0,spin:0,mass:1,inertia:1,drag:false,lastTap:0};bodies.push(b);b.shadow=document.createElement('span');b.shadow.className='book-floor-shadow';b.shadow.setAttribute('aria-hidden','true');field.prepend(b.shadow);let start=null,wiggle=null;function stopWiggle(){if(wiggle){wiggle.cancel();wiggle=null}}function wriggle(){if(b.kind==='apple'||reduced()||start?.moved||restacking||dialog.open)return;stopWiggle();const art=el.querySelector('.book-solid');wiggle=art.animate([{rotate:'0deg'},{rotate:'-3deg'},{rotate:'2.5deg'},{rotate:'-1deg'},{rotate:'0deg'}],{duration:360,easing:'ease-in-out'});wiggle.onfinish=()=>{wiggle=null}}el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!activeDrag)wriggle()});el.addEventListener('focus',()=>{if(keyboardBookFocus)el.dataset.keyboardFocus='true'});el.addEventListener('blur',()=>delete el.dataset.keyboardFocus);el.addEventListener('pointerdown',()=>delete el.dataset.keyboardFocus);
 el.onpointerdown=e=>{if(e.button!==0||activeDrag||restacking)return;e.preventDefault();el.setPointerCapture(e.pointerId);activeDrag=b;b.drag=true;b.el.style.zIndex=++layer;start={x:e.clientX,y:e.clientY,bx:b.x,by:b.y,lastX:e.clientX,lastY:e.clientY,time:performance.now(),moved:false,wasDisplay:b.displayRest,wasAsleep:b.asleep};b.vx=b.vy=b.spin=b.yawVelocity=0;wriggle();wake()};
 el.onpointermove=e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.hypot(dx,dy)>5&&!start.moved){start.moved=true;stopWiggle();b.asleep=false;b.displayRest=false;b.quiet=0}if(!start.moved)return;const now=performance.now(),dt=Math.max(12,now-start.time)/1000;b.vx=clamp((e.clientX-start.lastX)/dt,-900,900);b.vy=clamp((e.clientY-start.lastY)/dt,-900,900);const bounds=field.getBoundingClientRect();b.x=clamp(start.bx+dx,-bounds.left,document.documentElement.clientWidth-bounds.left);b.y=clamp(start.by+dy,-bounds.top,field.clientHeight);b.angle=b.kind==='apple'?b.angle+(e.clientX-start.lastX)*.006:clamp(b.angle+(e.clientX-start.lastX)*.006,-1.57,1.57);if(b.kind!=='apple')b.yaw+=clamp((e.clientX-start.lastX)*.011,-.16,.16);start.lastX=e.clientX;start.lastY=e.clientY;start.time=now;drawBody(b)};
 el.onpointerup=e=>{if(!start)return;const moved=start.moved,now=performance.now();if(now-start.time>100)b.vx=b.vy=0;start=null;activeDrag=null;b.drag=false;if(moved){if(b.kind==='apple'){b.appleThrowCount=(b.appleThrowCount||0)+1;b.appleQuiet=0;b.appleRestAngle=null;b.vx=clamp(b.vx,-460,460);b.spin=clamp(b.vx/Math.max(14,b.w*.35),-9,9);b.yaw=b.yawVelocity=0;wake();return}field.dispatchEvent(new Event('bookworm-book-thrown'));b.tipSign=b.vx<0?-1:1;b.lastTap=0;b.spin=clamp(b.vx/230,-5,5);b.yawVelocity=clamp(b.vx/320,-2.5,2.5);if(Math.abs(b.angle)<.07)b.angle=(b.vx<0?-1:1)*.085}else{b.vx=b.vy=0;if(b.kind==='apple'){revealBookworm(b);wake();return}if(now-b.lastTap<350&&b.lastTap){b.lastTap=0;open(data,el)}else b.lastTap=now}wake()};
 el.onpointercancel=()=>{stopWiggle();start=null;activeDrag=null;b.drag=false;b.lastTap=0;b.vx=b.vy=b.spin=0;wake()};
 el.onclick=e=>{if(e.detail===0){if(b.kind!=='apple')open(data,el);else revealBookworm(b)}};
}
const restackButton=$('#reset-books');let restacking=false,restackFrame=0,restackStart=0,restackFrom=[],restackTargets=[];
function shortest(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a))}
function beginRestack(){if(restacking||activeDrag||dialog.open||!bodies.length)return;if(reduced()){resetBooks();return}restacking=true;if(frame)cancelAnimationFrame(frame);frame=0;restackStart=performance.now();const total=bodies.filter(b=>b.kind!=='apple').reduce((s,b)=>s+b.w+5,0);let x=(field.clientWidth-total)/2;const H=field.clientHeight-8;restackFrom=bodies.map(b=>({x:b.x,y:b.y,angle:b.angle,yaw:b.yaw}));restackTargets=bodies.map((b,i)=>{if(b.kind==='apple')return {x:Math.min(field.clientWidth-b.w/2-12,field.clientWidth/2+total/2+b.w/2+22),y:H-b.h/2,angle:0,yaw:0};const angle=i===bodies.filter(q=>q.kind!=='apple').length-1?-.07:0;const q={x:x+b.w/2,y:H-(Math.abs(Math.cos(angle))*b.h+Math.abs(Math.sin(angle))*b.w)/2,angle,yaw:0};x+=b.w+5;return q});restackButton.classList.add('holding');restackButton.setAttribute('aria-pressed','true');restackFrame=requestAnimationFrame(restackStep)}
function restackStep(now){if(!restacking)return;const p=Math.min(1,(now-restackStart)/1600),e=p*p*(3-2*p);restackButton.style.setProperty('--progress',p*100+'%');bodies.forEach((b,i)=>{const f=restackFrom[i],q=restackTargets[i];b.x=f.x+(q.x-f.x)*e;b.y=f.y+(q.y-f.y)*e;b.angle=f.angle+shortest(f.angle,q.angle)*e;b.yaw=f.yaw+shortest(f.yaw,0)*e;b.vx=b.vy=b.spin=b.yawVelocity=0;drawBody(b)});if(p<1)restackFrame=requestAnimationFrame(restackStep);else{endRestack(true)}}
function endRestack(complete=false){if(!restacking)return;restacking=false;cancelAnimationFrame(restackFrame);restackButton.classList.remove('holding');restackButton.style.removeProperty('--progress');restackButton.setAttribute('aria-pressed','false');if(complete)resetBooks();else wake()}
let pressTime=0,pressTimer=0,pressed=false;
function pressRestack(){if(pressed||activeDrag||dialog.open)return;pressed=true;pressTime=performance.now();pressTimer=setTimeout(()=>{if(pressed)beginRestack()},220)}
function releaseRestack(cancel=false){if(!pressed)return;pressed=false;clearTimeout(pressTimer);if(restacking)endRestack();else if(!cancel&&performance.now()-pressTime<240)resetBooks()}
restackButton.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();restackButton.setPointerCapture(e.pointerId);pressRestack()};
restackButton.onpointerup=()=>releaseRestack();restackButton.onpointercancel=()=>releaseRestack(true);restackButton.onlostpointercapture=()=>releaseRestack(true);
restackButton.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)pressRestack()}};restackButton.onkeyup=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();releaseRestack()}};restackButton.onblur=()=>releaseRestack(true);restackButton.onclick=e=>{if(e.detail===0&&!pressed&&!restacking&&e.isTrusted)resetBooks()};
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(!dialog.open)resetBooks()},150)});

function open(b,el){if(dialog.open)return;cardMoving=false;book=b;origin=el;mode='front';lift=0;busy=false;dialog.style.setProperty('--edition',b.colour);el.style.visibility='hidden';const shadowBody=bodies.find(x=>x.el===el);if(shadowBody?.shadow)shadowBody.shadow.style.visibility='hidden';dialog.showModal();render();stage.classList.add('arrive')}
function close(){if(!dialog.open)return;if(reduced()){dialog.close();return}stage.classList.add('returning');setTimeout(()=>{if(dialog.open)dialog.close()},240)}
dialog.addEventListener('close',()=>{if(origin){origin.style.visibility='';const restored=bodies.find(x=>x.el===origin);if(restored)drawBody(restored);origin.focus()}stage.innerHTML='';stage.className='stage';busy=false;wake()});$('#return').onclick=close;
function barcode(b=book){return '<div class="barcode"><svg viewBox="0 0 100 30" aria-hidden="true">'+Array.from({length:27},(_,i)=>'<rect x="'+(3+i*3.4)+'" width="'+[1,2,1.5,2.5][i%4]+'" height="29" fill="#191917"/>').join('')+'</svg>'+esc(b.id)+'</div>'}
function front(b=book){return '<div class="face front" role="button" tabindex="0" aria-label="Open book"><div class="arch"><svg viewBox="0 0 100 80"><path d="M6 75V48Q6 26 50 4Q94 26 94 48V75Z" fill="#191917"/><path d="M9 72V48Q9 27 50 7Q91 27 91 48V72Z" fill="#f8eacb"/><g fill="#191917" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle"><text x="50" y="47" font-size="12" textLength="69" lengthAdjust="spacingAndGlyphs">ROSEVILLE</text><text x="50" y="61" font-size="12.5" letter-spacing="1">BOOKS</text></g></svg></div><div class="band"></div><div class="author">'+esc(b.author.toUpperCase())+'</div><div class="titlefit"><span>'+esc(b.title.toUpperCase())+'</span></div><div class="rule"></div><div class="subtitle">'+esc((b.subtitle||'').toUpperCase())+'</div>'+mark()+tolstoyWear(b)+'</div>'}
function miniBack(b){const q=b.quotes||[];return '<div class="mini-back-copy"><p>'+esc(b.blurb)+'</p>'+q.slice(0,2).map(x=>'<blockquote>“'+esc(x.quote)+'”<small>'+esc(x.name)+'</small></blockquote>').join('')+'</div><div class="mini-back-footer">'+mark()+barcode(b)+'</div>'}
function cardMini(){const r=records.get(book.id);return '<div class="cardmini" tabindex="0" aria-label="Pull out reading card"><div class="cardid">'+esc(book.id)+'</div><div class="field"><b>AUTHOR</b><span class="typed-value">'+esc(book.author)+'</span></div><div class="field"><b>TITLE</b><span class="typed-value">'+esc(book.title)+'</span></div><table><thead><tr><th>Started</th><th>Reader’s name</th><th>Finished</th></tr></thead><tbody><tr><td>27 NOV</td><td>President Nel</td><td></td></tr>'+(r?'<tr><td>'+esc(r.started)+'</td><td>'+esc(r.name)+'</td><td>'+esc(r.finished||'')+'</td></tr>':'<tr><td></td><td><button class="addrow" id="add">+ Add name</button></td><td></td></tr>')+Array.from({length:5},()=>'<tr><td>&nbsp;</td><td></td><td></td></tr>').join('')+'</tbody></table></div><div class="pocket-backing" aria-hidden="true"></div><div class="pocket"><span class="pocket-imprint">ROSEVILLE BOOK CLUB</span></div><div class="pocketnote">Reading record</div>'}
function page(content,n,cls=''){return '<article class="page '+cls+'" tabindex="0" aria-label="'+(cls.includes('pocketpage')?'Inside front cover':'Page '+(n||''))+'">'+content+(n?'<span class="num">'+n+'</span>':'')+'</article>'}
function spread(left,right){return '<div class="spread">'+left+right+'</div>'}
function access(){return ((book.access||[]).filter(x=>safeUrl(x.url)).map(x=>'<p><a class="accesslink" href="'+esc(safeUrl(x.url))+'" target="_blank" rel="noopener noreferrer">'+esc(x.label.trim().replace(/\s*\S+$/,''))+(x.label.trim().includes(' ')?' ':'')+'<span class="access-tail">'+esc(x.label.trim().split(/\s+/).pop())+'<svg class="external-arrow-icon" viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12 12 4 M5.5 4H12v6.5"/></svg></span></a></p>').join('')||'<p>Details to be advised.</p>')}
function hasContext(){return !!(book.author_bio||(book.excerpt_quotes||[]).length||(book.further_reading||[]).length)}
function next(){return mode==='front'?'inside':mode==='inside'?(hasContext()?'context':'access'):mode==='context'?'access':mode==='access'?'back':'front'}
function prev(){return mode==='back'?'access':mode==='access'?(hasContext()?'context':'inside'):mode==='context'?'inside':mode==='inside'?'front':'back'}
function dateStamp(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return '';const d=new Date(value+'T12:00:00Z');return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('en-AU',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(d).toUpperCase()}
function libraryStamp(b){const started=dateStamp(b.club_started),finished=dateStamp(b.completed);const n=Array.from(b.id||'').reduce((s,c)=>s+c.charCodeAt(0),0)%3;return '<div class="library-impression stamp-variant-'+n+'"><div class="postal-imprint"><svg class="stamp-hero" viewBox="0 0 190 130" role="img" aria-label="Roseville Book Club library stamp"><defs><filter id="hero-ink"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.2126 -.7152 -.0722 0 1" result="dark"/><feComposite in="dark" in2="SourceAlpha" operator="in" result="ink"/><feFlood flood-color="#435267"/><feComposite in2="ink" operator="in"/></filter></defs><g fill="none" stroke="#435267"><ellipse cx="95" cy="65" rx="91" ry="60" stroke-width="3.2" stroke-dasharray="120 1.2 83 1.8 105 1.3 160"/><ellipse cx="95" cy="65" rx="85" ry="54" stroke-width=".75" opacity=".7"/></g><g fill="#435267" text-anchor="middle" font-family="Georgia, serif" font-weight="bold"><text x="95" y="33" font-size="12.5" letter-spacing="2">ROSEVILLE</text><text x="95" y="108" font-size="12" letter-spacing="1.8">BOOK CLUB</text></g><image href="../assets/church-day-unlit.png" x="26" y="35" width="138" height="61" preserveAspectRatio="xMidYMid meet" filter="url(#hero-ink)"/></svg></div>'+ ('<div class="stamp-date">DATE COMMENCED<br>'+ (started?esc(started):'<span class="date-pending">— — —</span>')+'</div>')+(finished?'<div class="stamp-date">FINISHED &nbsp;'+esc(finished)+'</div>':'')+'</div>'}
function render(){stage.className='stage';stage.style.setProperty('--tolstoy-shadow',book?.id==='RBC0001'?'none':'initial');controls.innerHTML='';const b=book,quotes=b.quotes||[],backQuotes=quotes;if(mode==='front')stage.innerHTML=front();
else if(mode==='back')stage.innerHTML='<div class="face back" tabindex="0" aria-label="Back cover"><div class="backcopy"><p>'+esc(b.blurb)+'</p>'+(backQuotes.length?'<hr>'+backQuotes.slice(0,3).map(q=>'<blockquote>“'+esc(q.quote)+'”<small>'+esc(q.name.toUpperCase())+'</small></blockquote>').join(''):'')+'</div><div class="bookfooter">'+mark()+'<div><strong>ROSEVILLE</strong>BOOK CLUB</div><div class="middle">FROM THE<br>BOOKSHELF</div>'+barcode()+'</div>'+tolstoyWear(b,'back')+'</div>';
else if(mode==='inside')stage.innerHTML=spread(page(cardMini(),0,'pocketpage'),page('<small>'+esc(b.author.toUpperCase())+'</small><h2>'+esc(b.title)+'</h2><em>'+esc(b.subtitle)+'</em><div class="dedication">'+esc(b.reason)+'</div><div class="imprint">ROSEVILLE BOOKS</div>',1,'titlepage'));
else if(mode==='context'){const excerpts=b.excerpt_quotes||[],related=b.further_reading||[];stage.innerHTML=spread(page('<h2>About the author</h2><div class="bio-name">'+esc(b.author)+'</div>'+(b.author_dates?'<small class="bio-dates">'+esc(b.author_dates)+'</small>':'')+(b.author_bio?'<p>'+esc(b.author_bio)+'</p>':''),2,'contextpage'),page(excerpts.length?'<h2 class="quote-heading">Words that stayed with us</h2>'+excerpts.slice(0,3).map(q=>'<blockquote>“'+esc(q.quote)+'”<cite>'+esc(q.name)+'</cite></blockquote>').join(''):'<h2>Further reading</h2>'+related.slice(0,4).map(q=>'<p>'+esc(q.title)+'</p>').join(''),3,'contextpage'))}
else if(mode==='access')stage.innerHTML=spread(page('<h2>Find a copy</h2>'+access(),hasContext()?4:2,'accesspage'),page(libraryStamp(b),0,'endpaper'));
if(b.id==='RBC0001'&&(mode==='front'||mode==='back')){const face=stage.querySelector('.face');if(face)face.style.setProperty('box-shadow','none','important')}if(mode==='inside')wireCard();else if(lift>0&&stage.querySelector('.spread')){const peek=document.createElement('div');peek.className='card-peek';peek.setAttribute('aria-hidden','true');peek.inert=true;peek.innerHTML=cardMini();peek.querySelectorAll('.pocket,.pocketnote,.pocket-backing').forEach(n=>n.remove());peek.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));peek.style.setProperty('--lift',-lift+'px');stage.querySelector('.spread').append(peek)}fitAll()}
let cloneSerial=0;
function go(target){
 if(busy||cardMoving||!dialog.open||target===mode)return;
 const oldMode=mode,oldSpread=stage.querySelector('.spread'),oldFace=stage.querySelector('.face');
 const forward=target===next();
 function copy(node){if(!node)return null;const c=node.cloneNode(true),src=[node,...node.querySelectorAll('*')],dst=[c,...c.querySelectorAll('*')],ids=new Map();const token='turn-'+(++cloneSerial)+'-';
for(const n of dst){if(n.hasAttribute('id')){const id=n.getAttribute('id');if(n.namespaceURI==='http://www.w3.org/2000/svg'){ids.set(id,token+id);n.setAttribute('id',token+id)}else n.removeAttribute('id')}}
for(const n of dst)for(const a of Array.from(n.attributes)){let v=a.value;for(const [old,fresh] of ids){v=v.replaceAll('url(#'+old+')','url(#'+fresh+')');if(v==='#'+old)v='#'+fresh}if(v!==a.value)n.setAttribute(a.name,v)}
// Freeze the actual computed typography, padding and line layout of every
// HTML descendant, rather than inheriting different styles in the animation wrapper.
const keys=['display','boxSizing','fontFamily','fontSize','fontStyle','fontWeight','fontVariant','fontStretch','fontKerning','fontFeatureSettings','fontSynthesis','lineHeight','letterSpacing','wordSpacing','textAlign','textTransform','textIndent','whiteSpace','overflowWrap','wordBreak','color','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopStyle','borderRightStyle','borderBottomStyle','borderLeftStyle','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','backgroundColor','backgroundImage','backgroundSize','backgroundBlendMode','justifyContent','alignItems','flexDirection','gap','verticalAlign','textDecorationLine','textDecorationColor','textDecorationThickness','textUnderlineOffset'];
for(let i=0;i<src.length;i++){if(!(src[i] instanceof HTMLElement))continue;const style=getComputedStyle(src[i]);for(const k of keys)dst[i].style[k]=style[k];if(src[i].matches('.external-arrow-icon,.access-tail'))dst[i].style.whiteSpace='nowrap'}
if(node.matches('.page')){c.style.width=node.offsetWidth+'px';c.style.height=node.offsetHeight+'px';c.style.maxWidth='none';c.style.maxHeight='none';c.style.minWidth='0';c.style.minHeight='0';c.style.flexShrink='0';c.style.transformOrigin='0 0'}
c.inert=true;c.setAttribute('aria-hidden','true');return c}
 const turning=copy(oldSpread?.children[forward?1:0]),stationary=copy(oldSpread?.children[forward?0:1]),cover=copy(oldFace);
 const oldRect=oldFace?.getBoundingClientRect();const oldW=oldFace?.offsetWidth,oldH=oldFace?.offsetHeight;
 mode=target;render();const dest=stage.querySelector('.spread');if(reduced()||!dest)return;
 const receiving=dest.children[forward?0:1];
 if(oldMode==='front'&&cover){
  busy=true;dest.classList.add('cover-opening');
  const leaf=document.createElement('div');leaf.className='cover-opening-leaf';
  const f=document.createElement('div');f.className='sheet-side';f.append(cover);
  const back=document.createElement('div');back.className='sheet-side backside';back.append(copy(receiving));
  leaf.append(f,back);receiving.style.visibility='hidden';dest.append(leaf);
  const right=dest.children[1],r=right.getBoundingClientRect();if(oldW&&oldH){cover.style.width=oldW+'px';cover.style.height=oldH+'px';cover.style.maxWidth='none';cover.style.maxHeight='none';cover.style.transformOrigin='0 0';cover.style.transform='scale('+f.clientWidth/oldW+','+f.clientHeight/oldH+')';}
  // The right-hand page block starts exactly where the closed cover was.
  // Scale about its own centre, then move the hinge to the spread's final centre.
  const scale=oldRect?oldRect.width/r.width:1;
  const dx=oldRect?oldRect.left+oldRect.width/2-r.left-r.width/2: -r.width/2;
  const dy=oldRect?oldRect.top+oldRect.height/2-r.top-r.height/2:0;
  dest.style.transformOrigin='75% 50%';
  const motion=dest.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+scale+')'},{transform:'none'}],{duration:650,easing:'cubic-bezier(.35,.02,.24,1)'});
  const anim=leaf.animate([{transform:'rotateY(0deg)'},{transform:'rotateY(-180deg)'}],{duration:650,easing:'cubic-bezier(.35,.02,.24,1)',fill:'forwards'});
  const done=()=>{if(!leaf.isConnected)return;receiving.style.visibility='';dest.classList.remove('cover-opening');dest.style.transformOrigin='';leaf.remove();busy=false};
  anim.onfinish=done;setTimeout(done,780);return
 }
 if(turning){
  busy=true;const leaf=document.createElement('div'),under=document.createElement('div');
  leaf.className='page-turn-sheet '+(forward?'forward':'reverse');
  under.className='stationary-leaf '+(forward?'left':'right');under.inert=true;under.setAttribute('aria-hidden','true');if(stationary)under.append(stationary);else under.classList.add('empty-leaf');
  const f=document.createElement('div');f.className='sheet-side';f.append(turning);
  const back=document.createElement('div');back.className='sheet-side backside';back.append(copy(receiving));leaf.append(f,back);receiving.style.visibility='hidden';dest.append(under,leaf);
  const done=()=>{if(!leaf.isConnected)return;receiving.style.visibility='';under.remove();leaf.remove();busy=false};leaf.addEventListener('animationend',done,{once:true});setTimeout(()=>{if(leaf.isConnected)done()},800)
 }
}
function centerPocket(){const p=stage.querySelector('.pocketpage'),c=p?.querySelector('.cardmini'),e=p?.querySelector('.pocket'),back=p?.querySelector('.pocket-backing');if(!p||!c||!e||!back)return;const height=Math.min(p.clientHeight*.38,c.offsetHeight*.52);e.style.height=height+'px';back.style.height=(height*1.53)+'px';const bottom=Math.max(p.clientHeight*.06,(p.clientHeight-c.offsetHeight-height*.05)/2);e.style.bottom=back.style.bottom=bottom+'px';c.style.bottom=(bottom+height*.05)+'px'}
function wireCard(){const card=stage.querySelector('.pocketpage .cardmini');if(!card)return;centerPocket();let start=null,moved=false;card.style.setProperty('--lift','0px');card.onpointerdown=e=>{if(e.target.closest('button'))return;e.stopPropagation();start={x:e.clientX,y:e.clientY};moved=false;card.setPointerCapture(e.pointerId);card.style.transition='none'};card.onpointermove=e=>{if(!start)return;const delta=start.y-e.clientY;if(Math.abs(delta)>4)moved=true;card.style.setProperty('--lift',-Math.max(0,Math.min(card.offsetHeight*.25,delta))+'px')};card.onpointerup=e=>{if(!start)return;e.stopPropagation();const delta=start.y-e.clientY;start=null;card.style.transition='';if(!moved||delta>8)extractCard();else card.style.setProperty('--lift','0px')};card.onpointercancel=()=>{start=null;card.style.transition='';card.style.setProperty('--lift','0px')};card.onkeydown=e=>{if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();extractCard()}};card.onclick=e=>e.stopPropagation();const add=card.querySelector('#add');if(add)add.onclick=e=>{e.stopPropagation();extractCard().then(()=>{if(stage.querySelector('.card-extracted'))signup()})};}
let cardMoving=false;
function cardFlight(el,from,to,duration){if(reduced())return Promise.resolve();const dx=from.left+from.width/2-to.left-to.width/2,dy=from.top+from.height/2-to.top-to.height/2;return el.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+from.width/to.width+','+from.height/to.height+')'},{transform:'none'}],{duration,easing:'cubic-bezier(.3,.05,.25,1)'}).finished.catch(()=>{})}
async function extractCard(){if(cardMoving||stage.querySelector('.card-extracted'))return;const source=stage.querySelector('.pocketpage .cardmini'),pocket=stage.querySelector('.pocketpage .pocket');if(!source||!pocket)return;cardMoving=true;const original=source.getBoundingClientRect(),mouth=pocket.getBoundingClientRect().top;const amount=Math.max(0,original.bottom-mouth+5);const oldTransform=getComputedStyle(source).transform;source.style.transition='none';source.style.setProperty('--lift','0px');const base=source.getBoundingClientRect();const raise=Math.max(0,base.bottom-mouth+5);if(!reduced())await source.animate([{transform:oldTransform},{transform:'translateY('+(-raise)+'px)'}],{duration:260,easing:'ease-out',fill:'forwards'}).finished.catch(()=>{});if(!source.isConnected){cardMoving=false;return}source.style.transform='translateY('+(-raise)+'px)';source.getAnimations().forEach(a=>a.cancel());const from={left:base.left,top:base.top-raise,width:base.width,height:base.height};const overlay=document.createElement('div');overlay.className='card-extracted';overlay.setAttribute('role','group');overlay.setAttribute('aria-label','Extracted reading card');const holder=document.createElement('div');holder.className='card-holder';holder.innerHTML='<div class="card-turn">'+cardMini()+'<div class="cardmini card-reverse" inert aria-hidden="true"></div></div>';holder.querySelectorAll('.pocket,.pocketnote,.pocket-backing').forEach(n=>n.remove());holder.querySelector('.cardmini').classList.add('card-front');source.querySelectorAll('[id]').forEach(n=>{n.dataset.originalId=n.id;n.removeAttribute('id')});source.style.visibility='hidden';overlay.append(holder);stage.append(overlay);const card=holder.querySelector('.cardmini');const to=card.getBoundingClientRect();await cardFlight(holder,from,to,300);cardMoving=false;const corner=document.createElement('button');corner.className='card-dogear';corner.type='button';corner.setAttribute('aria-label','Turn card over');corner.innerHTML='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13a7 7 0 1 1 7 7M5 8v5h5"/></svg>';card.append(corner);corner.onclick=e=>{e.stopPropagation();signup()};overlay.onclick=e=>{if(e.target===overlay)reinsertCard()};const add=card.querySelector('#add');if(add)add.onclick=e=>{e.stopPropagation();signup()};card.focus({preventScroll:true})}
async function reinsertCard(){
 if(cardMoving)return;
 const overlay=stage.querySelector('.card-extracted'),source=stage.querySelector('.pocketpage .cardmini'),pocket=stage.querySelector('.pocketpage .pocket');if(!overlay||!source||!pocket)return;
 cardMoving=true;overlay.style.pointerEvents='none';
 const holder=overlay.querySelector('.card-holder'),card=holder.querySelector('.card-front');if(holder.classList.contains('reversed')){holder.classList.remove('reversed');if(!reduced())await new Promise(r=>setTimeout(r,380))}
 const from=holder.getBoundingClientRect();
 source.style.visibility='hidden';source.style.transition='none';source.getAnimations().forEach(a=>a.cancel());source.style.transform='none';source.style.setProperty('--lift','0px');
 const base=source.getBoundingClientRect(),raise=Math.max(0,base.bottom-pocket.getBoundingClientRect().top+5);
 // The single temporary card moves above the pocket, shrinks, then slides down.
 // It is a child of the pocket page so the actual envelope occludes it.
 const page=source.parentElement,pr=page.getBoundingClientRect(),flight=source.cloneNode(true);
 flight.removeAttribute('id');flight.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));flight.inert=true;flight.setAttribute('aria-hidden','true');
 flight.style.cssText='position:absolute;left:'+(base.left-pr.left)+'px;top:'+(base.top-pr.top)+'px;bottom:auto;width:'+base.width+'px;height:'+base.height+'px;visibility:visible;transform-origin:center;transition:none;pointer-events:none;z-index:2;';
 page.append(flight);
 const sx=from.width/base.width,sy=from.height/base.height,dx=from.left+from.width/2-base.left-base.width/2,dy=from.top+from.height/2-base.top-base.height/2;
 // Cover the miniature flight with the expanded card until the first leg starts.
 flight.style.transform='translate('+dx+'px,'+dy+'px) scale('+sx+','+sy+')';
 overlay.remove();
 if(!reduced()){const anim=flight.animate([{transform:flight.style.transform,offset:0},{transform:'translateY('+(-raise)+'px)',offset:.53},{transform:'translateY(0px)',offset:1}],{duration:620,easing:'ease-in-out',fill:'forwards'});await anim.finished.catch(()=>{})}
 if(!source.isConnected){flight.remove();cardMoving=false;return}
 source.style.transform='none';source.style.setProperty('--lift','0px');source.style.visibility='visible';flight.remove();
 source.querySelectorAll('[data-original-id]').forEach(n=>{n.id=n.dataset.originalId;delete n.dataset.originalId});wireCard();cardMoving=false;
 requestAnimationFrame(()=>{if(source.isConnected)source.style.transition=''})
}
function setCardSide(holder,back){if(!holder||cardMoving)return;const turn=holder.querySelector('.card-turn'),front=holder.querySelector('.card-front'),reverse=holder.querySelector('.card-reverse');holder.classList.toggle('reversed',back);front.inert=back;reverse.inert=!back;front.setAttribute('aria-hidden',String(back));reverse.setAttribute('aria-hidden',String(!back));}
function signup(){const holder=stage.querySelector('.card-holder');if(!holder||cardMoving)return;const card=holder.querySelector('.card-front'),reverse=holder.querySelector('.card-reverse');if(!reverse.querySelector('form')){reverse.innerHTML='<div class="cardid">'+esc(book.id)+'</div><h3>Sign the card</h3><form><label>Name<input required maxlength="30" name="display" autocomplete="off"></label><label>Email<input required type="email" name="email" autocomplete="off"></label><label class="consent"><input type="checkbox" name="consent" required><span>Show my name on the reading card</span></label><label class="consent"><input type="checkbox" name="updates"><span>Book Club emails</span></label><button class="action">Sign &amp; date</button></form><button class="card-flip-back" type="button" aria-label="Return to reading record"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13a7 7 0 1 1 7 7M5 8v5h5"/></svg></button>';reverse.querySelector('.card-flip-back').onclick=()=>setCardSide(holder,false);reverse.querySelector('form').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target),name=String(d.get('display')).trim();if(!name)return;records.set(book.id,{name,started:today(),finished:''});const row=card.querySelector('#add')?.closest('tr');if(row){row.innerHTML='<td>'+esc(today())+'</td><td>'+esc(name)+'</td><td></td>'}syncPocketCard();e.target.reset();if(document.activeElement instanceof HTMLElement)document.activeElement.blur();setCardSide(holder,false)}}setCardSide(holder,true)}
function syncPocketCard(){const source=stage.querySelector('.pocketpage .cardmini');if(source){const fresh=document.createElement('div');fresh.innerHTML=cardMini();source.innerHTML=fresh.querySelector('.cardmini').innerHTML;source.querySelectorAll('[id]').forEach(n=>{n.dataset.originalId=n.id;n.removeAttribute('id')})}}
let pointer=null,ignoreClick=false;
stage.addEventListener('pointerdown',e=>{if(e.target.closest('.cardmini,.signpop,.card-extracted,button,input,a'))return;pointer={x:e.clientX,y:e.clientY}});
stage.addEventListener('pointerup',e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){ignoreClick=true;go(dx<0?next():prev());setTimeout(()=>ignoreClick=false,350)}});
stage.addEventListener('click',e=>{if(ignoreClick||busy||cardMoving||e.target.closest('.cardmini,.signpop,.card-extracted,button,input,a'))return;if(e.target===stage){const popup=stage.querySelector('.signpop');if(popup)popup.remove();else close();return}const page=e.target.closest('.page');if(page){go(page===page.parentElement.firstElementChild?prev():next());return}if(e.target.closest('.face'))go(next())});
stage.addEventListener('keydown',e=>{if(stage.querySelector('.card-extracted')){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();const holder=stage.querySelector('.card-holder');if(holder?.classList.contains('reversed'))setCardSide(holder,false);else reinsertCard()}return}if(e.target.closest('input,button,.cardmini,.signpop,a'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'||e.key==='Enter'||e.key===' '){e.preventDefault();go(e.key==='ArrowLeft'?prev():next())}});
window.addEventListener('resize',fitAll);document.querySelector('.menu').onclick=e=>{const v=document.querySelector('nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(v));e.currentTarget.setAttribute('aria-label',v?'Close menu':'Open menu')};
try{document.body.classList.toggle('night',sessionStorage.getItem('roseville-night-mode')==='1')}catch{}
const footerHome=document.querySelector('.footer-home');let footerTimer=0,lastIconTap=0;footerHome?.addEventListener('click',e=>{if(!e.target.closest('.footer-mark'))return;e.preventDefault();const now=Date.now();if(now-lastIconTap<500){clearTimeout(footerTimer);lastIconTap=0;const night=!document.body.classList.contains('night');try{sessionStorage.setItem('roseville-night-mode',night?'1':'0')}catch{}location.href='../';return}lastIconTap=now;footerTimer=setTimeout(()=>{location.href='../'},510)});
fetch('../assets/site-content.json').then(r=>r.ok?r.json():null).then(data=>{const d=data?.details,a=document.querySelectorAll('footer .contact-details a');if(!d||a.length!==3)return;if(d.address){a[0].textContent=d.address;a[0].href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(d.address)}if(d.email){a[1].textContent=d.email;a[1].href='mailto:'+d.email}if(d.phone){a[2].textContent=d.phone;a[2].href='tel:'+Array.from(d.phone).filter(c=>'+0123456789'.includes(c)).join('')}}).catch(()=>{});
document.querySelector('.parent-link')?.addEventListener('click',e=>{try{const ref=new URL(document.referrer);if(ref.origin===location.origin&&ref.pathname.replace(/[/]$/,'').endsWith('/community')){e.preventDefault();history.back()}}catch{}});


function revealBookworm(b){
 if(b.wormActive||b.wormDone||restacking||dialog.open)return;
 b.wormActive=true;
 const hole=b.el.querySelector('.worm-hole'),ns='http://www.w3.org/2000/svg',art=document.createElementNS(ns,'svg');
 art.setAttribute('width','100%');art.setAttribute('height','100%');art.setAttribute('aria-hidden','true');
 Object.assign(art.style,{position:'absolute',inset:'0',overflow:'visible',pointerEvents:'none',zIndex:'10000',opacity:'1',mixBlendMode:'normal'});
 const make=(tag)=>{const e=document.createElementNS(ns,tag);art.append(e);return e};
 const backing=make('path'),body=make('path'),stripes=make('path'),eye=make('circle');
 // Explicit opaque paint and top layer, including Safari SVG compositing.
 art.style.setProperty('isolation','isolate');art.style.setProperty('z-index','2147483000','important');
 body.style.setProperty('fill','#f3f0e7','important');body.style.setProperty('fill-opacity','1','important');body.style.setProperty('opacity','1','important');body.style.setProperty('mix-blend-mode','normal','important');
 const ink='#514e48',paper='#f3f0e7';
 backing.style.cssText='fill:'+paper+' !important;fill-opacity:1 !important;stroke:'+paper+' !important;stroke-width:.72px !important;stroke-linejoin:round !important;opacity:1 !important;mix-blend-mode:normal !important;';backing.setAttribute('fill-rule','nonzero');
 body.setAttribute('fill',paper);body.setAttribute('fill-opacity','1');body.setAttribute('stroke',ink);body.setAttribute('stroke-width','.72');body.setAttribute('stroke-linejoin','round');body.setAttribute('fill-rule','nonzero');
 stripes.setAttribute('fill','none');stripes.setAttribute('stroke',ink);stripes.setAttribute('stroke-width','.43');stripes.setAttribute('stroke-linecap','round');eye.setAttribute('fill',ink);field.append(art);
 const scale=b.w/110,width=Math.max(3.8,7*scale),radius=width/2,len=67*scale,t0=performance.now();
 let pausedAt=null,pausedTotal=0,forceExit=false,lastHead=null,lastFacing=-1,lastPoints=null,homeRoute=null,seenAppleThrow=b.appleThrowCount||0,pendingApple=false;
 body.style.setProperty('pointer-events','all');body.style.cursor='pointer';body.style.touchAction='none';
 stripes.style.pointerEvents=eye.style.pointerEvents=backing.style.pointerEvents='none';
 body.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();if(pausedAt===null)pausedAt=performance.now()});
 body.addEventListener('click',e=>{e.stopPropagation();e.preventDefault()});
 const resumeOnThrow=()=>{if(pausedAt===null)return;pausedTotal+=performance.now()-pausedAt;pausedAt=null;forceExit=true};
 field.addEventListener('bookworm-book-thrown',resumeOnThrow);
 const cleanup=()=>{field.removeEventListener('bookworm-book-thrown',resumeOnThrow);art.remove();b.wormActive=false};
 const booksNow=()=>bodies.filter(q=>q.kind!=='apple');
 const nearest=()=>booksNow().reduce((best,q)=>!best||Math.abs(q.x-b.x)<Math.abs(best.x-b.x)?q:best,null);
 const target=nearest();let dir=target&&target.x>b.x?1:-1;
 const localX=b.biteFinished?Number(hole.getAttribute('cx')):(dir*Math.cos(b.angle)>0?76:24);
 hole.setAttribute('cx',String(localX));hole.setAttribute('cy','53');
 let firstContact=null,grounded=null,rest=null,leave=null,escapeX=null,escapeDir=dir;
 const clamp01=x=>Math.max(0,Math.min(1,x));
 function anchor(){const svg=b.el.querySelector('svg'),m=svg.getScreenCTM(),world=art.getScreenCTM();if(m&&world){const p=art.createSVGPoint();p.x=localX;p.y=53;const q=p.matrixTransform(m).matrixTransform(world.inverse());return [q.x,q.y]}const u=(localX-50)*b.w/110,v=-2*b.h/110,c=Math.cos(b.angle),s=Math.sin(b.angle);return [b.x+u*c-v*s,b.y+u*s+v*c]}
 function openingRadius(){const m=b.el.querySelector('svg').getScreenCTM(),world=art.getScreenCTM();if(m&&world){const t=world.inverse().multiply(m),unit=Math.hypot(t.a,t.b);if(unit>0)return radius/unit}return radius/scale}
 function draw(points,facing,emerging=false,inside=false){
  lastPoints=points.map(p=>p.slice());
  const normals=points.map((p,i)=>{const u=points[Math.max(0,i-1)],v=points[Math.min(points.length-1,i+1)],dx=v[0]-u[0],dy=v[1]-u[1],m=Math.hypot(dx,dy)||1;return [-dy/m,dx/m]});
  const edges=[1,-1].map(sign=>points.map((p,i)=>{const rr=radius*(emerging?1:(.76+.24*Math.min(1,i/4)));return [p[0]+normals[i][0]*rr*sign,p[1]+normals[i][1]*rr*sign]}));
  const fmt=p=>p[0].toFixed(2)+' '+p[1].toFixed(2),n=points.length-1; const headTip=[points[n][0]+normals[n][1]*radius,points[n][1]-normals[n][0]*radius],tailRadius=radius*(emerging?1:.76),tailTip=[points[0][0]-normals[0][1]*tailRadius,points[0][1]+normals[0][0]*tailRadius];
  body.setAttribute('d','M'+edges[0].map(fmt).join(' L')+' Q'+fmt([edges[0][n][0]+normals[n][1]*radius,edges[0][n][1]-normals[n][0]*radius])+' '+fmt(headTip)+' Q'+fmt([edges[1][n][0]+normals[n][1]*radius,edges[1][n][1]-normals[n][0]*radius])+' '+fmt(edges[1][n])+' L'+edges[1].slice(0,n).reverse().map(fmt).join(' L')+' A'+tailRadius+' '+tailRadius+' 0 0 0 '+fmt(edges[0][0])+' Z');
  backing.setAttribute('d',body.getAttribute('d'));
  // Stripe spacing follows the body, not the number of visible path samples.
  let marks='',distance=0,nextStripe=radius*2.5,lastMark=null;
  for(let i=n;i>0;i--){const p=points[i],q=points[i-1],seg=Math.hypot(p[0]-q[0],p[1]-q[1]);if(seg<.0001)continue;
   while(nextStripe<=distance+seg){const f=(nextStripe-distance)/seg;if(i>1||f<.7){const blend=(u,v)=>[u[0]+(v[0]-u[0])*f,u[1]+(v[1]-u[1])*f],c=blend(p,q),l=blend(edges[0][i],edges[0][i-1]),r=blend(edges[1][i],edges[1][i-1]);if(!lastMark||Math.min(Math.hypot(l[0]-lastMark.l[0],l[1]-lastMark.l[1]),Math.hypot(r[0]-lastMark.r[0],r[1]-lastMark.r[1]))>radius*.85){marks+='M'+fmt(l)+' Q'+fmt([c[0]+facing*radius*.25,c[1]])+' '+fmt(r);lastMark={l,r}}}nextStripe+=radius*2.3}distance+=seg}
  stripes.setAttribute('d',marks);
  const h=points[n];lastHead=h[0];lastFacing=facing;eye.style.visibility=inside?'hidden':'visible';eye.setAttribute('r',String(Math.max(.43,scale*.68)));eye.setAttribute('cx',String(h[0]+facing*radius*.24));eye.setAttribute('cy',String(h[1]-radius*.17));
 }
 // Use a rounded, clearance-offset contour of grounded displaced books.
 // A moving airborne book is never a climbing surface.
 const passedObstacles=new Map();
 function terrain(floor,hx,facing){
  const obstacles=[];
  for(const q of booksNow()){
   if(q.displayRest||q.drag||Math.hypot(q.vx,q.vy)>=45||Math.abs(q.spin)>=.65){passedObstacles.delete(q);continue}
   const e=extent(q);if(e.b<floor-radius*2||e.t>=floor-radius){passedObstacles.delete(q);continue}
   // Only low, fallen books with a reachable exterior edge can be climbed.
   // A standing book, even if nudged out of its display pose, is passed on
   // the shelf instead of treating its entire front face as a ramp.
   const rise=floor-(e.t-radius),upright=Math.abs(Math.cos(q.angle))>.72;
   if(upright||rise>len*.72){passedObstacles.set(q,{x:q.x,y:q.y,angle:q.angle,facing,ignore:true});continue}
   const previous=passedObstacles.get(q),entry=facing<0?e.r:e.l,exit=facing<0?e.l:e.r;
   // Reassess only if a book has actually been displaced or direction changes.
   const moved=!previous||previous.facing!==facing||Math.abs(previous.x-q.x)>radius*2||Math.abs(previous.y-q.y)>radius*2||Math.abs(previous.angle-q.angle)>.2;
   let state=previous;
   if(moved){state={x:q.x,y:q.y,angle:q.angle,facing,ignore:(hx-entry)*facing>=-radius*.5};passedObstacles.set(q,state)}
   // Once the head has passed an ignored object's far edge, the body
   // continues on the original floor path; never lift it onto that book.
   if(state.ignore)continue;
   obstacles.push({poly:corners(q),e});
  }
  const pad=Math.max(radius*2.5,5);
  return x=>{let y=floor;for(const {poly,e} of obstacles){
   const sx=Math.max(e.l+.001,Math.min(e.r-.001,x)),d=Math.abs(x-sx);
   if(d>pad*2)continue;
   const top=verticalSpan(poly,sx).top;if(!Number.isFinite(top))continue;
   const f=clamp01(1-d/(pad*2)),ease=f*f*(3-2*f);
   y=Math.min(y,floor+(Math.min(floor,top-radius)-floor)*ease);
  }return y}
 }
 let routeState=null;
 function gait(head,floor,k,facing,idle=false){
  const phase=k*2*Math.PI/1.05,arch=idle?0:(1-Math.cos(phase))/2;
  // Record the head's actual route; the rear may only follow that route,
  // never discover a new obstacle or climb independently.
  if(!routeState||routeState.facing!==facing){
   const x=routeState?routeState.x:head,y=routeState?routeState.y:floor;
   const start=routeState&&routeState.facing!==facing?x-facing*len:x;
   routeState={facing,nominal:head,x:start,y,trail:[]};
   for(let i=80;i>=0;i--)routeState.trail.push([start-facing*i*len/64,y]);
  }
  const state=routeState,height=terrain(floor,state.x,facing);
  let advance=Math.max(0,(head-state.nominal)*facing);state.nominal=Math.max(head*facing,state.nominal*facing)*facing;
  advance=Math.min(advance,8);
  while(advance>.001){
   const step=Math.min(.4,advance),x=state.x,y=state.y;
   // Always move forward, even on steep slopes; no vertical jumps or backtracking.
   const slope=clamp((height(x+facing*1.2)-y)/1.2,-1.65,1.65);
   const dx=step/Math.sqrt(1+slope*slope),nx=x+facing*dx;
   const ny=y+clamp(height(nx)-y,-step*Math.abs(slope)/Math.sqrt(1+slope*slope),step*Math.abs(slope)/Math.sqrt(1+slope*slope));
   state.x=nx;state.y=ny;state.trail.push([nx,ny]);advance-=step;
  }
  // Keep only a little more history than the body needs.
  let total=0,cut=0;for(let i=state.trail.length-1;i>0;i--){const p=state.trail[i],q=state.trail[i-1];total+=Math.hypot(p[0]-q[0],p[1]-q[1]);if(total>len*1.8){cut=i-1;break}}
  if(cut>0)state.trail.splice(0,cut);
  const trail=state.trail,climbing=trail.slice(-Math.min(trail.length,Math.ceil(len*2.5))).some(p=>Math.abs(p[1]-floor)>radius);
  const span=len*(1-(climbing?.04:.27)*arch),track=[[state.x,state.y]];
  let j=trail.length-1,dist=0;
  for(let i=1;i<=40;i++){
   const wanted=span*i/40;
   while(j>0){const p=trail[j],q=trail[j-1],d=Math.hypot(p[0]-q[0],p[1]-q[1]);if(dist+d>=wanted&&d>.00001)break;dist+=d;j--}
   if(j>0){const p=trail[j],q=trail[j-1],d=Math.hypot(p[0]-q[0],p[1]-q[1]),f=clamp01((wanted-dist)/Math.max(.00001,d));track.push([p[0]+(q[0]-p[0])*f,p[1]+(q[1]-p[1])*f])}
   else{const p=trail[0];track.push([p[0]-facing*Math.max(0,wanted-dist),p[1]])}
  }
  // Smooth the historical centerline without projecting it onto new obstacles.
  for(let pass=0;pass<3;pass++){const old=track.map(p=>p.slice());for(let i=1;i<40;i++){track[i][0]=(old[i-1][0]+2*old[i][0]+old[i+1][0])/4;track[i][1]=(old[i-1][1]+2*old[i][1]+old[i+1][1])/4}}
  const pts=[];
  for(let i=0;i<=40;i++){const q=i/40,u=clamp01((q-.19)/.62),p=track[40-i],loop=Math.pow(Math.sin(Math.PI*u),1.65);pts.push([p[0],p[1]-loop*(climbing?radius*.12:len*.33)*arch])}
  return pts
 }
 function travel(k){const cycle=1.05,step=len*.48,n=Math.floor(k/cycle),p=k/cycle-n;return step*(n+(p<.5?0:(1-Math.cos((p-.5)*2*Math.PI))/2))}
 function finishBite(){if(b.biteFinished)return;const bite=b.el.querySelector('.worm-bite');if(!bite)return;const rad=openingRadius(),variation=[1.03,.94,1.09,1.01,.91,1.07,.97,1.12,.96,1.04,.92,1.08,1.01,.95,1.06,.98],pts=variation.map((v,i)=>{const angle=i*Math.PI*2/variation.length;return [localX+Math.cos(angle)*rad*v,53+Math.sin(angle)*rad*v]});const fmt=p=>p.map(x=>x.toFixed(2)).join(' '),mid=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2];let d='M'+fmt(mid(pts.at(-1),pts[0]));for(let i=0;i<pts.length;i++)d+=' Q'+fmt(pts[i])+' '+fmt(mid(pts[i],pts[(i+1)%pts.length]));bite.setAttribute('d',d+' Z');hole.setAttribute('rx','0');hole.setAttribute('ry','0');b.biteFinished=true}
 // Return home only after a newly thrown apple settles ahead of the head.
 function beginHome(t,floor){
  if(!lastPoints||lastPoints.length<2||!b.biteFinished)return false;
  const start=lastPoints.at(-1),facing=lastFacing,e=extent(b),dest=anchor(),entry=facing<0?e.r:e.l;
  if((entry-start[0])*facing<radius||Math.abs(e.b-(floor+radius))>radius*3)return false;
  if(Math.abs(entry-start[0])>len*2.5||dest[1]>floor+radius||floor-dest[1]>len*1.5)return false;
  // Approach on the shelf, then bend up the apple's visible surface to its existing opening.
  const approach=entry-facing*radius*.85,points=lastPoints.map(p=>p.slice()),lengths=[0];
  const append=p=>{const q=points.at(-1);if(Math.hypot(p[0]-q[0],p[1]-q[1])>.001)points.push(p)};
  for(let i=1;i<=24;i++){const q=i/24,ease=q*q*(3-2*q);append([start[0]+(approach-start[0])*q,start[1]+(floor-start[1])*ease])}
  for(let i=1;i<=60;i++){const q=i/60,u=1-q;append([u*u*approach+2*u*q*(approach+facing*radius*.6)+q*q*dest[0],u*u*floor+2*u*q*dest[1]+q*q*dest[1]])}
  for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
  let initial=0;for(let i=1;i<lastPoints.length;i++)initial+=Math.hypot(lastPoints[i][0]-lastPoints[i-1][0],lastPoints[i][1]-lastPoints[i-1][1]);
  homeRoute={points,lengths,initial,end:lengths.at(-1),time:t,facing,appleX:b.x,appleY:b.y,angle:b.angle};return true
 }
 function homePoint(h,d){let j=1;while(j<h.lengths.length-1&&h.lengths[j]<d)j++;const p=h.points[j-1],q=h.points[j],f=clamp01((d-h.lengths[j-1])/Math.max(.0001,h.lengths[j]-h.lengths[j-1]));return [p[0]+(q[0]-p[0])*f,p[1]+(q[1]-p[1])*f]}
 function returning(t,floor){
  const h=homeRoute;
  if(b.drag||Math.hypot(b.x-h.appleX,b.y-h.appleY)>radius*2||Math.abs(b.angle-h.angle)>.18){
   homeRoute=null;pendingApple=false;const p=lastPoints?.at(-1);if(p){routeState=null;rest={x:p[0],time:t};leave=t;escapeDir=h.facing;escapeX=p[0]}return false
  }
  const progress=travel(Math.max(0,t-h.time)),front=h.initial+progress,entered=front>=h.end;
  const back=Math.max(0,front-h.initial),end=Math.min(front,h.end);
  if(back>=h.end-radius*.15){cleanup();b.wormDone=false;b.wormReturned=true;return true}
  const pts=[];for(let i=0;i<=40;i++)pts.push(homePoint(h,back+(end-back)*i/40));
  if(!entered){const arch=(1-Math.cos((t-h.time)*2*Math.PI/1.05))/2;for(let i=0;i<pts.length;i++){const q=i/40,p=pts[i];if(Math.abs(p[1]-floor)<radius)p[1]-=Math.pow(Math.sin(Math.PI*clamp01((q-.19)/.62)),1.65)*len*.10*arch}}
  draw(pts,h.facing,entered,entered);requestAnimationFrame(paint);return true
 }
 function paint(now){
  if(!b.el.isConnected||!art.isConnected){cleanup();return}
  if(pausedAt!==null){requestAnimationFrame(paint);return}
  const t=(now-t0-pausedTotal)/1000,floor=field.clientHeight-8-radius,a=anchor(),r=clamp01((t-.1)/.7);
  const aperture=openingRadius()*r;if(t<4.95&&!b.biteFinished){hole.setAttribute('rx',String(aperture));hole.setAttribute('ry',String(aperture));}else finishBite();
  if(t>=4.95){if((b.appleThrowCount||0)!==seenAppleThrow){seenAppleThrow=b.appleThrowCount||0;pendingApple=true}if(homeRoute){if(returning(t,floor))return}else if(pendingApple&&!b.drag&&Math.hypot(b.vx,b.vy)<18&&Math.abs(b.spin)<.35){const e=extent(b);if(Math.abs(e.b-(floor+radius))<radius*3&&beginHome(t,floor)){pendingApple=false;if(returning(t,floor))return}}}
  if(t<.85){requestAnimationFrame(paint);return}
  if(t<2.85){
   // Feed a full-width worm along a fixed curved route, revealing its
   // actual length progressively. The rounded head never scales.
   const p=clamp01((t-.85)/2),ease=p*p*(3-2*p),gap=floor-a[1],route=[],lengths=[0];
   for(let i=0;i<=80;i++){const q=i/80;route.push([a[0]+dir*len*.62*q,a[1]+gap*(1-Math.pow(1-q,2))]);if(i){const u=route[i-1],v=route[i];lengths.push(lengths[i-1]+Math.hypot(v[0]-u[0],v[1]-u[1]))}}
   const total=lengths.at(-1),visible=Math.min(total,radius*1.25+(total-radius*1.25)*ease);
   const pts=[];
   for(let i=0;i<=40;i++){const d=visible*i/40;let j=1;while(j<80&&lengths[j]<d)j++;const f=(d-lengths[j-1])/Math.max(.0001,lengths[j]-lengths[j-1]),u=route[j-1],v=route[j];pts.push([u[0]+(v[0]-u[0])*f,u[1]+(v[1]-u[1])*f])}
   draw(pts,dir,true);
  }else if(t<4.95){
   if(!firstContact)firstContact={x:a[0]+dir*len*.62,ax:a[0],ay:a[1]};
   // Two complete pull/extend cycles: head stays planted on contraction;
   // tail advances and drops in small increments rather than falling.
   const k=(t-2.85)/1.05,n=Math.min(1,Math.floor(k)),phase=k-n;
   const smooth=x=>x*x*(3-2*x),pull=(n+smooth(Math.min(1,phase*2)))/2,reach=(n+smooth(Math.max(0,phase*2-1)))/2;
   const arch=Math.pow(Math.sin(Math.PI*phase),2);
   const head=firstContact.x+dir*len*.68*reach,tailX=firstContact.ax+dir*len*.30*pull,tailY=firstContact.ay+(floor-firstContact.ay)*pull;
   const pts=[];
   for(let i=0;i<=40;i++){const q=i/40,u=Math.max(0,Math.min(1,(q-.19)/.62));pts.push([tailX+(head-tailX)*q,floor+(tailY-floor)*Math.pow(Math.max(0,1-q/.78),2)-Math.pow(Math.sin(Math.PI*u),1.65)*len*.29*arch])}
   draw(pts,dir);
  }else{
   

   if(!grounded)grounded={x:firstContact?firstContact.x+dir*len*.68:a[0]+dir*len*1.30,time:4.95};
   if(forceExit){forceExit=false;if(leave===null){const x=lastHead===null?grounded.x:lastHead;rest={x,time:t};leave=t;escapeDir=-1;escapeX=lastFacing===-1?(routeState?.nominal??x):x-len}}
   const book=nearest(),edge=book?(dir<0?book.x+book.w/2:book.x-book.w/2):grounded.x+dir*len;
   const goal=dir<0?Math.min(grounded.x,edge+radius*2):Math.max(grounded.x,edge-radius*2);
   let head=grounded.x+dir*travel(t-grounded.time);
   if(!rest&&(dir<0?(lastHead??head)<=goal:(lastHead??head)>=goal))rest={x:goal,time:t};
   if(rest){head=rest.x;const disturbed=booksNow().some(q=>q.drag||Math.hypot(q.vx,q.vy)>70);
    if(leave===null&&(t-rest.time>=30||disturbed)){leave=t;escapeX=routeState?.nominal??head;escapeDir=-1;if(dir!==escapeDir)escapeX=head-dir*len}
    if(leave!==null){const k=t-leave;head=escapeX+escapeDir*travel(k);draw(gait(head,floor,k,escapeDir),escapeDir);if(lastHead!==null&&lastHead< -field.getBoundingClientRect().left-len-15){cleanup();b.wormDone=true;return}}
    else draw(gait(head,floor,0,dir,true),dir);
   }else draw(gait(head,floor,t-grounded.time,dir),dir);
  }
  requestAnimationFrame(paint)
 }
 if(reduced()){finishBite();cleanup();b.wormDone=true;return}
 requestAnimationFrame(paint)
}

// Apple and bookworm are independent from the reader modal.
function addApple(){const el=document.createElement('button');el.type='button';el.className='spine apple-object';el.setAttribute('aria-label','Apple, tap for worm or drag to throw');el.innerHTML='<svg viewBox="0 0 100 110" overflow="visible" aria-hidden="true" style="overflow:visible"><g stroke-linecap="round" stroke-linejoin="round"><path fill="currentColor" d="M47.61 31.45 L47.18 30.54 L46.11 30.46 L45.25 30.03 L44.76 28.77 L43.92 28.27 L42.76 28.67 L41.92 28.19 L41.05 27.80 L40.04 28.09 L39.07 28.31 L38.19 28.01 L37.30 27.64 L36.41 26.81 L35.46 27.22 L34.51 26.98 L33.55 26.92 L32.64 27.38 L31.82 28.30 L30.88 28.25 L29.81 27.65 L29.01 28.43 L28.06 28.59 L26.99 28.28 L26.12 28.73 L25.12 28.81 L24.16 29.03 L23.29 29.47 L22.69 30.53 L21.83 30.97 L20.69 30.81 L20.05 31.68 L19.43 32.61 L18.24 32.79 L17.23 33.32 L15.99 33.51 L15.31 34.50 L14.47 35.24 L13.31 35.58 L12.56 36.39 L11.81 37.21 L10.89 37.86 L10.38 38.86 L10.14 40.04 L9.90 41.18 L9.23 42.00 L8.59 42.84 L7.22 43.32 L7.05 44.46 L6.79 45.55 L5.80 46.34 L5.61 47.47 L5.64 48.67 L5.48 49.79 L4.86 50.81 L4.43 51.91 L4.20 53.06 L4.44 54.30 L4.45 55.50 L4.80 56.74 L3.82 57.91 L4.70 59.17 L4.64 60.43 L4.03 61.73 L4.42 63.02 L4.46 64.41 L4.57 65.77 L4.44 67.17 L4.11 68.58 L4.56 69.90 L4.71 71.25 L5.53 72.45 L6.10 73.67 L6.39 74.96 L5.99 76.44 L7.02 77.48 L7.17 78.81 L7.77 79.97 L8.46 81.08 L9.02 82.24 L9.56 83.40 L9.90 84.69 L10.46 85.87 L10.83 87.17 L12.13 87.86 L12.79 88.96 L13.50 90.05 L14.08 91.27 L14.88 92.31 L16.13 92.92 L16.67 94.25 L18.03 94.71 L18.75 95.89 L20.27 96.12 L21.32 96.91 L22.01 98.21 L22.79 99.32 L24.32 99.08 L24.96 99.96 L25.94 100.31 L26.61 101.12 L27.44 101.63 L28.08 102.45 L28.82 103.10 L29.95 102.95 L30.83 103.29 L31.62 103.74 L32.45 104.13 L33.27 104.52 L33.95 105.35 L34.95 105.17 L35.80 105.47 L36.73 105.38 L37.67 105.24 L38.38 106.16 L39.36 105.70 L40.19 106.12 L41.01 106.63 L42.01 105.81 L42.86 106.14 L43.71 106.63 L44.63 106.34 L45.54 106.16 L46.39 107.01 L47.32 106.61 L48.23 106.56 L49.15 106.73 L50.07 106.59 L51.00 107.14 L52.22 106.65 L53.41 107.26 L54.62 106.69 L55.81 106.49 L57.03 106.83 L58.28 107.29 L59.44 106.79 L60.60 106.37 L61.75 105.98 L63.04 106.37 L64.15 105.85 L65.40 105.90 L66.52 105.42 L67.80 105.49 L68.73 104.46 L69.76 103.83 L71.11 104.01 L71.93 102.87 L72.89 102.13 L74.20 102.13 L75.27 101.61 L76.05 100.56 L77.36 100.46 L78.53 100.09 L79.30 99.09 L80.53 98.77 L81.28 97.79 L82.66 97.61 L83.64 96.90 L84.31 95.83 L85.03 94.87 L85.31 93.48 L86.30 92.71 L86.94 91.66 L88.14 91.00 L89.25 90.24 L90.03 89.23 L90.67 88.15 L90.56 86.66 L91.50 85.72 L91.65 84.42 L92.19 83.28 L92.53 82.06 L93.59 81.08 L93.28 79.66 L93.98 78.52 L94.50 77.32 L94.86 76.07 L95.18 74.81 L95.28 73.50 L95.61 72.22 L95.02 70.83 L95.81 69.58 L95.64 68.25 L95.10 66.90 L94.94 65.59 L95.66 64.28 L95.83 62.94 L95.33 61.63 L95.67 60.28 L95.52 58.95 L95.14 57.66 L94.96 56.34 L94.57 55.07 L94.80 53.90 L94.20 52.85 L94.06 51.75 L93.60 50.71 L93.83 49.52 L93.44 48.49 L92.75 47.54 L92.36 46.53 L92.65 45.26 L92.14 44.29 L91.29 43.47 L91.00 42.41 L90.56 41.43 L90.14 40.43 L89.67 39.44 L89.45 38.29 L88.57 37.59 L87.34 37.19 L86.72 36.33 L86.46 35.14 L85.42 34.67 L84.93 33.66 L83.99 33.11 L83.49 32.05 L82.20 31.99 L81.45 31.22 L80.73 30.37 L79.71 30.01 L78.64 29.76 L77.97 28.67 L76.94 28.32 L75.90 28.01 L74.99 27.53 L74.06 27.17 L73.08 26.98 L72.00 27.31 L71.02 27.33 L70.16 26.64 L69.28 25.98 L68.32 26.00 L67.33 26.53 L66.38 26.61 L65.45 26.47 L64.48 25.87 L63.54 25.90 L62.63 26.25 L61.70 26.30 L60.74 26.11 L59.89 26.64 L59.06 27.20 L58.01 26.65 L57.18 27.04 L56.41 27.65 L55.50 27.66 L54.77 28.28 L53.77 28.04 L52.92 28.26 L52.44 29.32 L51.67 29.64 L50.89 29.89 L50.12 30.14 L49.18 30.03 L48.33 30.27 Z"/><path fill="none" stroke="currentColor" stroke-width="1.15" d="M49 31 Q46 24 46 18 L46.5 11 Q47 9 49 10 L49.2 17 Q48 24 51 30"/><path class="apple-leaf" fill="none" stroke="currentColor" stroke-width=".85" d="M51 29 Q54 21 60 15 L65 11 Q71 6 77 5 Q76 12 73 17 L67 23 Q59 29 51 29Z"/><path fill="none" stroke="var(--apple-cutout, var(--paper, #f3f0e7))" stroke-width="1.5" d="M40 33 Q49 39 58 31"/><ellipse class="worm-hole" cx="24" cy="53" rx="0" ry="0" fill="var(--apple-cutout, var(--paper, #f3f0e7))" stroke="none"/><path class="worm-bite" fill="var(--apple-cutout, var(--paper, #f3f0e7))" stroke="none" d="" /></g></svg>';attachPhysics(el,{kind:'apple',thickness:40,height:40,title:'Apple'});field.append(el)}

let joinedApple=false;
$('#join-club').onclick=()=>{if(joinedApple||!books.length||restacking||activeDrag)return;joinedApple=true;addApple();const b=bodies.at(-1),size=Math.max(56,Math.min(88,field.clientWidth*.21)),total=bodies.filter(q=>q.kind!=='apple').reduce((s,q)=>s+q.w+5,0);b.w=b.h=size;b.x=Math.min(field.clientWidth-size/2-12,field.clientWidth/2+total/2+size/2+22);b.y=size/2;b.angle=b.yaw=b.vx=b.spin=b.yawVelocity=0;b.vy=reduced()?0:40;b.mass=.95;b.inertia=b.mass*Math.pow(size*.36,2)*.55;b.drag=false;b.asleep=false;b.displayRest=false;b.el.style.width=size+'px';b.el.style.height=size+'px';b.el.style.zIndex=++layer;if(reduced()){b.y=field.clientHeight-8-(extent(b).b-b.y);b.asleep=true;b.supportY=field.clientHeight-8}drawBody(b);wake()};
const fontReady=document.fonts?document.fonts.load('16px "La Belle Aurore"').catch(()=>[]):Promise.resolve([]);fontReady.then(()=>fetch('../assets/book-club.json?v=54')).then(r=>{if(!r.ok)throw Error('Content unavailable');return r.json()}).then(data=>{books=data.books;for(const b of books){const shelf=document.getElementById('club');shelf.append(spine(b))}resetBooks()}).catch(()=>{$('.hint').textContent='The bookshelf could not load. Please refresh.'});})();