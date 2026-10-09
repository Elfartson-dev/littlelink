/* LittleLink city ambience: quiet effects, no audio, and no animation with reduced motion. */
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "city-ambience";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }

  let w = 0, h = 0, dpr = 1, lastFrame = 0, hidden = document.hidden;
  let nextMeteor = performance.now() + 9000 + Math.random() * 12000;
  let meteor = null;
  const stars = [], water = [];
  const random = (a, b) => a + Math.random() * (b - a);

  function resize() {
    w = innerWidth; h = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars.length = 0; water.length = 0;
    for (let i = 0, n = Math.min(42, Math.max(18, Math.round(w / 32))); i < n; i++) {
      stars.push({x:random(.02,.98)*w,y:random(.025,.39)*h,s:random(.5,1.2),p:random(0,6.28),v:random(.00035,.001),a:random(.10,.28),c:Math.random()>.72?"255,118,245":"111,209,255"});
    }
    for (let i = 0, n = Math.min(34, Math.max(16, Math.round(w / 40))); i < n; i++) {
      water.push({x:random(.42,.98)*w,y:random(.57,.83)*h,l:random(2,10),p:random(0,6.28),v:random(.00015,.0004),d:random(1,4),c:Math.random()>.7?"255,88,225":"76,193,255"});
    }
  }

  function shoot(now) {
    meteor = {x:random(.1,.78)*w,y:random(.045,.25)*h,dx:random(.23,.43),dy:random(.075,.15),start:now,duration:random(520,850)};
    nextMeteor = now + random(11000,24000);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (hidden || now - lastFrame < 40) return;
    lastFrame = now;
    ctx.clearRect(0,0,w,h);

    for (const s of stars) {
      const pulse = .5 + .5 * Math.sin(now*s.v+s.p);
      const alpha = s.a * (.35 + pulse*.65);
      ctx.fillStyle = "rgba("+s.c+","+alpha.toFixed(3)+")";
      ctx.fillRect(Math.round(s.x),Math.round(s.y),s.s,s.s);
      if (pulse>.97 && s.s>.95) {
        ctx.fillStyle="rgba("+s.c+","+(alpha*.35).toFixed(3)+")";
        ctx.fillRect(Math.round(s.x-2),Math.round(s.y),5,1);
        ctx.fillRect(Math.round(s.x),Math.round(s.y-2),1,5);
      }
    }

    for (const g of water) {
      const pulse=.5+.5*Math.sin(now*g.v+g.p);
      const drift=Math.sin(now*.00012+g.p)*g.d;
      ctx.fillStyle="rgba("+g.c+","+( .035+pulse*.065 ).toFixed(3)+")";
      ctx.fillRect(g.x+drift,g.y,g.l,1);
    }

    if (!meteor && now >= nextMeteor) shoot(now);
    if (meteor) {
      const age=now-meteor.start, p=Math.min(1,age/meteor.duration);
      const x=meteor.x+meteor.dx*age, y=meteor.y+meteor.dy*age;
      const alpha=Math.sin(Math.PI*p)*.68;
      const grad=ctx.createLinearGradient(x-meteor.dx*150,y-meteor.dy*150,x,y);
      grad.addColorStop(0,"rgba(95,196,255,0)");
      grad.addColorStop(.78,"rgba(125,213,255,"+(alpha*.35).toFixed(3)+")");
      grad.addColorStop(1,"rgba(255,232,255,"+alpha.toFixed(3)+")");
      ctx.strokeStyle=grad; ctx.lineWidth=1.25; ctx.beginPath();
      ctx.moveTo(x-meteor.dx*150,y-meteor.dy*150); ctx.lineTo(x,y); ctx.stroke();
      ctx.fillStyle="rgba(255,242,255,"+alpha.toFixed(3)+")";
      ctx.fillRect(Math.round(x),Math.round(y),2,2);
      if (p>=1) meteor=null;
    }
  }

  addEventListener("resize",resize,{passive:true});
  document.addEventListener("visibilitychange",()=>{hidden=document.hidden;lastFrame=0;});
  resize();
  requestAnimationFrame(frame);
})();