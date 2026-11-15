
const arrow=`<svg class="scribble" viewBox="0 0 150 120" aria-hidden="true"><text x="7" y="22">come on in</text><path d="M38 35 C22 75 64 98 119 68 M105 68 L121 66 117 83"/></svg>`;
const photo=(title,button,extra='')=>`<section class="photoband photohero ${extra}"><div class="photo-text"><h1>${title}</h1><a class="outline" href="#content">${button} ↓</a></div></section>`;
// Seeded scattering keeps the sky calm but avoids a repeated grid on each visit.
const random=(()=>{let seed=41527;return ()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296)})();
const starPoints=[];
for(let attempts=0;starPoints.length<27&&attempts<700;attempts++){
 const x=3+random()*94,y=6+random()*46;
 if(x>34&&x<66&&y>20&&y<36)continue; // keep the welcome text clear
 if(x>19&&x<83&&y>37)continue; // no stars underneath the building
 if(starPoints.some(([px,py])=>Math.hypot((x-px)*.8,(y-py)*1.6)<5.3))continue;
 starPoints.push([+x.toFixed(1),+y.toFixed(1)]);
}
const stars=starPoints.map(([x,y],i)=>`<button class="star" type="button" aria-label="Send this star shooting across the sky" style="--x:${x}%;--y:${y}%;--s:${i%11===0?3.2:i%4===0?2.4:1.8}px;--o:${(.7+random()*.23).toFixed(2)};--twinkle:${(11+random()*15).toFixed(1)}s;--phase:-${(random()*21).toFixed(1)}s"></button>`).join('');

const cloudFills=[
 ['760 190','M34 118 Q40 105 61 100 Q71 88 91 89 Q109 82 129 83 Q140 72 159 74 Q176 52 207 54 Q226 36 253 48 Q275 43 300 53 Q318 37 338 36 Q362 22 384 30 Q404 40 409 54 Q433 57 444 69 Q458 68 475 62 Q495 46 518 47 Q545 40 564 61 Q585 64 601 79 Q627 86 643 98 Q662 100 673 113 Q703 113 714 122 Q728 119 742 128 L747 137 Q725 141 706 139 Q679 143 654 137 Q617 151 580 148 Q554 156 525 151 Q491 157 463 150 Q434 159 404 153 Q367 158 338 151 Q313 159 285 152 Q247 161 215 153 Q180 156 155 146 Q117 153 91 140 Q58 143 34 132 Z'],
 ['685 300','M30 236 Q44 223 65 221 Q81 211 92 196 Q107 181 125 182 Q135 166 152 164 Q166 133 191 130 Q203 112 226 114 Q246 104 261 107 Q279 89 305 91 Q313 67 338 62 Q354 34 382 27 Q410 15 431 29 Q454 26 475 47 Q491 67 494 86 Q514 77 530 91 Q548 99 552 120 Q572 122 578 142 Q607 142 619 165 Q634 184 629 198 Q645 206 655 225 L659 240 Q643 250 620 246 Q587 257 557 250 Q519 264 481 252 Q451 267 418 256 Q382 270 346 256 Q310 266 278 255 Q241 270 207 255 Q173 267 139 249 Q104 255 78 245 Q51 251 30 241 Z'],
 ['430 210','M20 137 Q31 124 54 121 Q67 111 83 113 Q104 99 116 96 Q137 93 147 80 Q158 60 179 57 Q201 42 220 58 Q235 46 254 55 Q268 70 265 88 Q289 91 309 108 Q326 109 341 114 Q356 116 372 123 L393 124 Q409 126 403 137 Q375 145 353 143 Q327 150 301 142 Q274 150 252 145 Q218 157 193 149 Q165 159 138 150 Q115 151 98 148 Q64 153 45 144 Z'],
 ['785 210','M20 120 Q33 99 57 96 Q66 80 86 75 Q105 56 130 63 Q146 48 168 49 Q191 38 211 51 Q223 48 241 61 Q254 53 269 56 Q282 36 304 43 Q323 22 347 24 Q372 26 382 45 Q398 51 404 69 Q428 72 441 95 Q465 87 482 99 Q509 97 520 114 Q542 102 564 104 Q586 106 593 120 Q609 111 628 112 Q649 101 666 112 Q677 120 680 132 Q696 135 713 127 Q727 130 738 139 L755 143 Q763 151 749 160 Q724 168 701 157 Q668 174 637 159 Q607 175 576 163 Q544 176 514 166 Q475 184 441 169 Q407 180 374 170 Q337 182 303 172 Q269 185 236 170 Q199 179 164 168 Q130 174 101 161 Q67 167 43 152 Q24 152 20 137 Z'],
 ['900 320','M14 237 Q25 215 50 207 Q65 193 82 196 Q88 163 112 150 Q133 139 151 150 Q162 123 188 118 Q210 105 228 113 Q241 89 267 82 Q282 61 305 60 Q326 36 353 38 Q375 26 399 40 Q427 54 443 83 Q468 76 487 88 Q509 88 527 101 Q552 94 573 110 Q599 100 621 112 Q644 106 663 119 Q682 104 704 112 Q722 124 730 145 Q754 142 770 159 Q786 167 796 186 Q825 179 845 196 Q864 207 878 226 L888 243 Q857 257 828 249 Q798 265 769 250 Q733 271 701 256 Q665 272 634 257 Q598 278 562 261 Q525 278 489 261 Q451 279 414 264 Q373 284 338 264 Q299 280 266 263 Q231 276 198 257 Q165 268 131 250 Q97 261 68 245 Q35 254 14 237 Z'],
 ['535 300','M17 194 Q33 167 58 169 Q72 143 98 139 Q119 127 140 136 Q158 104 185 104 Q200 75 227 72 Q247 54 268 61 Q279 34 301 39 Q325 40 344 60 Q359 75 354 99 Q377 105 384 131 Q409 128 425 148 Q451 143 464 164 Q489 166 500 188 L513 205 Q504 221 481 214 Q456 232 431 221 Q403 242 375 226 Q347 248 319 231 Q284 253 253 233 Q220 247 190 228 Q158 242 130 223 Q99 235 74 217 Q41 226 17 207 Z']
];
const clouds=cloudFills.map(([box,path],index)=>{const i=index+1;return `<button class="cloud cloud-${i}" type="button" aria-label="Nudge cloud ${i}" title="Nudge cloud"><span class="cloud-ink"><svg class="cloud-fill" viewBox="0 0 ${box}" preserveAspectRatio="none" aria-hidden="true"><path d="${path}"/></svg><img src="assets/cloud-etch-${i}.png" alt="" onerror="if(!this.dataset.retry){this.dataset.retry='1';this.src=this.src+(this.src.includes('?')?'&':'?')+'retry=1'}else{this.style.visibility='hidden'}"></span></button>`}).join('');
const noticeboard=`<section id="home-about" class="notice-section"><div class="noticeboard">
 <div class="sign-legs" aria-hidden="true"><span></span><span></span></div>
 <div class="sign-frame">
  <div class="sign-header"><div class="sign-logo"><img src="assets/menu-logo.png" alt=""></div></div>
  <div class="sign-letters"><div class="sign-message" id="sign-message">SUNDAYS 9:30 AM<br>MORNING WORSHIP<br>ALL WELCOME</div></div>
  <svg class="sign-ink" viewBox="0 0 560 382" preserveAspectRatio="none" aria-hidden="true"><path d="M4 5 Q94 1 175 5 L554 3 558 378 Q439 381 334 377 L5 380 Z M9 11 Q118 8 232 11 L550 9 M12 115 Q209 112 352 116 L547 112 M12 120 Q278 118 546 121 M11 374 Q258 371 548 374"/></svg>
 </div>
 <div class="sign-plaque"><span id="sign-updated">Last updated 12 November 2026</span></div>
 </div></section>`;
