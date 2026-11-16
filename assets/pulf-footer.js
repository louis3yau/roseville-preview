/* Pulf's quiet footer cameo. Original master artwork; no redrawn character frames. */
(() => {
  'use strict';
  const footer = document.querySelector('footer');
  if (!footer || document.getElementById('pulf-credit')) return;
  const scriptURL = document.currentScript.src;
  const destination = 'https://oneortoo.com/';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const style = document.createElement('style');
  style.textContent = `
    footer .pulf-credit-row{grid-column:1/-1;justify-self:end;align-self:end;margin-top:0;min-width:0}
    footer #pulf-credit{position:relative;width:220px;height:86px;isolation:isolate;color:var(--ink);font-family:Arial,Helvetica,sans-serif}
    footer #pulf-credit canvas{position:absolute;inset:0;width:220px;height:86px;pointer-events:none}
    footer #pulf-credit button,footer #pulf-credit a{position:absolute;display:block;box-sizing:border-box;margin:0;padding:0;border:0;background:transparent;box-shadow:none;color:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;cursor:pointer}
    footer #pulf-credit .pulf-credit-hit{left:34px;top:36px;width:152px;height:44px;font:12px Arial,Helvetica,sans-serif;opacity:1}
    footer #pulf-credit.ready .pulf-credit-hit{color:transparent}
    footer #pulf-credit .pulf-character-hit{left:70px;top:35px;width:80px;height:48px;z-index:2}
    footer #pulf-credit .pulf-character-hit[hidden]{display:none}
    footer #pulf-credit button:focus-visible,footer #pulf-credit a:focus-visible{outline:2px solid var(--olive);outline-offset:3px;border-radius:2px}
    footer #pulf-credit .pulf-credit-hit:focus-visible{outline-offset:-3px}
    @media(max-width:700px){footer .pulf-credit-row{grid-column:1/-1;grid-row:3;margin-top:0}}
  `;
  document.head.append(style);
  const row = document.createElement('div');
  row.className = 'pulf-credit-row';
  row.innerHTML = '<div id="pulf-credit"><canvas width="440" height="172" aria-hidden="true"></canvas><button type="button" class="pulf-credit-hit" aria-label="© one or too 2026. Double tap to meet Pulf.">© one or too 2026</button><a class="pulf-character-hit" href="https://oneortoo.com/" aria-label="Pulf. Tap to squish; double tap to visit one or too. Press Enter to visit." hidden></a></div>';
  footer.append(row);
  const host = row.firstElementChild, canvas = host.querySelector('canvas');
  const credit = host.querySelector('button'), pulf = host.querySelector('a');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  host.classList.add('ready');
  let dx = 0, dy = 0, shown = false, revealing = false, front = 0, arch = 0, rise = 0;
  let creditTimer = 0, lastCredit = 0, lastPulf = 0, squishUntil = 0, blinkUntil = 0;
  let blinkTimer = 0, visible = false, atlas = null, loading = null, motion = 0;
  const poses = { rest: [40,140,460,285], blink: [40,610,465,290], squish: [525,715,470,185] };
  const label = '© one or too 2026', baseline = 58, width = 72;
  const ease = t => 1 - (1 - Math.max(0, Math.min(1, t))) ** 3;

  // This is the original site's perimeter-paper cutout, preserving enclosed white ears and face.
  function cutout(data,w,h) {
    const outside = new Uint8Array(w*h), queue = new Int32Array(w*h); let head=0, tail=0;
    const visit = p => { if(outside[p])return;const i=p*4;if(Math.min(data[i],data[i+1],data[i+2])<210)return;outside[p]=1;queue[tail++]=p; };
    for(let x=0;x<w;x++){visit(x);visit((h-1)*w+x)}
    for(let y=1;y<h-1;y++){visit(y*w);visit(y*w+w-1)}
    while(head<tail){const p=queue[head++],x=p%w,y=Math.floor(p/w);if(x)visit(p-1);if(x+1<w)visit(p+1);if(y)visit(p-w);if(y+1<h)visit(p+w)}
    const alpha=new Uint8Array(w*h);for(let p=0;p<w*h;p++)alpha[p]=outside[p]?0:data[p*4+3];
    const kernel=[1,4,6,4,1];
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const p=y*w+x,i=p*4;let sum=0,total=0,edge=false;
      for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const xx=x+b,yy=y+a;if(xx<0||xx>=w||yy<0||yy>=h)continue;const q=yy*w+xx,k=kernel[b+2]*kernel[a+2];sum+=alpha[q]*k;total+=k;if(outside[q]!==outside[p])edge=true}
      data[i+3]=edge?Math.round(Math.max(0,Math.min(255,(sum/total-35)*255/185))):alpha[p];
      if(edge)data[i]=data[i+1]=data[i+2]=0;
    }
  }
  function loadArtwork() {
    if (loading) return loading;
    loading = new Promise((resolve,reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          atlas = {};
          for (const [pose,[x,y,w,h]] of Object.entries(poses)) {
            const tile=document.createElement('canvas');tile.width=w;tile.height=h;
            const t=tile.getContext('2d',{willReadFrequently:true});t.drawImage(img,x,y,w,h,0,0,w,h);
            const pixels=t.getImageData(0,0,w,h);cutout(pixels.data,w,h);t.putImageData(pixels,0,0);atlas[pose]=tile;
          }
          resolve();
        } catch(error){atlas=null;reject(error)}
      };
      img.onerror = reject;
      img.src = new URL('pulf-master.jpg',scriptURL).href;
    });
    return loading;
  }
  function text() {
    ctx.font='12px Arial,Helvetica,sans-serif';ctx.fillStyle=getComputedStyle(host).color;ctx.globalAlpha=.74;
    const chars=Array.from(label), widths=chars.map(ch=>ctx.measureText(ch).width),total=widths.reduce((a,b)=>a+b,0),half=total/2;
    const points=[];let length=0,prev;
    for(let i=0;i<=300;i++){const x=(i/300*2-1)*half,y=-arch*(1-x*x/(half*half));if(prev)length+=Math.hypot(x-prev.x,y-prev.y);points.push({x,y,d:length});prev={x,y}}
    let advance=0;
    chars.forEach((ch,i)=>{const target=(length-total)/2+advance+widths[i]/2;let j=1;while(j<300&&points[j].d<target)j++;const a=points[j-1],b=points[j],t=(target-a.d)/(b.d-a.d);ctx.save();ctx.translate(110+dx+a.x+(b.x-a.x)*t,baseline+dy+a.y+(b.y-a.y)*t);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x));ctx.fillText(ch,-widths[i]/2,0);ctx.restore();advance+=widths[i]});
    ctx.globalAlpha=1;
  }
  function character(now) {
    if(!shown||!atlas)return;
    const pose=now<squishUntil?'squish':now<blinkUntil?'blink':'rest';
    const tile=atlas[pose],height=width*tile.height/tile.width;
    // All poses use the same width; the squish frame alone has its original flattened anatomy.
    const bottom=baseline+25+(1-rise)*40;
    ctx.drawImage(tile,110-width/2,bottom-height,width,height);
    host.dataset.pose=pose;
  }
  function draw(now=performance.now()) {
    const dpr=Math.min(devicePixelRatio||1,3);
    if(canvas.width!==220*dpr||canvas.height!==86*dpr){canvas.width=220*dpr;canvas.height=86*dpr}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,220,86);
    if(front===0)character(now);text();if(front>0)character(now);
    host.dataset.state=revealing?'revealing':shown?'shown':'quiet';
  }
  function planBlink() {
    clearTimeout(blinkTimer);
    if(!shown||!visible||document.hidden)return;
    blinkTimer=setTimeout(()=>{if(performance.now()>=squishUntil){blinkUntil=performance.now()+145;draw();setTimeout(()=>draw(),155)}planBlink()},3200+Math.random()*2600);
  }
  async function reveal() {
    clearTimeout(creditTimer);if(shown||revealing)return;
    revealing=true;
    try {await loadArtwork()}catch{revealing=false;return}
    dx=dy=0;credit.style.transform='';credit.disabled=true;shown=true;
    const started=performance.now();
    function tick(now){const elapsed=reduced?1500:now-started;
      if(elapsed<650){const p=ease(elapsed/650);rise=p;arch=28*p;front=0}
      else if(elapsed<950){rise=1;arch=28;front=0}
      else{const p=ease((elapsed-950)/500);rise=1;front=p;arch=28*(1-p)}
      draw(now);
      if(elapsed<1450)motion=requestAnimationFrame(tick);
      else{revealing=false;rise=front=1;arch=0;pulf.hidden=false;draw();planBlink()}
    }
    motion=requestAnimationFrame(tick);
  }
  function dodge(event) {
    const r=host.getBoundingClientRect(),px=event.clientX-r.left,py=event.clientY-r.top;
    const a=Math.atan2(baseline+dy-py,110+dx-px)+(Math.random()-.5)*1.6;
    const oldX=dx,oldY=dy;
    const nx=Math.max(-32,Math.min(32,dx+Math.cos(a)*(25+Math.random()*18))),ny=Math.max(-8,Math.min(8,dy+Math.sin(a)*15));
    const start=performance.now();
    function tick(now){const p=reduced?1:ease((now-start)/240);dx=oldX+(nx-oldX)*p;dy=oldY+(ny-oldY)*p;credit.style.transform=`translate(${dx}px,${dy}px)`;draw();if(p<1)motion=requestAnimationFrame(tick)}
    cancelAnimationFrame(motion);motion=requestAnimationFrame(tick);
  }
  credit.addEventListener('click',event=>{
    event.preventDefault();
    if(event.detail===0){reveal();return}
    const now=performance.now();
    if(lastCredit&&now-lastCredit<360){lastCredit=0;clearTimeout(creditTimer);reveal()}
    else{lastCredit=now;clearTimeout(creditTimer);creditTimer=setTimeout(()=>dodge(event),360)}
  });
  credit.addEventListener('dblclick',event=>event.preventDefault());
  pulf.addEventListener('click',event=>{
    if(event.detail===0)return; // Keyboard and assistive-technology activation follows the real link.
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();const now=performance.now();
    if(lastPulf&&now-lastPulf<380){lastPulf=0;location.assign(destination);return}
    lastPulf=now;squishUntil=now+420;blinkUntil=0;draw(now);setTimeout(()=>draw(),430);
  });
  pulf.addEventListener('dblclick',event=>event.preventDefault());
  document.addEventListener('visibilitychange',planBlink);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;planBlink()}).observe(host);
  new MutationObserver(()=>draw()).observe(document.body,{attributes:true,attributeFilter:['class']});
  draw();
})();
