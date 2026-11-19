/* Load the flower artwork only when the sign is near the viewport. */
(()=>{
 let loading=false,observer;
 const main=document.getElementById('main');
 if(!main)return;
 function load(){
  if(loading)return;
  loading=true;observer?.disconnect();
  const script=document.createElement('script');
  script.src='assets/sign-wildflowers.js?v=5';
  script.async=true;
  document.head.appendChild(script);
 }
 function scan(){
  if(loading)return;
  observer?.disconnect();
  const sign=document.getElementById('sign-wildflowers');
  if(!sign)return;
  observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting)load();},{rootMargin:'500px'});
  observer.observe(sign);
 }
 new MutationObserver(scan).observe(main,{childList:true});
 scan();
})();
