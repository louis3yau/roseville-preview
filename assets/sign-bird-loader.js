/* No bird artwork is requested until a day-time flower patch is tapped. */
(()=>{
let loading=false;
function sync(){const host=document.querySelector('.noticeboard');if(!host||host.dataset.birdLoader)return;host.dataset.birdLoader='1';const meadow=host.querySelector('.sign-wildflowers');if(!meadow)return;
const pending=new Set();host.addEventListener('roseville:bloom',e=>{if(!host.dataset.birdMounted)pending.add(e.detail.key);});const mount=()=>{window.RosevilleBird?.(host);for(const key of pending)host.dispatchEvent(new CustomEvent('roseville:bloom',{detail:{key}}));pending.clear();};
function load(){if(document.body.classList.contains('night'))return;if(window.RosevilleBird){mount();return;}if(loading)return;loading=true;window.addEventListener('roseville:bird-ready',mount,{once:true});const script=document.createElement('script');script.src='assets/sign-bird-light.js?v=4';script.async=true;script.onerror=()=>{loading=false;};document.head.appendChild(script);}
meadow.addEventListener('click',load,{capture:true});if(window.RosevilleBird)mount();}
sync();const main=document.getElementById('main');if(main)new MutationObserver(sync).observe(main,{childList:true});
})();
