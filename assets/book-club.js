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
function flexLeaf(b){const leaf=b.el.querySelector('.apple-leaf');if(!leaf)return;const c=Math.cos(b.angle),s=Math.sin(b.angle),k=b.w/110,floor=field.clientHeight-8;
const samples=[[51,29],[58,18],[65,12],[77,5],[74,16],[64,25],[57,29]];
function pressure(deg){let max=0;const a=deg*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);for(const [x,y] of samples){const u=x-51,v=y-29,lx=(51+u*ca-v*sa-50)*k,ly=(29+u*sa+v*ca-55)*k,px=b.x+lx*c-ly*s,py=b.y+lx*s+ly*c;max=Math.max(max,py-floor);for(const q of bodies){if(q===b)continue;const e=extent(q);if(px>e.l&&px<e.r&&py>e.t&&py<e.b)max=Math.max(max,Math.min(px-e.l,e.r-px,py-e.t,e.b-py)+1)}}return max}
let target=0,best=pressure(0);if(best>.2){for(let i=1;i<=12;i++){const deg=i*5,v=pressure(deg);if(v<best-.05){best=v;target=deg}if(v<.2){target=deg;break}}}
const now=performance.now(),dt=Math.min(.05,Math.max(.008,(now-(b.leafTime||now-16))/1000));b.leafTime=now;const prev=b.leafAngle||0;b.leafAngle=prev+(target-prev)*(1-Math.exp(-(target>prev?8:5)*dt));if(Math.abs(b.leafAngle-target)<.1)b.leafAngle=target;leaf.setAttribute('transform','rotate('+(b.leafAngle+(b.asleep&&!b.drag&&!reduced()?Math.sin(now/750)*3:0))+' 51 29)')}
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
 el.onpointerup=e=>{if(!start)return;const moved=start.moved,now=performance.now();if(now-start.time>100)b.vx=b.vy=0;start=null;activeDrag=null;b.drag=false;if(moved){if(b.kind==='apple'){b.appleQuiet=0;b.appleRestAngle=null;b.vx=clamp(b.vx,-460,460);b.spin=clamp(b.vx/Math.max(14,b.w*.35),-9,9);b.yaw=b.yawVelocity=0;wake();return}field.dispatchEvent(new Event('bookworm-book-thrown'));b.tipSign=b.vx<0?-1:1;b.lastTap=0;b.spin=clamp(b.vx/230,-5,5);b.yawVelocity=clamp(b.vx/320,-2.5,2.5);if(Math.abs(b.angle)<.07)b.angle=(b.vx<0?-1:1)*.085}else{b.vx=b.vy=0;if(b.kind==='apple'){revealBookworm(b);wake();return}if(now-b.lastTap<350&&b.lastTap){b.lastTap=0;open(data,el)}else b.lastTap=now}wake()};
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
 const backing=make('path'),body=make('path'),stripes=make('path'),eye=make('circle'),glasses=make('path');
 // Explicit opaque paint and top layer, including Safari SVG compositing.
 art.style.setProperty('isolation','isolate');art.style.setProperty('z-index','2147483000','important');
 body.style.setProperty('fill','#f3f0e7','important');body.style.setProperty('fill-opacity','1','important');body.style.setProperty('opacity','1','important');body.style.setProperty('mix-blend-mode','normal','important');
 const ink='#272622',paper='#f3f0e7';glasses.setAttribute('fill','none');glasses.setAttribute('stroke',ink);glasses.setAttribute('stroke-width','.69');glasses.setAttribute('stroke-linecap','round');glasses.style.pointerEvents='none';
 backing.style.cssText='fill:'+paper+' !important;fill-opacity:1 !important;stroke:'+paper+' !important;stroke-width:.40px !important;stroke-linejoin:round !important;opacity:1 !important;mix-blend-mode:normal !important;';backing.setAttribute('fill-rule','nonzero');
 body.setAttribute('fill',paper);body.setAttribute('fill-opacity','1');body.setAttribute('stroke',ink);body.setAttribute('stroke-width','.40');body.setAttribute('stroke-linejoin','round');body.setAttribute('fill-rule','nonzero');
 stripes.setAttribute('fill','none');stripes.setAttribute('stroke',ink);stripes.setAttribute('stroke-width','.28');stripes.setAttribute('stroke-linecap','round');eye.setAttribute('fill',ink);field.append(art);
 const scale=b.w/110,width=Math.max(3.8,10*scale),radius=width/2,len=72*scale,t0=performance.now();
 let pausedAt=null,pausedTotal=0,forceExit=false,lastHead=null,lastFacing=-1;
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
 const localX=dir*Math.cos(b.angle)>0?76:24;
 hole.setAttribute('cx',String(localX));hole.setAttribute('cy','53');
 let firstContact=null,grounded=null,rest=null,leave=null,escapeX=null,escapeDir=dir;
 const clamp01=x=>Math.max(0,Math.min(1,x));
 function anchor(){const svg=b.el.querySelector('svg'),m=svg.getScreenCTM(),world=art.getScreenCTM();if(m&&world){const p=art.createSVGPoint();p.x=localX;p.y=53;const q=p.matrixTransform(m).matrixTransform(world.inverse());return [q.x,q.y]}const u=(localX-50)*b.w/110,v=-2*b.h/110,c=Math.cos(b.angle),s=Math.sin(b.angle);return [b.x+u*c-v*s,b.y+u*s+v*c]}
 function draw(points,facing,emerging=false){
  const normals=points.map((p,i)=>{const u=points[Math.max(0,i-1)],v=points[Math.min(points.length-1,i+1)],dx=v[0]-u[0],dy=v[1]-u[1],m=Math.hypot(dx,dy)||1;return [-dy/m,dx/m]});
  const edges=[1,-1].map(sign=>points.map((p,i)=>{const rr=radius*(emerging?1:(.76+.24*Math.min(1,i/4)));return [p[0]+normals[i][0]*rr*sign,p[1]+normals[i][1]*rr*sign]}));
  const fmt=p=>p[0].toFixed(2)+' '+p[1].toFixed(2),n=points.length-1; const headTip=[points[n][0]+normals[n][1]*radius,points[n][1]-normals[n][0]*radius],tailRadius=radius*(emerging?1:.76),tailTip=[points[0][0]-normals[0][1]*tailRadius,points[0][1]+normals[0][0]*tailRadius];
  body.setAttribute('d','M'+edges[0].map(fmt).join(' L')+' Q'+fmt([edges[0][n][0]+normals[n][1]*radius,edges[0][n][1]-normals[n][0]*radius])+' '+fmt(headTip)+' Q'+fmt([edges[1][n][0]+normals[n][1]*radius,edges[1][n][1]-normals[n][0]*radius])+' '+fmt(edges[1][n])+' L'+edges[1].slice(0,n).reverse().map(fmt).join(' L')+' A'+tailRadius+' '+tailRadius+' 0 0 0 '+fmt(edges[0][0])+' Z');
  backing.setAttribute('d',body.getAttribute('d'));
  // Stripe spacing follows the body, not the number of visible path samples.
  let marks='',distance=0,nextStripe=radius*3.1,lastMark=null;
  for(let i=n;i>0;i--){const p=points[i],q=points[i-1],seg=Math.hypot(p[0]-q[0],p[1]-q[1]);if(seg<.0001)continue;
   while(nextStripe<=distance+seg){const f=(nextStripe-distance)/seg;if(i>1||f<.7){const blend=(u,v)=>[u[0]+(v[0]-u[0])*f,u[1]+(v[1]-u[1])*f],c=blend(p,q),l=blend(edges[0][i],edges[0][i-1]),r=blend(edges[1][i],edges[1][i-1]);if(!lastMark||Math.min(Math.hypot(l[0]-lastMark.l[0],l[1]-lastMark.l[1]),Math.hypot(r[0]-lastMark.r[0],r[1]-lastMark.r[1]))>radius*.85){marks+='M'+fmt(l)+' Q'+fmt([c[0]+facing*radius*.25,c[1]])+' '+fmt(r);lastMark={l,r}}}nextStripe+=radius*2.3}distance+=seg}
  stripes.setAttribute('d',marks);
  const h=points[n];lastHead=h[0];lastFacing=facing;eye.setAttribute('r',String(Math.max(.43,scale*.68)));eye.setAttribute('cx',String(h[0]+facing*radius*.45));eye.setAttribute('cy',String(h[1]-radius*.24));const gx=h[0]+facing*radius*.20,gy=h[1]-radius*.11;
  const lensX=radius*.70,lensY=radius*.64;
  const P=(x,y)=>fmt([gx+facing*x,gy+y]);
  const near='M'+P(0,-lensY)+' C'+P(lensX*.57,-lensY)+' '+P(lensX,-lensY*.56)+' '+P(lensX,0)+' C'+P(lensX,lensY*.56)+' '+P(lensX*.57,lensY)+' '+P(0,lensY)+' C'+P(-lensX*.57,lensY)+' '+P(-lensX,lensY*.56)+' '+P(-lensX,0)+' C'+P(-lensX,-lensY*.56)+' '+P(-lensX*.57,-lensY)+' '+P(0,-lensY)+' Z';
  const far=' M'+P(lensX*.60,-lensY*.78)+' Q'+P(radius*.91,-radius*1.16)+' '+P(radius*1.12,-radius*.80)+' Q'+P(radius*1.24,-radius*.58)+' '+P(radius*.92,-radius*.39);
  const bridge=' M'+P(lensX*.84,-lensY*.45)+' Q'+P(radius*.90,-radius*.58)+' '+P(radius*.99,-radius*.49);
  glasses.setAttribute('d',near+far+bridge);
  eye.setAttribute('cx',String(gx+facing*radius*.22));eye.setAttribute('cy',String(gy-radius*.03));
 }
 // Use a rounded, clearance-offset contour of grounded displaced books.
 // A moving airborne book is never a climbing surface.
 const passedObstacles=new Map();
 function terrain(floor,hx,facing){
  const obstacles=[];
  for(const q of booksNow()){
   if(q.displayRest||q.drag||Math.hypot(q.vx,q.vy)>=45||Math.abs(q.spin)>=.65){passedObstacles.delete(q);continue}
   const e=extent(q);if(e.b<floor-radius*2||e.t>=floor-radius){passedObstacles.delete(q);continue}
   const previous=passedObstacles.get(q),entry=facing<0?e.r:e.l,exit=facing<0?e.l:e.r;
   // Reassess only if a book has actually been displaced or direction changes.
   const moved=!previous||previous.facing!==facing||Math.abs(previous.x-q.x)>radius*2||Math.abs(previous.y-q.y)>radius*2||Math.abs(previous.angle-q.angle)>.2;
   let state=previous;
   if(moved){state={x:q.x,y:q.y,angle:q.angle,facing,ignore:(hx-entry)*facing>0};passedObstacles.set(q,state)}
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
  if(!routeState||routeState.facing!==facing||head*facing<routeState.nominal*facing-2)routeState={facing,nominal:head,x:head,y:floor};
  const height=terrain(floor,routeState.x,facing);
  let advance=Math.max(0,(head-routeState.nominal)*facing);routeState.nominal=head;
  // Limit vertical displacement by the same distance budget as horizontal
  // crawling, even when an obstacle appears underneath the head.
  while(advance>.001){const step=Math.min(.5,advance),x=routeState.x,y=routeState.y,goal=height(x+facing*step),dy=goal-y;
   if(Math.abs(dy)>step*2){routeState.y+=Math.sign(dy)*step}
   else{const dx=step/Math.max(1,Math.hypot(step,dy)/step);routeState.x+=facing*dx;routeState.y+=clamp(height(routeState.x)-y,-step,step)}
   advance-=step
  }
  const hx=routeState.x,hy=routeState.y,pts=[],track=[[hx,hy]];
  const climbing=Math.abs(hy-floor)>radius||Array.from({length:9},(_,i)=>height(hx-facing*len*i/8)).some(y=>y<floor-radius);
  const span=len*(1-(climbing?.08:.27)*arch);
  let x=hx,y=hy,dist=0;
  for(let i=1;i<=40;i++){const target=span*i/40;while(dist<target-.001){
    const dx=Math.min(.65,target-dist),nx=x-facing*dx,ny=height(nx),d=Math.hypot(nx-x,ny-y),f=Math.min(1,(target-dist)/Math.max(.0001,d));x+=(nx-x)*f;y+=(ny-y)*f;dist+=d*f;
   }track.push([x,y])}
  // Round sharp changes in direction before offsetting the outline.
  for(let pass=0;pass<4;pass++){const old=track.map(p=>p.slice());for(let i=1;i<40;i++){track[i][0]=(old[i-1][0]+2*old[i][0]+old[i+1][0])/4;track[i][1]=Math.min(height(track[i][0]),(old[i-1][1]+2*old[i][1]+old[i+1][1])/4)}}
  for(let i=0;i<=40;i++){const q=i/40,u=clamp01((q-.19)/.62),p=track[40-i],loop=Math.pow(Math.sin(Math.PI*u),1.65);pts.push([p[0],p[1]-loop*(climbing?radius*.35:len*.33)*arch])}
  return pts
 }
 function travel(k){const cycle=1.05,step=len*.48,n=Math.floor(k/cycle),p=k/cycle-n;return step*(n+(p<.5?0:(1-Math.cos((p-.5)*2*Math.PI))/2))}
 function paint(now){
  if(!b.el.isConnected||!art.isConnected){cleanup();return}
  if(pausedAt!==null){requestAnimationFrame(paint);return}
  const t=(now-t0-pausedTotal)/1000,floor=field.clientHeight-8-radius,a=anchor(),r=clamp01((t-.1)/.7);
  hole.setAttribute('rx',String(6*r));hole.setAttribute('ry',String(6.3*r));
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
   if(forceExit){forceExit=false;if(leave===null){const x=lastHead===null?grounded.x:lastHead;rest={x,time:t};leave=t;escapeDir=-1;escapeX=lastFacing===-1?x:x-len}}
   const book=nearest(),edge=book?(dir<0?book.x+book.w/2:book.x-book.w/2):grounded.x+dir*len;
   const goal=dir<0?Math.min(grounded.x,edge+radius*2):Math.max(grounded.x,edge-radius*2);
   let head=grounded.x+dir*travel(t-grounded.time);
   if(!rest&&(dir<0?head<=goal:head>=goal))rest={x:goal,time:t};
   if(rest){head=rest.x;const disturbed=booksNow().some(q=>q.drag||Math.hypot(q.vx,q.vy)>70);
    if(leave===null&&(t-rest.time>=30||disturbed)){leave=t;escapeX=head;escapeDir=-1;if(dir!==escapeDir)escapeX=head-dir*len}
    if(leave!==null){const k=t-leave;head=escapeX+escapeDir*travel(k);draw(gait(head,floor,k,escapeDir),escapeDir);if(lastHead!==null&&lastHead< -field.getBoundingClientRect().left-len-15){cleanup();b.wormDone=true;return}}
    else draw(gait(head,floor,0,dir,true),dir);
   }else draw(gait(head,floor,t-grounded.time,dir),dir);
  }
  requestAnimationFrame(paint)
 }
 if(reduced()){hole.setAttribute('rx','6');hole.setAttribute('ry','6.3');cleanup();b.wormDone=true;return}
 requestAnimationFrame(paint)
}