const calendarRows=[["September","Tue 1","Session"],["September","Wed 2","Bible Study"],["September","Tue 8","CoM"],["September","Wed 9","Bible Study"],["September","Fri 11","Youth Group"],["September","Sat 12","Working Bee"],["September","Wed 16","Bible Study"],["September","Sun 20","Catechism term 3 ends"],["September","Wed 23","Bible Study"],["September","Sun 27","Roseville Cares Sunday"],["October","Sun 4","The Lord’s Supper"],["October","Sun 4","Church Lunch"],["October","Sun 4","Daylight Saving Starts"],["October","Tue 6","Session"],["October","Tue 13","CoM"],["October","Wed 14","Bible Study"],["October","Sun 18","Catechism term 4 begins"],["October","Tue 20","Presbytery Meeting"],["October","Wed 21","Bible Study"],["October","Sat 24","Fête"],["October","Sun 25","Roseville Cares Sunday"],["October","Wed 28","Bible Study"],["November","Tue 3","Session"],["November","Wed 4","Bible Study"],["November","Tue 10","CoM"],["November","Wed 11","Bible Study"],["November","Wed 18","Bible Study"],["November","Wed 25","Bible Study"],["November","Sun 29","Roseville Cares Sunday"],["December","Tue 1","Session"],["December","Wed 2","Bible Study"],["December","Sat 5","Working Bee"],["December","Sun 6","The Lord’s Supper"],["December","Tue 8","CoM"],["December","Wed 9","Bible Study"],["December","Tue 15","Presbytery Meeting"],["December","Wed 16","Bible Study"],["December","Fri 25","Christmas Day service · 9am"],["December","Sun 27","Roseville Cares Sunday"]];
const careRows=[["25 January","Jericho Road"],["22 February","Allowah Children’s Hospital"],["29 March","PresAid Easter Appeal 2026"],["26 April","APWM (Australian Presbyterian World Mission)"],["31 May","PIM (Presbyterian Inland Mission)"],["28 June","Jericho Road"],["26 July","Chasefu Theological College"],["30 August","Bible League"],["27 September","APWM"],["25 October","PIM"],["29 November","PresAID Christmas Appeal"],["27 December","To be confirmed"]];
const careLinks={"Jericho Road":[["About Jericho Road","https://jerichoroad.org.au/get-involved/"]],"Allowah Children’s Hospital":[["About Allowah","https://www.allowah.org.au/services/"],["Read Allowah's story","https://eternitynews.com.au/australia/without-this-place-i-honestly-dont-know-what-our-family-would-do/amp/"]],"PresAid Easter Appeal 2026":[["About PresAID","https://presaid.org.au/"]],"APWM (Australian Presbyterian World Mission)":[["About APWM","https://apwm.org.au/"]],"APWM":[["About APWM","https://apwm.org.au/"]],"PIM (Presbyterian Inland Mission)":[["About PIM","https://pim.org.au/about-us/"]],"PIM":[["About PIM","https://pim.org.au/about-us/"]],"Chasefu Theological College":[["About Chasefu","https://www.theoutreachfoundation.org/updates/2024/1/3/ccap-zambia-training-pastors-at-chasefu-theological-college"],["Latest updates","https://www.facebook.com/groups/900846324037452/"]],"Bible League":[["About Bible League","https://bibleleague.org.au/what-we-do/"]],"PresAID Christmas Appeal":[["About PresAID","https://presaid.org.au/"]]};


