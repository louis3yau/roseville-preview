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
    footer{position:relative}
    footer .footer-socials{margin-top:37px}
    footer .pulf-credit-row{position:absolute;width:220px;height:86px;min-width:0;pointer-events:none}
    footer #pulf-credit button,footer #pulf-credit a{pointer-events:auto}
    footer #pulf-credit{position:relative;width:220px;height:86px;isolation:isolate;color:var(--ink);font-family:Arial,Helvetica,sans-serif}
    footer #pulf-credit canvas{position:absolute;inset:0;width:220px;height:86px;pointer-events:none}
    footer #pulf-credit button,footer #pulf-credit a{position:absolute;display:block;box-sizing:border-box;margin:0;padding:0;border:0;background:transparent;box-shadow:none;color:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;cursor:pointer}
    footer #pulf-credit .pulf-credit-hit{left:34px;top:36px;width:152px;height:44px;font:12px Arial,Helvetica,sans-serif;opacity:1}
    footer #pulf-credit.ready .pulf-credit-hit{color:transparent}
    footer #pulf-credit .pulf-character-hit{left:70px;top:35px;width:80px;height:48px;z-index:2}
    footer #pulf-credit .pulf-character-hit[hidden]{display:none}
    footer #pulf-credit button:focus-visible,footer #pulf-credit a:focus-visible{outline:2px solid var(--olive);outline-offset:3px;border-radius:2px}
    footer #pulf-credit .pulf-credit-hit:focus-visible{outline-offset:-3px}
    
  `;
  document.head.append(style);
  const row = document.createElement('div');
  row.className = 'pulf-credit-row';
  row.innerHTML = '<div id="pulf-credit"><canvas width="440" height="172" aria-hidden="true"></canvas><button type="button" class="pulf-credit-hit" aria-label="© one or too 2026. Double tap to meet Pulf.">© one or too 2026</button><a class="pulf-character-hit" href="https://oneortoo.com/" target="_blank" rel="noopener noreferrer" aria-label="Pulf. Tap to squish; double tap to visit one or too. Press Enter to visit." hidden></a></div>';
  footer.append(row);
  const host = row.firstElementChild, canvas = host.querySelector('canvas');
  const credit = host.querySelector('button'), pulf = host.querySelector('a');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  host.classList.add('ready');
  let dx = 0, dy = 0, shown = false, revealing = false, front = 0, arch = 0, rise = 0;
  let creditTimer = 0, lastCredit = 0, lastPulf = 0, squishUntil = 0, blinkUntil = 0;
  let idleTimer=0, departing=false, bigEyes=false, opacity=1, facing=1;
  let petX=0,petY=0,petTilt=0,runTimer=0,runFrame=0,scurrying=false;
  let blinkTimer = 0, visible = false, atlas = null, loading = null, motion = 0;
  const poses = { rest: [40,140,460,285], squish: [525,715,470,185] };
  const label = '© one or too 2026', baseline = 58, width = 72;
  ctx.font='12px Arial,Helvetica,sans-serif';
  const textWidth=ctx.measureText(label).width, center=220-textWidth/2;
  credit.style.left=(220-textWidth-12)+'px';credit.style.width=(textWidth+12)+'px';
  pulf.style.left=(center-40)+'px';
  function position(){
    const bounds=footer.getBoundingClientRect(), mission=footer.querySelector('.mission')?.getBoundingClientRect(),social=footer.querySelector('.footer-socials')?.getBoundingClientRect();
    if(!mission||!social)return;
    row.style.left=(mission.right-bounds.left-220)+'px';
    row.style.top=(social.top+social.height/2+4-bounds.top-baseline)+'px';
  }
  const layoutObserver=new ResizeObserver(position);layoutObserver.observe(footer);
  for(const el of footer.querySelectorAll('.mission,.footer-socials,.footer-contact-col'))layoutObserver.observe(el);
  window.addEventListener('resize',position);position();
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
          // Build both eye states from the SAME resting pixels. Body, mouth, ears and feet do not change.
          const rest=atlas.rest;
          for(const state of ['blink','bigEyes']){
            const tile=document.createElement('canvas');tile.width=rest.width;tile.height=rest.height;
            const g=tile.getContext('2d');g.drawImage(rest,0,0);
            [243,327].forEach((x,i)=>{
              const y=85;g.save();g.beginPath();g.arc(x,y,26,0,Math.PI*2);g.clip();
              // Replace only the eye with neighbouring original ink texture, preserving the silhouette.
              g.drawImage(rest,x-26,y+45,52,52,x-26,y-26,52,52);g.restore();
              g.strokeStyle='#fff';g.lineWidth=state==='blink'?4.2:4;g.lineCap='round';
              g.beginPath();
              if(state==='blink'){g.moveTo(x-14,y+1);g.quadraticCurveTo(x,y+2,x+14,y)}
              else g.ellipse(x,y,i?18:19,i?19:18,i?.08:-.08,0,Math.PI*2);
              g.stroke();
            });
            atlas[state]=tile;
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
    chars.forEach((ch,i)=>{const target=(length-total)/2+advance+widths[i]/2;let j=1;while(j<300&&points[j].d<target)j++;const a=points[j-1],b=points[j],t=(target-a.d)/(b.d-a.d);ctx.save();ctx.translate(center+dx+a.x+(b.x-a.x)*t,baseline+dy+a.y+(b.y-a.y)*t);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x));ctx.fillText(ch,-widths[i]/2,0);ctx.restore();advance+=widths[i]});
    ctx.globalAlpha=1;
  }
  function character(now) {
    if(!shown||!atlas)return;
    const pose=bigEyes?'bigEyes':now<squishUntil?'squish':now<blinkUntil?'blink':'rest';
    const tile=atlas[pose],height=width*tile.height/tile.width;
    // All poses use the same width; the squish frame alone has its original flattened anatomy.
    const bottom=baseline+25+(1-rise)*40;
    ctx.save();ctx.globalAlpha=opacity;ctx.translate(center+petX,bottom+petY);ctx.rotate(petTilt);
    // The landing master faces opposite to resting/blink; mirror it to preserve Pulf's facing.
    const sourceFacing=pose==='squish'?-1:1;ctx.scale(facing*sourceFacing,1);
    ctx.drawImage(tile,-width/2,-height,width,height);ctx.restore();
    pulf.style.left=(center+petX-40)+'px';pulf.style.top=(35+petY)+'px';
    host.dataset.facing=String(facing);host.dataset.motion=scurrying?'scurry':'rest';
    host.dataset.pose=pose;
  }
  function draw(now=performance.now()) {
    const dpr=Math.min(devicePixelRatio||1,3);
    if(canvas.width!==220*dpr||canvas.height!==86*dpr){canvas.width=220*dpr;canvas.height=86*dpr}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,220,86);
    if(front===0)character(now);text();if(front>0)character(now);
    host.dataset.state=departing?'departing':revealing?'revealing':shown?'shown':'quiet';
  }
  function planBlink() {
    clearTimeout(blinkTimer);
    if(!shown||departing||scurrying||!visible||document.hidden)return;
    blinkTimer=setTimeout(()=>{if(performance.now()>=squishUntil){blinkUntil=performance.now()+145;draw();setTimeout(()=>draw(),155)}planBlink()},3200+Math.random()*2600);
  }
  function scheduleIdle(){
    clearTimeout(idleTimer);
    if(!shown||revealing||departing||document.hidden)return;
    idleTimer=setTimeout(()=>{
      stopScurry();departing=true;bigEyes=true;blinkUntil=squishUntil=0;clearTimeout(blinkTimer);pulf.hidden=true;draw();
      idleTimer=setTimeout(()=>{
        const start=performance.now();
        function tick(now){const p=reduced?1:ease((now-start)/500);rise=1-p;opacity=1-p;draw(now);
          if(p<1)motion=requestAnimationFrame(tick);
          else{shown=departing=bigEyes=false;petX=petY=petTilt=0;rise=front=arch=0;opacity=1;credit.disabled=false;lastCredit=lastPulf=0;draw()}
        }
        motion=requestAnimationFrame(tick);
      },700);
    },12000);
  }
  async function reveal() {
    clearTimeout(creditTimer);if(shown||revealing)return;
    revealing=true;
    try {await loadArtwork()}catch{revealing=false;return}
    stopScurry();petX=petY=petTilt=0;departing=bigEyes=false;opacity=1;dx=dy=0;credit.style.transform='';credit.disabled=true;shown=true;
    const started=performance.now();
    function tick(now){const elapsed=reduced?1500:now-started;
      if(elapsed<650){const p=ease(elapsed/650);rise=p;arch=28*p;front=0}
      else if(elapsed<950){rise=1;arch=28;front=0}
      else{const p=ease((elapsed-950)/500);rise=1;front=p;arch=28*(1-p)}
      draw(now);
      if(elapsed<1450)motion=requestAnimationFrame(tick);
      else{revealing=false;rise=front=1;arch=0;pulf.hidden=false;draw();planBlink();scheduleIdle()}
    }
    motion=requestAnimationFrame(tick);
  }
  function dodge(event) {
    const r=host.getBoundingClientRect(),px=event.clientX-r.left,py=event.clientY-r.top;
    const a=Math.atan2(baseline+dy-py,center+dx-px)+(Math.random()-.5)*1.6;
    const oldX=dx,oldY=dy;
    const nx=Math.max(-32,Math.min(0,dx+Math.cos(a)*(25+Math.random()*18))),ny=Math.max(-8,Math.min(8,dy+Math.sin(a)*15));
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
  function stopScurry(){
    clearTimeout(runTimer);cancelAnimationFrame(runFrame);scurrying=false;petY=petTilt=0;
  }
  function scurry(clickX){
    if(!shown||departing||revealing)return;
    stopScurry();
    const from=petX,actual=center+from;
    // Pick a destination away from the touch, constrained to the existing footer canvas.
    let direction=clickX>=actual?-1:1;
    if(actual>160)direction=-1;else if(actual<62)direction=1;
    const target=Math.max(40-center,Math.min(180-center,from+direction*(46+Math.random()*38)));
    const distance=target-from;
    if(reduced){petX=target;facing=distance<0?-1:1;draw();return}
    scurrying=true;blinkUntil=0;clearTimeout(blinkTimer);
    const start=performance.now();
    function tick(now){
      const elapsed=now-start;
      if(elapsed<85){
        // Tiny anticipation, then a quick series of short steps like the assistant's scurry.
        petTilt=-direction*.035*Math.sin(elapsed/85*Math.PI);petY=0;
      }else{
        const p=Math.min(1,(elapsed-85)/620),travel=ease(p);facing=direction;
        petX=from+distance*travel;
        const envelope=Math.sin(Math.PI*p);
        petY=-Math.abs(Math.sin(p*Math.PI*7))*2.2*envelope;
        petTilt=direction*(.028+Math.sin(p*Math.PI*14)*.018)*envelope;
      }
      draw(now);
      if(elapsed<705)runFrame=requestAnimationFrame(tick);
      else{petX=target;petY=petTilt=0;scurrying=false;draw();planBlink();scheduleIdle()}
    }
    runFrame=requestAnimationFrame(tick);
  }
  pulf.addEventListener('click',event=>{
    if(event.detail===0)return; // Keyboard and assistive-technology activation follows the real link.
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();const now=performance.now();
    if(lastPulf&&now-lastPulf<380){lastPulf=0;stopScurry();window.open(destination,'_blank','noopener,noreferrer');scheduleIdle();return}
    stopScurry();scheduleIdle();lastPulf=now;squishUntil=now+260;blinkUntil=0;draw(now);setTimeout(()=>draw(),270);
    const hitX=event.clientX-host.getBoundingClientRect().left;
    // Keep him under the second tap until the double-tap window has passed.
    runTimer=setTimeout(()=>scurry(hitX),430);
  });
  pulf.addEventListener('dblclick',event=>event.preventDefault());
  pulf.addEventListener('pointermove',scheduleIdle);
  pulf.addEventListener('focus',scheduleIdle);
  document.addEventListener('visibilitychange',()=>{planBlink();if(document.hidden)clearTimeout(idleTimer);else scheduleIdle()});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;planBlink()}).observe(host);
  new MutationObserver(()=>{draw();position()}).observe(document.body,{attributes:true,attributeFilter:['class']});
  draw();
})();