// Apple and bookworm are independent from the reader modal.
function addApple(){const el=document.createElement('button');el.type='button';el.className='spine apple-object';el.setAttribute('aria-label','Apple, tap for worm or drag to throw');el.innerHTML='<svg viewBox="0 0 100 110" aria-hidden="true"><g stroke-linecap="round" stroke-linejoin="round"><path fill="currentColor" d="M47.54 31.68 L47.27 30.26 L46.05 30.41 L45.17 30.04 L44.78 28.55 L43.93 28.02 L42.66 28.71 L41.88 28.05 L41.02 27.58 L39.97 27.99 L38.99 28.26 L38.12 27.88 L37.22 27.62 L36.34 26.49 L35.37 27.22 L34.42 26.82 L33.45 26.74 L32.53 27.18 L31.73 28.32 L30.78 28.22 L29.64 27.31 L28.90 28.42 L27.95 28.54 L26.81 28.03 L26.00 28.70 L24.96 28.67 L24.00 28.90 L23.09 29.27 L22.56 30.50 L21.71 30.96 L20.43 30.54 L19.86 31.57 L19.34 32.62 L18.01 32.62 L17.08 33.29 L15.69 33.28 L15.13 34.45 L14.31 35.20 L13.02 35.41 L12.33 36.31 L11.61 37.15 L10.59 37.72 L10.11 38.76 L9.90 39.96 L9.73 41.15 L8.95 41.90 L8.47 42.84 L6.77 43.15 L6.81 44.41 L6.65 45.54 L5.40 46.23 L5.33 47.41 L5.39 48.62 L5.27 49.75 L4.56 50.75 L4.13 51.86 L3.85 53.01 L4.23 54.27 L4.08 55.46 L4.77 56.72 L3.22 57.87 L4.59 59.15 L4.45 60.40 L3.59 61.71 L4.22 63.00 L4.17 64.40 L4.33 65.77 L4.21 67.16 L3.71 68.60 L4.36 69.90 L4.33 71.28 L5.31 72.46 L5.85 73.69 L6.26 74.94 L5.48 76.54 L6.93 77.46 L6.82 78.88 L7.52 80.01 L8.23 81.11 L8.76 82.29 L9.36 83.43 L9.62 84.76 L10.28 85.89 L10.44 87.33 L12.01 87.84 L12.54 89.05 L13.31 90.10 L13.83 91.36 L14.59 92.46 L16.06 92.87 L16.31 94.49 L17.98 94.64 L18.41 96.15 L20.17 96.11 L21.19 96.94 L21.84 98.31 L22.50 99.64 L24.33 98.98 L24.73 100.18 L25.86 100.32 L26.43 101.28 L27.33 101.67 L27.94 102.57 L28.63 103.34 L29.88 102.97 L30.71 103.39 L31.51 103.86 L32.34 104.25 L33.20 104.54 L33.80 105.64 L34.89 105.18 L35.69 105.65 L36.65 105.53 L37.64 105.16 L38.26 106.53 L39.33 105.66 L40.13 106.22 L40.93 106.97 L41.98 105.74 L42.82 106.25 L43.66 106.86 L44.60 106.45 L45.52 106.11 L46.36 107.34 L47.30 106.66 L48.22 106.65 L49.14 106.91 L50.07 106.58 L50.97 107.45 L52.24 106.56 L53.43 107.59 L54.65 106.74 L55.85 106.55 L57.07 106.92 L58.34 107.56 L59.50 106.88 L60.67 106.51 L61.79 105.97 L63.15 106.65 L64.21 105.85 L65.52 106.13 L66.59 105.42 L67.97 105.79 L68.82 104.51 L69.83 103.80 L71.33 104.34 L72.04 102.91 L72.98 102.14 L74.39 102.31 L75.47 101.80 L76.12 100.51 L77.55 100.60 L78.77 100.29 L79.39 99.06 L80.81 99.00 L81.36 97.73 L82.93 97.79 L83.88 97.03 L84.49 95.89 L85.33 95.03 L85.39 93.45 L86.60 92.86 L87.07 91.66 L88.39 91.09 L89.53 90.34 L90.26 89.29 L91.06 88.28 L90.61 86.62 L91.90 85.85 L91.82 84.43 L92.51 83.36 L92.64 82.06 L94.09 81.20 L93.36 79.64 L94.30 78.57 L94.79 77.36 L95.13 76.10 L95.49 74.84 L95.49 73.51 L96.06 72.26 L95.05 70.82 L96.26 69.61 L95.95 68.25 L95.33 66.90 L95.08 65.59 L96.02 64.27 L96.21 62.93 L95.46 61.62 L96.04 60.25 L95.81 58.93 L95.37 57.63 L95.28 56.30 L94.73 55.02 L95.21 53.84 L94.38 52.82 L94.40 51.69 L93.74 50.69 L94.20 49.45 L93.73 48.42 L92.98 47.49 L92.50 46.51 L93.03 45.15 L92.43 44.20 L91.45 43.44 L91.29 42.32 L90.79 41.36 L90.39 40.34 L89.86 39.39 L89.78 38.14 L88.85 37.46 L87.48 37.16 L86.88 36.29 L86.82 34.92 L85.52 34.68 L85.23 33.46 L84.10 33.12 L83.83 31.77 L82.30 32.01 L81.64 31.12 L80.96 30.19 L79.90 29.88 L78.74 29.79 L78.20 28.42 L77.10 28.21 L76.04 27.91 L75.15 27.39 L74.21 27.04 L73.24 26.78 L72.12 27.23 L71.13 27.31 L70.29 26.51 L69.41 25.77 L68.43 25.81 L67.42 26.48 L66.48 26.50 L65.54 26.43 L64.57 25.66 L63.62 25.74 L62.71 26.17 L61.78 26.23 L60.78 25.88 L59.94 26.51 L59.15 27.26 L58.02 26.37 L57.21 26.90 L56.48 27.64 L55.49 27.42 L54.85 28.31 L53.77 27.85 L52.89 28.01 L52.51 29.34 L51.68 29.52 L50.90 29.78 L50.15 30.08 L49.17 29.89 L48.31 29.98 Z"/><path fill="none" stroke="currentColor" stroke-width="1.15" d="M49 31 Q46 24 46 18 L46.5 11 Q47 9 49 10 L49.2 17 Q48 24 51 30"/><path class="apple-leaf" fill="none" stroke="currentColor" stroke-width=".85" d="M51 29 Q54 21 60 15 L65 11 Q71 6 77 5 Q76 12 73 17 L67 23 Q59 29 51 29Z"/><path fill="none" stroke="#f3f0e7" stroke-width="1.5" d="M40 33 Q49 39 58 31"/><ellipse class="worm-hole" cx="24" cy="53" rx="0" ry="0" fill="#f3f0e7" stroke="none"/></g></svg>';attachPhysics(el,{kind:'apple',thickness:40,height:40,title:'Apple'});field.append(el)}