function caresList(){
  const records=Array.isArray(cmsData?.cares)&&cmsData.cares.length?cmsData.cares:careRows.map(([date,title])=>{
    const short_name=title.includes('APWM')?'APWM':title.includes('PIM')?'PIM':title.includes('PresAID')||title.includes('PresAid')?'PresAID':title==='Allowah Children’s Hospital'?'Allowah':title==='Chasefu Theological College'?'Chasefu':title;
    const links=careLinks[title]||[];
    return {date:'2026-'+String(monthNames.findIndex(name=>date.endsWith(name))+1).padStart(2,'0')+'-'+date.split(' ')[0].padStart(2,'0'),title:title==='To be confirmed'?'To Be Advised':title,short_name,description:'',primary_url:links[0]?.[1]||'',primary_label:links[0]?.[0]||'',secondary_url:links[1]?.[1]||'',secondary_label:links[1]?.[0]||''};
  });
  const todayYear=todayParts.year,todayMonth=todayParts.month;
  const monthKey=x=>{const a=String(x.date||'').match(/^(\d{4})-(\d{2})-\d{2}$/);return a?Number(a[1])*12+Number(a[2])-1:0};
  const now=todayYear*12+todayMonth-1;
  const current=records.filter(x=>monthKey(x)===now).sort((a,b)=>a.date.localeCompare(b.date));
  const upcoming=records.filter(x=>monthKey(x)>now).sort((a,b)=>a.date.localeCompare(b.date));
  const past=records.filter(x=>monthKey(x)<now).sort((a,b)=>b.date.localeCompare(a.date));
  const ordered=[...current,...upcoming,...past];
  function renderCaresRow(item){
    const key=monthKey(item),isCurrent=key===now,isPast=key<now;
    const badge=isCurrent?'This month':key===now+1?'Next month':key===now-1?'Last month':'';
    const title=item.title||'To Be Advised';
    const date=String(item.date||'');
    const monthName=monthNames[Number(date.slice(5,7))-1]||'';
    const dateLabel=Number(date.slice(8,10))+' '+monthName+(Number(date.slice(0,4))===todayYear?'':' '+date.slice(0,4));
    const heading='<span><span class="reading-date">'+esc(dateLabel)+'</span><span class="reading-summary">'+esc(title)+'</span></span>';
    const label=badge?'<span class="row-tag">'+esc(badge)+'</span>':'';
    const classes='row compact reading-day cares-day'+(isCurrent?' is-current-month':'')+(isPast?' is-past':'');
    const shortName=(item.short_name||title).trim();
    const urlOkay=url=>typeof url==='string'&&/^https:\/\/[^\s/@]+(?:[^\s]*)$/i.test(url);
    const buttons=[];
    if(urlOkay(item.primary_url))buttons.push([''+(item.primary_label||'About '+shortName),item.primary_url]);
    if(urlOkay(item.secondary_url))buttons.push([''+(item.secondary_label||'More information'),item.secondary_url]);
    const description=(item.description||'').trim();
    if(!buttons.length&&!description)return '<div class="'+classes+' cares-unconfirmed"><div class="cares-static">'+heading+label+'</div></div>';
    const links=buttons.map(([text,url])=>'<span class="reading-passage"><a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(text)+' (opens in a new tab)">'+esc(text)+'</a></span>').join('');
    const details=(description?'<p class="cares-description">'+esc(description)+'</p>':'')+(links?'<div class="reading-links cares-links">'+links+'</div>':'');
    return '<details class="'+classes+'"'+(isCurrent?' open':'')+'><summary>'+heading+label+'</summary><div class="cares-details">'+details+'</div></details>';
  }
  const archiveStart=current.length+upcoming.length;
  return '<div class="rows cares-list">'+ordered.map((item,i)=>(i===archiveStart&&past.length?'<div class="cares-archive-heading">Previous months</div>':'')+renderCaresRow(item)).join('')+'</div>';
}
const readingRows=[['Fri 13 November','Joshua 1; Psalms 120–122'],['Mon 16 November','Joshua 2; Psalms 123–125'],['Tue 17 November','Joshua 3; Psalms 126–128'],['Wed 18 November','Joshua 4; Psalms 129–131'],['Thu 19 November','Joshua 5; 6:1–5; Psalms 132–134'],['Fri 20 November','Joshua 6:6–27; Psalms 135–136'],['Mon 23 November','Joshua 7; Psalms 137–138'],['Tue 24 November','Joshua 8; Psalm 139'],['Wed 25 November','Joshua 9; Psalms 140–141'],['Thu 26 November','Joshua 10; Psalms 142–143'],['Fri 27 November','Joshua 11; Psalm 144'],['Mon 30 November','Joshua 12–13; Psalm 145'],['Tue 1 December','Joshua 14–15; Psalms 146–147'],['Wed 2 December','Joshua 16–17; Psalms 148'],['Thu 3 December','Joshua 18–19; Psalms 149–150'],['Fri 4 December','Joshua 20–21; Acts 1'],['Mon 7 December','Joshua 22; Acts 2'],['Tue 8 December','Joshua 23; Acts 3'],['Wed 9 December','Joshua 24; Acts 4'],['Thu 10 December','Judges 1; Acts 5'],['Fri 11 December','Judges 2; Acts 6'],['Mon 14 December','Judges 3; Acts 7'],['Tue 15 December','Judges 4; Acts 8'],['Wed 16 December','Judges 5; Acts 9'],['Thu 17 December','Judges 6; Acts 10'],['Fri 18 December','Judges 7; Acts 11'],['Mon 21 December','Judges 8; Acts 12'],['Tue 22 December','Judges 9; Acts 13'],['Wed 23 December','Judges 10; 11:1–11; Acts 14'],['Thu 24 December','Judges 11:12–40; Acts 15'],['Fri 25 December','Judges 12; Acts 16'],['Mon 28 December','Judges 13; Acts 17'],['Tue 29 December','Judges 14; Acts 18'],['Wed 30 December','Judges 15; Acts 19'],['Thu 31 December','Judges 16; Acts 20']];
const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
const todayParts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Australia/Sydney',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date()).map(p=>[p.type,+p.value]));
const sydneyTodayKey=()=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Australia/Sydney',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date()).map(x=>[x.type,+x.value]));return p.year*10000+p.month*100+p.day};
const todayKey=sydneyTodayKey();
const dateKey=(label)=>{if(/^\d{4}-\d{2}-\d{2}$/.test(label))return Number(label.replaceAll('-',''));const match=label.match(/(\d{1,2})\s+([A-Za-z]+)/);if(!match)return 0;const month=monthNames.findIndex(m=>m.toLowerCase()===match[2].toLowerCase());return month<0?0:20260000+(month+1)*100+Number(match[1])};
const calendarLink=title=>title==='Bible Study'?'#study':title==='Roseville Cares Sunday'?'#cares':title.startsWith('Catechism term')?'#catechism':null;
const listRows=(rows,mode='plain')=>{const now=sydneyTodayKey();const nextIndex=mode==='calendar'?rows.findIndex(row=>dateKey(row[3]||row[0])>now):-1;return `<div class="rows">${rows.map(([date,title,href,sourceDate,description],index)=>{const current=mode==='cares'&&date.includes(monthNames[todayParts.month-1]);const key=dateKey(sourceDate||date),today=mode==='calendar'&&key===now,coming=mode==='calendar'&&index===nextIndex;const link=mode==='calendar'?(href||calendarLink(title)):null;return `<div class="row compact${today?' is-today':''}${coming?' is-coming':''}${current?' is-current-month':''}${(today||coming||current)?' status-row':''}"><h3>${esc(date)}</h3><p>${link?`<a href="${safeLink(link)}">${esc(title)}</a>`:esc(title)}${mode==='calendar'&&description?'<span class="event-description">'+esc(description)+'</span>':''}</p>${today?'<span class="row-tag">Today</span>':coming?'<span class="row-tag">Coming up</span>':current?'<span class="row-tag">This month</span>':''}</div>`}).join('')}</div>`};

const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeLink=x=>/^#[a-z-]+$/.test(x||'')?x:'#calendar';
let cmsData=null;
const formatDate=x=>new Intl.DateTimeFormat('en-AU',{timeZone:'UTC',weekday:'short',day:'numeric',month:'long'}).format(new Date(x+'T12:00:00Z'));
const csbBooks=new Set('joshua|judges|psalm|acts|1 samuel|2 samuel|1 corinthians|2 corinthians|genesis|exodus|leviticus|numbers|deuteronomy|ruth|1 kings|2 kings|1 chronicles|2 chronicles|ezra|nehemiah|esther|job|proverbs|ecclesiastes|song of songs|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|matthew|mark|luke|john|romans|galatians|ephesians|philippians|colossians|1 thessalonians|2 thessalonians|1 timothy|2 timothy|titus|philemon|hebrews|james|1 peter|2 peter|1 john|2 john|3 john|jude|revelation'.split('|'));
function readingLinks(passages,overrides=[]){let book='';return String(passages).split(';').map(raw=>{const reference=raw.trim();if(!reference)return '';const match=reference.match(/^((?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?:\s*[–-]\s*(\d+))?(?::\s*\d+(?:\s*[–-]\s*\d+)?)?$/);const continuation=reference.match(/^(\d+)(?:\s*[–-]\s*(\d+))?(?::\s*\d+(?:\s*[–-]\s*\d+)?)?$/);let first,last;if(match){book=match[1].toLowerCase().replace(/^psalms$/,'psalm');first=Number(match[2]);last=Number(match[3]||match[2])}else if(continuation&&book){first=Number(continuation[1]);last=Number(continuation[2]||continuation[1])}const override=overrides.find(x=>x.reference===reference)?.url;const validOverride=typeof override==='string'&&/^https:\/\/read\.csbible\.com\/\?book=[a-z0-9+% ]+&chapter=\d+$/.test(override);const url=validOverride?override:csbBooks.has(book)&&first>0&&last>=first&&last-first<25?'https://read.csbible.com/?book='+encodeURIComponent(book).replace(/%20/g,'+')+'&chapter='+first:null;return `<div class="reading-passage">${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="Read ${esc(match?reference:book+' '+reference)} in the CSB (opens in a new tab)">${esc(reference)}</a>`:`<span>${esc(reference)}</span><small>Link unavailable; check the reference in the editor.</small>`}</div>`}).join('')}

function readingList(){const now=sydneyTodayKey();const rows=cmsData?cmsData.readings.filter(x=>dateKey(x.date)>=now).sort((a,b)=>dateKey(a.date)-dateKey(b.date)):readingRows.filter(x=>dateKey(x[0])>=now).map(x=>({date:x[0],passages:x[1]})).sort((a,b)=>dateKey(a.date)-dateKey(b.date));const next=Math.min(...rows.map(x=>dateKey(x.date)).filter(key=>key>now));return `<div class="rows reading-list">${rows.map(x=>{const date=/^\d{4}-/.test(x.date)?formatDate(x.date):x.date,key=dateKey(x.date),status=key===now?'Today':key===next?'Coming up':'';return `<details class="row compact reading-day${status==='Today'?' is-today':status==='Coming up'?' is-coming':''}"><summary><span><span class="reading-date">${esc(date)}</span><span class="reading-summary">${esc(x.passages)}</span></span>${status?`<span class="row-tag">${status}</span>`:''}</summary><div class="reading-links">${readingLinks(x.passages,x.links||[])}</div></details>`}).join('')}</div>`}


const remainingReadings=()=>cmsData?cmsData.readings.filter(x=>dateKey(x.date)>=sydneyTodayKey()).map(x=>[formatDate(x.date),x.passages]):readingRows.filter(x=>dateKey(x[0])>=sydneyTodayKey());
function calendarList(rows){
 const now=sydneyTodayKey();
 const next=rows.findIndex(r=>dateKey(r[3]||r[0])>now);
 const validLink=url=>typeof url==='string'&&(/^#[a-z-]+$/.test(url)||/^https:\/\/[^\s/@]+[^\s]*$/i.test(url));
 return '<div class="rows calendar-list">'+rows.map(([date,title,href,sourceDate,description,customLabel],index)=>{
  const key=dateKey(sourceDate||date),isToday=key===now,isNext=index===next;
  const status=isToday?'Today':isNext?'Coming up':'';
  const link=validLink(href)?href:(href?'':(calendarLink(title)||''));
  const safe=validLink(link)?link:'';
  const aboutLabel=(customLabel||'About '+(title==='Roseville Cares Sunday'?'Roseville Cares':title)).trim();
  const linkHtml=safe?'<div class="reading-links cares-links"><span class="reading-passage"><a href="'+esc(safe)+'"'+(safe.startsWith('https://')?' target="_blank" rel="noopener noreferrer"':'')+'>'+esc(aboutLabel)+'</a></span></div>':'';
  const detail=(description||'').trim();
  const heading='<span><span class="reading-date">'+esc(date)+'</span><span class="reading-summary">'+esc(title)+'</span></span>';
  const tag=status?'<span class="row-tag">'+status+'</span>':'';
  const classes='row compact reading-day calendar-day'+(isToday?' is-today':isNext?' is-coming':'');
  if(!detail&&!linkHtml)return '<div class="'+classes+' calendar-static"><div class="cares-static">'+heading+tag+'</div></div>';
  return '<details class="'+classes+'"><summary>'+heading+tag+'</summary><div class="cares-details">'+(detail?'<p class="cares-description">'+esc(detail)+'</p>':'')+linkHtml+'</div></details>';
 }).join('')+'</div>';
}
const remainingCalendar=()=>cmsData?cmsData.events.filter(x=>x.public!==false&&dateKey(x.date)>=sydneyTodayKey()).sort((a,b)=>dateKey(a.date)-dateKey(b.date)).map(x=>[formatDate(x.date),x.title,x.link,x.date,x.description||'',x.link_label||'']):calendarRows.filter(([month,date])=>dateKey(`${date} ${month}`)>=sydneyTodayKey()).map(([month,date,title])=>[`${date} ${month}`,title,null,`${date} ${month}`]).sort((a,b)=>dateKey(a[3])-dateKey(b[3]));
const pageSection=(title,body,parent)=>`<section id="content" class="section inner-page standalone">${parent?`<a class="parent-link" href="#${parent[0]}">← ${parent[1]}</a>`:''}<h1>${title}</h1>${body}</section>`;
const pages={home:`<section class="homehero"><div class="night-sky">${stars}</div><div><h1 tabindex="0" title="Double tap to see the church at night" aria-label="Welcome to Roseville Presbyterian Church. Double tap to switch day and night">Welcome to <strong>Roseville</strong><em>Presbyterian Church</em></h1></div><div class="drawing">${clouds}<img class="church-art" src="assets/church-day-unlit.png" alt="Hand-drawn illustration of Roseville Presbyterian Church"><img class="church-lit" src="assets/church-day-lit.png" alt="" aria-hidden="true"><img class="church-open" src="assets/church-day-open.png" alt="" aria-hidden="true"><span class="window-spill" aria-hidden="true"></span><button class="art-hit main-door" type="button" aria-label="Light the entrance window"></button><button class="art-hit nearby-window" type="button" aria-label="Light the church window"></button><button class="art-hit second-door" type="button" aria-label="Toggle the entrance lights"></button><button class="art-hit side-windows" type="button" aria-label="Toggle the church windows"></button><button class="art-hit far-windows" type="button" aria-label="Toggle the far windows"></button><button class="art-hit admin-door" type="button" tabindex="-1" aria-hidden="true"></button><button class="art-hit cross-guide-hit" type="button" aria-label="Church cross — tap three times to open the Worship Guide" title="Church cross"></button></div><div class="hero-bottom"><div><p>Gather with us on Sundays</p><p class="subtle">Morning worship 9:30am</p></div><button class="entry-button outline" type="button">Come on in →</button><div><a class="map-address" href="https://www.google.com/maps/search/?api=1&amp;query=28+Lord+Street%2C+Roseville%2C+NSW+2069" target="_blank" rel="noopener" aria-label="28 Lord Street, Roseville, NSW 2069 — open in Google Maps">28 Lord Street<br><span class="subtle">Roseville, NSW 2069</span></a></div></div><a class="down" href="#home/home-about">A little about us ↓</a></section>${noticeboard}<section id="content" class="section split"><div><h2>About Roseville</h2></div><div><p>The pattern of worship at Roseville is simple and warm. Our desire is that it be heartfelt, reverent, biblical and spiritual.</p><p>All who desire to draw near to the living God in worship—or just to visit and see—are warmly invited to join the congregation at Roseville Presbyterian.</p><a class="textlink" href="#about">Get to know us →</a></div></section><section class="photoband"><div><h2>Lord’s Day<span>Sundays</span></h2><a class="outline" href="#visit">Your first visit →</a></div></section><section class="section home-life"><h2>Life at Roseville</h2><div class="rows"><div class="row"><h3>Bible Study</h3><p>Explore the Bible with others in our midweek study.</p><a href="#study">Study together →</a></div><div class="row"><h3>Roseville Cares</h3><p>Supporting the work of Christian organisations through Roseville Cares.</p><a href="#cares">Find out more →</a></div><div class="row"><h3>Worship Guide</h3><p>Worship guides and Bible readings for the week ahead.</p><a href="#worship">Worship Guide →</a></div></div></section>`,
visit:photo('Visit us','Come as you are')+`<section id="content" class="section split"><div><h2>Sunday worship</h2><div class="service-times"><div class="service-time"><strong><a class="service-link" href="#catechism">8:30am Catechism Club</a></strong><span class="subtle">During school terms. Open to all ages.</span></div><div class="service-time"><strong><a class="service-link" href="#worship">9:30am Morning Worship</a></strong><span class="subtle">A warm, simple service centred on God’s word.</span></div><div class="service-time"><strong><a class="service-link" href="#worship/latest-guide">5pm Guided Family Worship</a></strong><span class="subtle">Use the guide at home or gather with others. There is no organised 5pm service at the church.</span></div></div><div class="visit-location"><p><a class="map-address" href="https://www.google.com/maps/search/?api=1&amp;query=28+Lord+Street%2C+Roseville%2C+NSW+2069" target="_blank" rel="noopener">28 Lord Street, Roseville, NSW 2069</a></p><div class="visit-map"><iframe title="Map to Roseville Presbyterian Church, 28 Lord Street" src="https://www.google.com/maps?q=28+Lord+Street%2C+Roseville%2C+NSW+2069&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div><a class="textlink" href="https://www.google.com/maps/search/?api=1&amp;query=28+Lord+Street%2C+Roseville%2C+NSW+2069" target="_blank" rel="noopener">Get directions →</a></div></div><div><details open><summary>What happens during worship?</summary><p>We read and hear the Bible taught, pray and sing praise to God, including the Psalms. You are welcome to visit and see.</p></details><details><summary>How long does the service last?</summary><p>Morning worship usually lasts 60–90 minutes. Please join us for morning tea afterwards.</p></details><details><summary>Can I bring my children?</summary><p>Children are encouraged to remain with the congregation throughout worship. For parents with babies or young children who need a little space, a separate parent room is available.</p><p>The service includes a special section for children, with teaching from the catechism.</p></details><details><summary>What is Catechism Club?</summary><p>An 8:30am Sunday gathering during school terms, open to all ages. <a href="#catechism">About the club →</a></p></details><details><summary>How do I get there and where can I park?</summary><p>Roseville Station is about a 5–10 minute walk away. Street parking is available on Lord Street and nearby streets; please check the signs for restrictions.</p></details><details><summary>Questions before you visit?</summary><p>For access or any other questions, contact the church at <a href="mailto:administrator@rosevillechurch.com.au">administrator@rosevillechurch.com.au</a> or <a href="tel:+61294165054">(02) 9416 5054</a>.</p></details></div></section>`,
about:photo('About','Who we are','about-photo')+`<section id="content" class="section split"><div><h2>About</h2></div><div><p>The congregation at the Presbyterian Church of Roseville, Lindfield, and Killara is part of the <a class="inline-plan-link" href="https://pcnsw.org.au/" target="_blank" rel="noopener">PCNSW</a>, embracing the Bible as God’s inspired, infallible, and inerrant word.</p><p>The reading and preaching of God’s word occupies a prominent place in the worship services, including singing from the song book of Christ our Lord – the Psalms.</p><p>All who desire to draw near to the living God in worship – or just to visit and see – are warmly invited to join the congregation at Roseville Presbyterian.</p><a class="textlink" href="#visit">Visit us →</a></div></section>`,
community:photo('Community','What’s happening')+`<section id="content" class="section"><h2>Community</h2><div class="rows"><div class="row"><h3>Bible study</h3><p>Wednesday evenings at 7:30pm during school terms, in Brice Hall and on Zoom.</p><a href="#study">Study together →</a></div><div class="row"><h3>Children & families</h3><p>Children join in congregational worship, with a section of the service especially for them.</p><a href="#children">For children →</a></div><div class="row"><h3>Catechism Club</h3><p>Working through the Westminster Shorter Catechism on Sunday mornings during school terms.</p><a href="#catechism">About the club →</a></div><div class="row"><h3>Roseville Cares</h3><p>Each month, dedicated offerings support selected Christian organisations and their work of care and mission.</p><a href="#cares">Current partners →</a></div><div class="row"><h3>Bible Study Fellowship</h3><p>A weekly Bible study for women, Tuesdays at 10:00am at Roseville.</p><a href="#bsf">About BSF →</a></div><div class="row"><h3>Church calendar</h3><p>Find church lunches, working bees and other dates still to come.</p><a href="#calendar">View calendar →</a></div><div class="row"><h3>Church newsletter</h3><p>News for the congregation. The existing password is required.</p><a href="https://rosevillechurch.com.au/newsletter/" target="_blank" rel="noopener">Open newsletter →</a></div></div></section>`,
calendar:()=>pageSection('Church Calendar',`<p>These plans are subject to change. The latest information will be announced in church.</p>${remainingCalendar().length?calendarList(remainingCalendar()):'<p>No more dates are listed for this year. Contact the church office for the next calendar.</p>'}`),
cares:pageSection('Roseville Cares',`<p>Roseville Cares is part of the diaconal ministry of the church. Once each month the offerings dedicated at church are given to selected organisations.</p>${caresList()}`,['community','Community']),
study:pageSection('Bible Study',`<p>A Bible study group meets at 7:30pm on Wednesday nights during school terms, in Brice Hall and on Zoom.</p><div id="study-document"></div><p>The 2026 studies have included <em>Learning to Love the Psalms</em> in Term 1 and the life of David in 1 &amp; 2 Samuel in Terms 2 and 3.</p><a class="textlink" href="mailto:administrator@rosevillechurch.com.au?subject=Bible%20study%20enquiry">Ask about joining →</a>`,['community','Community']),
children:pageSection('Children in worship',`<p>Children worship with the congregation. During the service, there is a special section for children with teaching from the catechism.</p>`,['community','Community']),
bsf:pageSection('Bible Study Fellowship',`<p>BSF is a weekly Bible study for women. The Roseville group meets on Tuesdays at 10:00am at Roseville Presbyterian Church, 28 Lord Street.</p><p>Members study Scripture during the week, then gather to discuss it in a small group, hear teaching and use the lesson notes to explore the passage further.</p><p>Check the BSF class listing for current dates and joining details.</p><a class="textlink" href="https://join.bsfinternational.org/class/813/Um9zZXZpbGxlIFByZXNieXRlcmlhbiBDaHVyY2grMTA6MDAgQU0%3D?searchResult=%3Flatitude%3D-33.7842176%26longitude%3D151.1894277%26address%3DRoseville%2520NSW%25202069,%2520Australia%26placeId%3DChIJZz61ed6oEmsRQMkyFmh9AQU%26url%3Dhttps:%252F%252Fmaps.google.com%252F%253Fcid%253D360707331168848192%26distance%3D40%26page%3D0%26size%3D1000%26genders%3DWomen%26genders%3DMixed%26times%3D12:00-18:00%26times%3D06:00-12:00%26times%3D18:00-24:00%26times%3D00:00-06:00%26days%3DAll%26days%3DSunday%26days%3DMonday%26days%3DTuesday%26days%3DWednesday%26days%3DThursday%26days%3DFriday%26days%3DSaturday" target="_blank" rel="noopener">See the Roseville class and join →</a>`,['community','Community']),
catechism:pageSection('Catechism Club',`<p>Join us at 8:30am on Sundays during school terms.</p><p>We are working through the Westminster Shorter Catechism. It helps us study the truths taught in Scripture in a comprehensive and systematic way, using <a class="book-link" href="https://reformers.com.au/products/9781527109025-illustrated-westminster-shorter-catechism-the-andrew-green-sasko-nezamurdinov-ben-preston-ira-minof-illustrator" target="_blank" rel="noopener"><em>The Illustrated Westminster Shorter Catechism</em></a>.</p>`,['community','Community']),
worship:pageSection('The Lord’s Day',`<div class="embed-block"><h2>Watch online</h2><iframe class="embed-frame" title="Roseville Presbyterian Church YouTube videos" src="https://www.youtube-nocookie.com/embed/videoseries?list=UUWSVpPsBME0VT0-Py7mFW8A" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><p class="embed-fallback"><a class="textlink" href="https://m.youtube.com/@slpcrau/streams" target="_blank" rel="noopener">See livestreams on YouTube →</a></p></div><div class="embed-block" id="latest-guide"><h2>Worship Guide</h2><p>The guide contains the order of morning worship and a simple guide for evening worship at home, for individuals, families or wider gatherings.</p><div class="guide-viewer"><img id="guide-page" src="assets/guide-15-nov-2026-01.webp" alt="Worship Guide page 1 of 10" loading="lazy"><div class="guide-controls"><button type="button" id="guide-prev" disabled>← Previous</button><span id="guide-count">1 / 10</span><button type="button" id="guide-next">Next →</button></div></div></div><section class="guide-archive-section" aria-labelledby="earlier-guides-heading"><h2 id="earlier-guides-heading">Download guides</h2><div class="rows guide-archive-list" id="guide-archive"></div></section><blockquote class="scripture"><p>It is good to give thanks to the Lord, to sing praise to your name, Most High, to declare your faithful love in the morning and your faithfulness at night.</p><cite><a href="#credits" aria-label="Psalm 92 verses 1 to 2 — scripture credits">Psalm 92:1–2</a></cite></blockquote>`,['resources','Worship &amp; Bible']),
reading:()=>pageSection('Bible Reading Plan',`<p>The current 2026 readings are listed below. The complete downloadable plan is available <a class="inline-plan-link" id="reading-plan-pdf" href="assets/Roseville-Bible-Reading-Plan.pdf" target="_blank" rel="noopener">here</a>.</p>${readingList()}<blockquote class="scripture"><p>I have not turned from your judgments, for you yourself have instructed me. How sweet your word is to my taste—sweeter than honey in my mouth. I gain understanding from your precepts; therefore I hate every false way.</p><cite><a href="#credits" aria-label="Psalm 119 verses 102 to 104 — scripture credits">Psalm 119:102–104</a></cite></blockquote>`,['resources','Worship &amp; Bible']),
credits:pageSection('Scripture credits',`<p>Scripture quotations marked CSB have been taken from the Christian Standard Bible®, Copyright © 2017 by Holman Bible Publishers. Used by permission. Christian Standard Bible® and CSB® are federally registered trademarks of Holman Bible Publishers.</p>`,['resources','Worship &amp; Bible']),
staff:`<section class="section staff-page"><h1>Update the church sign</h1><p>Announcements or a verse for the week. Only authorised staff can save changes.</p><form id="staff-form"><label for="sign-type">Sign type</label><select id="sign-type"><option value="Announcement">Announcement</option><option value="Verse of the week">Verse of the week</option></select><label for="sign-text">Message</label><textarea id="sign-text" maxlength="180" rows="5" required></textarea><button class="outline" type="submit">Save sign</button><p id="staff-status" role="status"></p></form></section>`,
resources:photo('Worship & Bible','Explore','resourceshero')+`<section id="content" class="section"><h2>Worship &amp; Bible</h2><div class="rows"><div class="row"><h3>Worship guides</h3><p>The order of morning worship and a guide for worship at home.</p><a href="#worship">Latest guides →</a></div><div class="row"><h3>Watch online</h3><p>Watch the Sunday morning livestream on the church’s YouTube channel.</p><a href="#worship">Watch online →</a></div><div class="row"><h3>Bible reading plan</h3><p>Follow the church's daily readings or download the plan.</p><a href="#reading">Reading plan →</a></div><div class="row"><h3>Bible study</h3><p>Wednesday evenings at 7:30pm during school terms, in Brice Hall and on Zoom.</p><a href="#study">Study together →</a></div></div></section>`};

let nightMode=false;
let doorLightsOn=false;
let doorOpened=false;
let entryTimer=null;
function applyNightMode(){
 document.body.classList.toggle('night',nightMode);
 const art=document.querySelector('.church-art');if(art)art.src=nightMode?'assets/church-night-unlit.png':'assets/church-day-unlit.png';const lit=document.querySelector('.church-lit');if(lit)lit.src=nightMode?'assets/church-night-lit.png':'assets/church-day-lit.png';
 const opened=document.querySelector('.church-open');if(opened)opened.src='assets/church-day-open.png';const drawing=document.querySelector('.drawing');if(drawing){drawing.classList.toggle('lights-on',doorLightsOn);drawing.classList.toggle('door-open',doorOpened&&!nightMode)}
 const heading=document.querySelector('.homehero h1');if(heading)heading.title=nightMode?'Double tap to return to daytime':'Double tap to see the church at night';if(nightMode)fitSkyToChurch();
}

const churchSilhouette=[null,null,null,null,null,[0.64743,0.7367],[0.61046,0.74932],[0.58611,0.75203],[0.57529,0.75203],[0.57439,0.75293],[0.55636,0.75473],[0.54193,0.75293],[0.53742,0.74662],[0.53562,0.75113],[0.53742,0.75293],[0.53832,0.75473],[0.53922,0.75834],[0.54644,0.75744],[0.53652,0.75564],[0.5257,0.75473],[0.51668,0.74932],[0.50676,0.74482],[0.49684,0.74482],[0.48693,0.7394],[0.4761,0.73399],[0.46619,0.73219],[0.45627,0.73219],[0.44635,0.73129],[0.43643,0.72949],[0.42651,0.72768],[0.41569,0.72858],[0.40667,0.72858],[0.39675,0.72768],[0.38683,0.72588],[0.37601,0.72498],[0.3661,0.72408],[0.35618,0.73309],[0.30839,0.7358],[0.27863,0.7367],[0.25068,0.7367],[0.20649,0.7358],[0.18395,0.7358],[0.17674,0.76375],[0.18305,0.7917],[0.20289,0.7349],[0.22362,0.7385],[0.24707,0.7376],[0.26781,0.7376],[0.32191,0.7376],[0.34986,0.7358],[0.38052,0.73219],[0.40848,0.72949],[0.39766,0.72678],[0.37241,0.72949],[0.38593,0.72858],[0.38323,0.72588],[0.38052,0.72408],[0.34175,0.72588],[0.33544,0.73399],[0.33724,0.74031],[0.3697,0.74031],[0.3661,0.7367],[0.36429,0.78539],[0.33003,0.74211],[0.31109,0.74121],[0.32011,0.74211],[0.35347,0.86564],[0.35077,0.74932],[0.34806,0.75203],[0.34536,0.75293],[0.30388,0.75293],[0.30388,0.75293],[0.3147,0.74662],[0.33454,0.74662],[0.33183,0.74662],[0.33003,0.74752],[0.32642,0.74752],[0.32372,0.74842],[0.32101,0.74842],[0.3183,0.75023],[0.3165,0.75113],[0.31289,0.75023],[0.31019,0.75023],[0.29486,0.75113],[0.29396,0.74301],[0.33183,0.72678],[0.3661,0.71867],[0.40126,0.70965],[0.43643,0.70063],[0.4725,0.69161],[0.51398,0.53291],null,null,null,null,null];
function fitSkyToChurch(){
 const sky=document.querySelector('.night-sky'),art=document.querySelector('.church-art');if(!sky||!art)return;
 const sr=sky.getBoundingClientRect(),ar=art.getBoundingClientRect();if(!sr.width||!sr.height||!ar.width||!ar.height)return;
 const x=ar.left-sr.left,y=ar.top-sr.top,pad=5;
 const tops=[],bottoms=[];
 churchSilhouette.forEach((b,i)=>{if(!b)return;const left=x+i*ar.width/96,right=x+(i+1)*ar.width/96;tops.push([left-pad,y+b[0]*ar.height-pad],[right+pad,y+b[0]*ar.height-pad]);bottoms.push([left-pad,y+b[1]*ar.height+pad],[right+pad,y+b[1]*ar.height+pad])});
 const points=tops.concat(bottoms.reverse());
 const hole=points.map((p,i)=>(i?'L':'M')+p[0].toFixed(2)+' '+p[1].toFixed(2)).join(' ')+'Z';
 sky.style.clipPath='path(evenodd, "M0 0H'+sr.width+'V'+sr.height+'H0Z '+hole+'")';
 sky.querySelectorAll('.star').forEach(star=>{const r=star.getBoundingClientRect(),cx=r.left+r.width/2-ar.left,cy=r.top+r.height/2-ar.top;const bin=Math.floor(cx/ar.width*96),b=churchSilhouette[bin];star.classList.toggle('occluded',!!b&&cy>=b[0]*ar.height-pad&&cy<=b[1]*ar.height+pad)});
}
const skyResizeObserver=new ResizeObserver(()=>fitSkyToChurch());

function setupInteractions(){
 const drawing=document.querySelector('.drawing');if(!drawing||drawing.dataset.interactions)return;drawing.dataset.interactions='ready';skyResizeObserver.disconnect();skyResizeObserver.observe(drawing);skyResizeObserver.observe(document.querySelector('.homehero'));fitSkyToChurch();
 const heading=document.querySelector('.homehero h1');
 const entryButton=document.querySelector('.entry-button');
 const setLights=(on)=>{doorLightsOn=on;drawing.classList.toggle('lights-on',on)};
 const toggleLights=()=>{if(!nightMode&&doorOpened)return;setLights(!doorLightsOn)};
 // Quiet Easter egg: three cross taps inside two seconds, then the Worship Guide.
 let crossCount=0,crossLast=0;
 drawing.querySelector('.cross-guide-hit')?.addEventListener('click',()=>{
  const now=performance.now();crossCount=(now-crossLast<=2000)?crossCount+1:1;crossLast=now;
  if(crossCount===3){crossCount=0;navigateToPage('worship')}
 });
 drawing.querySelector('.main-door')?.addEventListener('click',toggleLights);
 drawing.querySelector('.second-door')?.addEventListener('click',toggleLights);
 drawing.querySelector('.nearby-window')?.addEventListener('click',toggleLights);
 drawing.querySelectorAll('.side-windows,.far-windows').forEach(target=>target.addEventListener('click',()=>{if(nightMode)toggleLights()}));
 let adminClicks=[];
 drawing.querySelector('.admin-door')?.addEventListener('click',event=>{if(nightMode)toggleLights();const now=performance.now();adminClicks=adminClicks.filter(t=>now-t<2000);adminClicks.push(now);if(adminClicks.length>=3||event.detail>=3){adminClicks=[];window.open('https://app.pagescms.org','_blank','noopener,noreferrer')}});
 if(entryButton)entryButton.addEventListener('click',()=>{
  if(entryTimer)return;
  entryButton.classList.add('is-selected');
  if(doorOpened&&!nightMode){navigateToPage('visit');return}
  const wasLit=doorLightsOn;setLights(true);
  if(nightMode){entryTimer=setTimeout(()=>{entryTimer=null;navigateToPage('visit')},wasLit?200:440);return}
  entryTimer=setTimeout(()=>{doorOpened=true;drawing.classList.add('door-open');entryTimer=setTimeout(()=>{entryTimer=null;navigateToPage('visit')},620)},wasLit?0:290);
 });

 let lastTouch=0,lastTouchToggle=0;
 const toggle=()=>{nightMode=!nightMode;doorLightsOn=false;doorOpened=false;if(entryTimer){clearTimeout(entryTimer);entryTimer=null}entryButton?.classList.remove('is-selected');document.querySelectorAll('.night-sky .star').forEach(star=>star.classList.remove('launching','spent'));applyNightMode()};
 heading.addEventListener('dblclick',()=>{if(Date.now()-lastTouchToggle>700)toggle()});
 heading.addEventListener('pointerup',event=>{if(event.pointerType!=='touch')return;const now=Date.now();if(now-lastTouch<500){toggle();lastTouchToggle=now;lastTouch=0}else lastTouch=now});
 heading.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle()}});
 const shoot=(star)=>{
  if(star.classList.contains('launching')||star.classList.contains('spent'))return;
  const index=[...document.querySelectorAll('.night-sky .star')].indexOf(star);
  const paths=[[165,-65],[150,75],[-170,95],[-155,-40],[120,95]];
  const [dx,dy]=paths[index%paths.length];
  star.style.setProperty('--travel-x',dx+'px');star.style.setProperty('--travel-y',dy+'px');
  star.style.setProperty('--tail-angle',Math.atan2(-dy,-dx)+'rad');
  star.classList.add('launching');
  star.addEventListener('animationend',event=>{if(event.animationName==='star-flight'){star.classList.remove('launching');star.classList.add('spent')}},{once:true});
 };
 document.querySelectorAll('.night-sky .star').forEach(star=>star.addEventListener('click',()=>shoot(star)));
 drawing.querySelectorAll('.cloud').forEach(cloud=>{
  cloud.addEventListener('click',()=>{
   const image=cloud.querySelector('.cloud-ink');
   image.classList.remove('tapped');void image.offsetWidth;image.classList.add('tapped');
  });
 });
}
function loadSign(){const board=document.getElementById('sign-message');if(!board||!cmsData)return;const todaySydney=new Intl.DateTimeFormat('sv-SE',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const items=cmsData.announcements.filter(a=>a.published&&(!a.use_expiry_date||!a.expiry_date||String(a.expiry_date).slice(0,10)>=todaySydney)).sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));let index=0;let timer;
 const display=()=>{const item=items[index];board.textContent=item?[item.title,item.description,item.show_event_date&&item.event_date?formatDate(item.event_date):''].filter(Boolean).join('\n'):cmsData.board.message;board.classList.toggle('sign-long',board.textContent.length>100);const stamp=document.getElementById('sign-updated');if(stamp){const updated=item?.updated_at||cmsData.board?.updated_at;if(updated&&/^\d{4}-\d{2}-\d{2}/.test(updated)){stamp.textContent='Last updated '+formatDate(updated.slice(0,10));stamp.hidden=false}else{stamp.textContent='';stamp.hidden=true}}const controls=document.getElementById('sign-controls');if(controls)controls.hidden=items.length<2;let more=document.getElementById('sign-more');if(more)more.remove();if(item&&/^(https:\/\/|#[a-z-]+$)/.test(item.link||'')){more=document.createElement('a');more.id='sign-more';more.className='sign-more';more.href=item.link;more.textContent='More →';if(item.link.startsWith('https://')){more.target='_blank';more.rel='noopener'}board.parentElement.append(more)}};
 if(items.length>1){let controls=document.getElementById('sign-controls');if(!controls){controls=document.createElement('div');controls.id='sign-controls';controls.className='sign-controls';controls.innerHTML='<button type="button" aria-label="Previous announcement">←</button><button type="button" aria-label="Next announcement">→</button>';board.closest('.noticeboard').append(controls)}controls.children[0].onclick=()=>{index=(index+items.length-1)%items.length;display()};controls.children[1].onclick=()=>{index=(index+1)%items.length;display()};const area=board.closest('.noticeboard');timer=setInterval(()=>{if(!area.matches(':hover,:focus-within')&&!document.hidden){index=(index+1)%items.length;display()}},7000);window.addEventListener('hashchange',()=>clearInterval(timer),{once:true})}display()}
function setupStaff(){const form=document.getElementById('staff-form');if(form)form.outerHTML='<p>Church editors sign in through <a class="textlink" href="https://app.pagescms.org" target="_blank" rel="noopener">Pages CMS →</a>.</p>'}
async function loadCMS(){try{const response=await fetch('assets/site-content.json');if(!response.ok)return;cmsData=await response.json();const d=cmsData.details;document.querySelectorAll('.contact-details').forEach(el=>{const a=el.querySelectorAll('a');a[0].textContent=d.address;a[0].href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(d.address);a[1].textContent=d.email;a[1].href='mailto:'+d.email;a[2].textContent=d.phone;a[2].href='tel:'+d.phone.replace(/[^+\d]/g,'')});current='';render()}catch(error){console.warn('Editor content unavailable',error)}}
function updateCMSPage(page){if(!cmsData)return;const data=cmsData;if(page==='worship'){const archive=document.getElementById('guide-archive');if(archive)archive.hidden=false}
 if(page==='reading'){const link=document.getElementById('reading-plan-pdf');if(link&&data.plan.pdf)link.href=data.plan.pdf}
 if(page==='study'&&data.study.pdf){const area=document.getElementById('study-document');const a=document.createElement('a');a.className='textlink';a.href=data.study.pdf;a.target='_blank';a.rel='noopener';a.textContent='Open '+(data.study.title||'Bible Study PDF')+' →';const p=document.createElement('p');p.textContent=data.study.description||'';area.append(p,a)}
 if(page==='visit'){const times=[data.details.catechism_time,data.details.morning_time,data.details.evening_time];document.querySelectorAll('.service-time strong a').forEach((a,i)=>{a.textContent=a.textContent.replace(/^\S+/,times[i])});const address=document.querySelector('.visit-location .map-address');if(address)address.textContent=data.details.address}}
function setupClickableRows(){document.querySelectorAll('.row:not(details):has(a[href])').forEach(row=>{row.addEventListener('click',event=>{if(event.target.closest('a'))return;row.querySelector('a[href]').click()})})}
const defaultGuideArchive=[
 {date:'2026-11-08',pdf:'https://rosevillechurch.com.au/wp-content/uploads/2026/11/Worship-Guide-8-Nov-2026.pdf',passage_description:''},
 {date:'2026-11-01',pdf:'https://rosevillechurch.com.au/wp-content/uploads/2026/10/Worship-Guide-1-Nov-2026.pdf',passage_description:''}
];
function setupGuideArchive(){
 const target=document.getElementById('guide-archive');if(!target)return;
 const guide=cmsData?.guide||{date:'2026-11-15',title:'15 November 2026',pdf:'https://rosevillechurch.com.au/wp-content/uploads/2026/11/Worship-Guide-15-Nov-2026.pdf'};
 const dateString=guide.date||String(guide.title||'').match(/\d{1,2}\s+\w+\s+\d{4}/)?.[0]||'2026-11-15';
 const currentKey=/^\d{4}-\d{2}-\d{2}$/.test(dateString)?dateString:new Date(dateString).toISOString().slice(0,10);
 const current={date:currentKey,pdf:guide.pdf,passage_description:guide.passage_description||'',current:true};
 const history=(Array.isArray(cmsData?.guide_archive)?cmsData.guide_archive:defaultGuideArchive)
  .filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.date||'')&&x.date<currentKey)
  .sort((a,b)=>b.date.localeCompare(a.date));
 const safePDF=url=>typeof url==='string'&&(/^https:\/\/[^\s/@]+[^\s]*$/i.test(url)||/^assets\/[\w./-]+\.pdf(?:[?#][^\s]*)?$/i.test(url)&&!url.includes('..'));
 const previousKey=new Date(Date.parse(currentKey+'T12:00:00Z')-7*86400000).toISOString().slice(0,10);
 const todayKey=sydneyTodayKey();
 target.innerHTML=[current,...history].map(item=>{
  const currentRow=item.current===true,lastWeek=!currentRow&&item.date===previousKey;
  const title=new Intl.DateTimeFormat('en-AU',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}).format(new Date(item.date+'T12:00:00Z'));
  const heading='<span><span class="reading-date">'+esc(title)+'</span></span>';
  const status=currentRow?(item.date===todayKey?'Today':'This week'):(lastWeek?'Last week':'');
  const label=status?'<span class="row-tag">'+esc(status)+'</span>':'';
  const description=String(item.passage_description||'').trim();
  const link=safePDF(item.pdf)?'<div class="reading-links cares-links"><span class="reading-passage"><a href="'+esc(item.pdf)+'" target="_blank" rel="noopener noreferrer" aria-label="Download Worship Guide PDF for '+esc(title)+'">Download PDF</a></span></div>':'';
  const cls='row compact reading-day cares-day guide-day'+(currentRow?' is-current-month is-current-guide':' is-past')+(lastWeek?' is-last-week':'');
  if(!link&&!description)return '<div class="'+cls+'"><div class="cares-static">'+heading+label+'</div></div>';
  return '<details class="'+cls+'"><summary>'+heading+label+'</summary><div class="cares-details">'+(description?'<p class="cares-description">'+esc(description)+'</p>':'')+link+'</div></details>';
 }).join('');
}
function setupGuide(){const image=document.getElementById('guide-page');if(!image)return;const prev=document.getElementById('guide-prev'),next=document.getElementById('guide-next'),count=document.getElementById('guide-count');const pages=cmsData?.guide?.pages||Array.from({length:10},(_,i)=>`assets/guide-15-nov-2026-${String(i+1).padStart(2,'0')}.webp`);if(!pages.length){const viewer=image.closest('.guide-viewer');viewer.innerHTML='<iframe class="guide-pdf-frame" title="Current Worship Guide PDF"></iframe>';viewer.querySelector('iframe').src=cmsData.guide.pdf;return}let page=0;const show=()=>{image.src=pages[page];image.alt=`Worship Guide page ${page+1} of ${pages.length}`;count.textContent=`${page+1} / ${pages.length}`;prev.disabled=page===0;next.disabled=page===pages.length-1};prev.onclick=()=>{if(page>0){page--;show()}};next.onclick=()=>{if(page<pages.length-1){page++;show()}};show()}

// Real, crawlable page paths with History API routing and session scroll restoration.
// Keep links, styling and CMS behaviour identical for visitors.
const routeNames={home:'Home',about:'About',resources:'Worship & Bible',community:'Community',calendar:'Calendar',study:'Bible Study',cares:'Roseville Cares',children:'Children in worship',catechism:'Catechism Club',bsf:'Bible Study Fellowship',worship:'The Lord’s Day',reading:'Bible Reading Plan',credits:'Scripture credits',visit:'Visit us'};
const SITE_ROOT=new URL(document.baseURI).pathname;const PREVIEW_HOST=location.hostname==='raw.githack.com';const PRODUCTION_ROOT='https://louis3yau.github.io/roseville-preview/';
const routePath=page=>SITE_ROOT+(page==='home'?'':page+'/')+(PREVIEW_HOST?'index.html':'');
const pageFromPath=()=>{const part=decodeURIComponent(location.pathname.slice(SITE_ROOT.length)).split('/')[0];return Object.hasOwn(pages,part)?part:'home'};
let routeEntries={};try{routeEntries=JSON.parse(sessionStorage.getItem('roseville-path-history-v2')||'{}')}catch{}
let activeEntry=null,requestedAnchor=null,current='';
const saveRoutes=()=>{try{sessionStorage.setItem('roseville-path-history-v2',JSON.stringify(routeEntries))}catch{}};
const rememberScroll=()=>{if(activeEntry&&routeEntries[activeEntry]){routeEntries[activeEntry].y=window.scrollY;saveRoutes()}};
history.scrollRestoration='manual';
window.addEventListener('scroll',rememberScroll,{passive:true});
window.addEventListener('pagehide',rememberScroll);
function enterRoute(page){
 const key=location.pathname+location.search+location.hash;
 let id=history.state?.rosevilleEntry;
 const known=!!(id&&routeEntries[id]?.key===key);
 if(!known){id=Date.now().toString(36)+Math.random().toString(36).slice(2,7);routeEntries[id]={key,page,y:0,previous:activeEntry};history.replaceState({...history.state,rosevilleEntry:id},'',location.href);saveRoutes()}
 activeEntry=id;
 return known?routeEntries[id].y:null;
}
function focusPage(){const h=document.querySelector('main h1,main h2');const target=h||document.getElementById('main');if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}}
function navigateToPage(page='home',section=''){
 if(!Object.hasOwn(pages,page))page='home';
 const target=routePath(page)+(section?'#'+encodeURIComponent(section):'');
 if(location.pathname+location.hash===target){if(section)document.getElementById(section)?.scrollIntoView();else window.scrollTo({top:0,behavior:'smooth'});return}
 rememberScroll();history.pushState(null,'',target);render();requestAnimationFrame(focusPage);
}
function setupBackLink(){
 const entry=routeEntries[activeEntry];if(!entry||entry.page==='home')return;
 let previous=routeEntries[entry.previous],steps=1;
 while(previous&&previous.page===entry.page){previous=routeEntries[previous.previous];steps++}
 let link=document.querySelector('main .parent-link');
 if(!link){const section=document.querySelector('main .section');if(!section)return;link=document.createElement('a');link.className='parent-link';section.prepend(link)}
 const fallback={study:'community',cares:'community',children:'community',catechism:'community',bsf:'community',worship:'resources',reading:'resources',credits:'resources'}[entry.page]||'home';
 const targetPage=previous?.page||fallback;
 link.href=routePath(targetPage);
 if(previous)link.dataset.historyBack=String(steps);else delete link.dataset.historyBack;
 const label=routeNames[targetPage]||'Home';
 link.innerHTML='<span class="back-arrow" aria-hidden="true">←</span><span>'+esc(label)+'</span>';
 link.setAttribute('aria-label','Return to '+label);
}
function localizeLinks(){
 document.querySelectorAll('a[href^="#"]').forEach(a=>{
  const source=a.getAttribute('href').slice(1),[possible,anchor]=source.split('/');
  if(Object.hasOwn(pages,possible))a.setAttribute('href',routePath(possible)+(anchor?'#'+anchor:''));
  else if(source==='content')a.setAttribute('href',routePath(current)+'#content');
 });
}
document.addEventListener('click',event=>{
 const a=event.target.closest('a[href]');if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target==='_blank'||a.hasAttribute('download'))return;
 if(a.matches('.parent-link')&&a.dataset.historyBack){event.preventDefault();rememberScroll();history.go(-Number(a.dataset.historyBack));return}
 const href=a.getAttribute('href'),url=new URL(href,document.baseURI);
 if(href.startsWith('#')){
  const [name,anchor]=href.slice(1).split('/');
  if(Object.hasOwn(pages,name)){event.preventDefault();navigateToPage(name,anchor||'');return}
  if(name==='content'){event.preventDefault();navigateToPage(current,'content');return}
 }
 if(url.origin===location.origin&&url.pathname.startsWith(SITE_ROOT)){
  const part=decodeURIComponent(url.pathname.slice(SITE_ROOT.length)).split('/')[0];
  if(part===''||Object.hasOwn(pages,part)){
   event.preventDefault();navigateToPage(part||'home',decodeURIComponent(url.hash.slice(1)));return
  }
 }
},true);
function render(){
 const page=pageFromPath(),section=decodeURIComponent(location.hash.slice(1));
 const restoreY=enterRoute(page);
 if(page!==current){
  document.getElementById('main').innerHTML=typeof pages[page]==='function'?pages[page]():pages[page];
  current=page;document.body.className='page-'+page;
  const descriptions={home:'Roseville Presbyterian Church in Roseville, NSW. Join us for Sunday morning worship at 9:30am.',visit:'Sunday service times, directions and what to expect at Roseville Presbyterian Church.',about:'Learn about Roseville Presbyterian Church and our worship.',community:'Bible study, Catechism Club, Roseville Cares and fellowship at Roseville.',calendar:'Upcoming church events at Roseville Presbyterian Church.',worship:'Sunday worship livestream and guides for morning and evening worship at Roseville Presbyterian Church.',reading:'Daily Bible readings and the complete reading plan from Roseville Presbyterian Church.'};
  const desc=descriptions[page]||'Roseville Presbyterian Church in Roseville, NSW.';
  document.querySelector('meta[name=description]').content=desc;
  const title=(page==='home'?'Welcome':routeNames[page]||page)+' · Roseville Presbyterian Church';
  document.title=title;
  document.querySelector('meta[property="og:title"]')?.setAttribute('content',title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content',desc);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content',PRODUCTION_ROOT+(page==='home'?'':page+'/'));
  document.querySelector('link[rel=canonical]')?.setAttribute('href',location.origin+routePath(page));
  setupClickableRows();updateCMSPage(page);setupGuide();setupGuideArchive()
 }
 setupBackLink();localizeLinks();applyNightMode();setupInteractions();loadSign();setupStaff();
 if(section)requestAnimationFrame(()=>document.getElementById(section)?.scrollIntoView({block:'start',behavior:'instant'}));
 else if(restoreY!==null)requestAnimationFrame(()=>window.scrollTo({top:restoreY,behavior:'instant'}));
 else window.scrollTo({top:0,behavior:'instant'});
 document.querySelectorAll('nav a').forEach(a=>{
  const selected=a.getAttribute('href')===routePath(page);
  if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  a.classList.toggle('is-selected',selected&&a.classList.contains('outline'))
 });
 document.querySelector('nav').classList.remove('open');
 document.querySelector('.menu').setAttribute('aria-expanded','false');
 document.querySelector('.menu').setAttribute('aria-label','Open menu');
}
document.querySelector('.menu').onclick=()=>{
 const open=document.querySelector('nav').classList.toggle('open');
 document.querySelector('.menu').setAttribute('aria-expanded',String(open));
 document.querySelector('.menu').setAttribute('aria-label',open?'Close menu':'Open menu')
};
document.addEventListener('click',event=>{const button=event.target.closest('a.outline,button.outline');if(button)button.classList.add('is-selected')});
window.addEventListener('popstate',()=>{render();requestAnimationFrame(focusPage)});
window.addEventListener('hashchange',()=>{render();requestAnimationFrame(focusPage)});
document.querySelectorAll('.brand,.footer-home').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();navigateToPage('home')}));
if(location.pathname===SITE_ROOT&&/^#(?:home|about|resources|community|calendar|study|cares|children|catechism|bsf|worship|reading|credits|visit)(?:\/|$)/.test(location.hash)){
 const [legacy,section]=location.hash.slice(1).split('/');
 history.replaceState(history.state,'',routePath(legacy)+(section?'#'+section:''));
}
render();loadCMS();