let joinedApple=false;
$('#join-club').onclick=()=>{if(joinedApple||!books.length||restacking||activeDrag)return;joinedApple=true;addApple();const b=bodies.at(-1),size=Math.max(56,Math.min(88,field.clientWidth*.21)),total=bodies.filter(q=>q.kind!=='apple').reduce((s,q)=>s+q.w+5,0);b.w=b.h=size;b.x=Math.min(field.clientWidth-size/2-12,field.clientWidth/2+total/2+size/2+22);b.y=size/2;b.angle=b.yaw=b.vx=b.spin=b.yawVelocity=0;b.vy=reduced()?0:40;b.mass=.95;b.inertia=b.mass*Math.pow(size*.36,2)*.55;b.drag=false;b.asleep=false;b.displayRest=false;b.el.style.width=size+'px';b.el.style.height=size+'px';b.el.style.zIndex=++layer;if(reduced()){b.y=field.clientHeight-8-(extent(b).b-b.y);b.asleep=true;b.supportY=field.clientHeight-8}drawBody(b);wake()};
const fontReady=document.fonts?document.fonts.load('16px "La Belle Aurore"').catch(()=>[]):Promise.resolve([]);fontReady.then(()=>fetch('../assets/book-club.json?v=54')).then(r=>{if(!r.ok)throw Error('Content unavailable');return r.json()}).then(data=>{books=data.books;for(const b of books){const shelf=document.getElementById('club');shelf.append(spine(b))}resetBooks()}).catch(()=>{$('.hint').textContent='The bookshelf could not load. Please refresh.'});})();