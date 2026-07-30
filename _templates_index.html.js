
  // ---- apply content injected by the server ----
  var C = window.mergeContent(window.__SERVER_CONTENT || {});

  // ---- studio gallery: build carousel or grid based on dashboard setting ----
  var GALLERY=[
    {img:'backdrop-1.jpg', key:'gLabel1', name:'The Main Studio'},
    {img:'gallery-1.jpg',  key:'gLabel2', name:'The Punjab Set'},
    {img:'gallery-2.jpg',  key:'gLabel3', name:'Green Pod Corner'},
    {img:'backdrop-2.jpg', key:'gLabel4', name:'Interview Set'},
    {img:'backdrop-3.jpg', key:'gLabel5', name:'The Couch Set'},
    {img:'gallery-3.jpg',  key:'gLabel6', name:'Green Panel Set'},
    {img:'gallery-4.jpg',  key:'gLabel7', name:'Creator Corner'}
  ];
  function tileHTML(t){
    return '<div class="m-tile" style="background-image:url('+t.img+')" data-img="'+t.img+'">'+
      '<div class="m-cap"><span class="m-name" data-key="'+t.key+'">'+t.name+'</span>'+
      '<button class="m-btn" type="button" onclick="openBook(this)">More info</button></div></div>';
  }
  function buildGallery(style){
    var host=document.getElementById('galleryHost'); if(!host)return;
    var tiles=GALLERY.map(tileHTML).join('');
    if(style==='grid'){
      host.innerHTML='<div class="g-grid">'+tiles+'</div>';
    } else {
      host.innerHTML='<div class="marquee"><div class="marquee-track">'+tiles+tiles+'</div></div>';
    }
  }
  buildGallery(C.galleryStyle);

  window.applyContentObject(C);
  document.getElementById('yr').textContent = new Date().getFullYear();
  var FORM_ACTION = C.formActionUrl;
  var LAUNCH_WA = String(C.whatsappNumber || "").replace(/[^0-9]/g,"");

  // ---- first-party analytics ----
  (function(){
    var CID = localStorage.getItem('u2_cid');
    if(!CID){ CID='c'+Math.random().toString(36).slice(2)+Date.now().toString(36); localStorage.setItem('u2_cid',CID); }
    function send(type,label){
      var payload = JSON.stringify({type:type,label:label||'',path:location.pathname,cid:CID,ref:document.referrer});
      try{
        if(navigator.sendBeacon){ navigator.sendBeacon('/api/track', new Blob([payload],{type:'application/json'})); }
        else{ fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:payload,keepalive:true}); }
      }catch(e){}
    }
    window.__track = send;
    send('pageview');
    setInterval(function(){ if(document.visibilityState==='visible') send('ping'); }, 15000);
    document.addEventListener('click',function(e){ var el=e.target.closest('[data-track]'); if(el) send('click', el.getAttribute('data-track')); });
  })();

  // ---- nav ----
  var nav=document.getElementById('nav');
  addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>40);});
  var menuBtn=document.getElementById('menuBtn'), navLinks=document.getElementById('navLinks');
  menuBtn.addEventListener('click',function(){navLinks.classList.toggle('open');});
  navLinks.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){navLinks.classList.remove('open');});});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('in');});},{threshold:.18});
  document.querySelectorAll('.fade').forEach(function(el){io.observe(el);});
  var heroContent=document.querySelector('.hero .fade');
  addEventListener('scroll',function(){var y=scrollY;if(y<innerHeight&&heroContent){heroContent.style.transform='translateY('+(y*0.15)+'px)';heroContent.style.opacity=Math.max(0,1-y/(innerHeight*0.9));}},{passive:true});

  function buildRadio(row,f,name){
    f.o.forEach(function(op){
      var l=document.createElement('label'); l.className='radio-opt';
      var r=document.createElement('input'); r.type='radio'; r.name=name; r.value=op;
      r.addEventListener('change',function(){row.querySelectorAll('.radio-opt').forEach(function(x){x.classList.remove('sel');});l.classList.add('sel');});
      var sp=document.createElement('span'); sp.textContent=op; l.appendChild(r); l.appendChild(sp); row.appendChild(l);
    });
  }

  // ---- Made in Ludhiana apply modal (Google Form) ----
  var FIELDS=[
    {e:"entry.584921813", l:"Full Name", t:"text", req:true},
    {e:"entry.326751092", l:"Age", t:"number", req:true},
    {e:"entry.1748785196", l:"Phone Number (WhatsApp preferred)", t:"tel", req:true},
    {e:"entry.152699148", l:"Email Address", t:"email", req:true},
    {e:"entry.1512063546", l:"Business Name", t:"text", req:false},
    {e:"entry.1443849746", l:"Website or Instagram Link", t:"text", req:true},
    {e:"entry.1222463739", l:"Industry / Type of Business", t:"select", req:true, o:["Cycles","Hosiery","Steel","Garments","Food","Real Estate","Other"]},
    {e:"entry.496491962", l:"Year the business was founded", t:"text", req:true},
    {e:"entry.1750184037", l:"Who started the business — you or your family?", t:"radio", req:true, o:["1st Generation (I started it)","2nd Generation (My parents started it)","3rd Generation+ (Grandparents or earlier generations started it)"]},
    {e:"entry.527652678", l:"Starting Capital (approximate range)", t:"radio", req:false, o:["Under ₹10K","₹10K – ₹1L","₹1L – ₹10L","Above ₹10L","Prefer not to say"]},
    {e:"entry.43418272", l:"In one line, what does your business do today?", t:"text", req:false},
    {e:"entry.1891475589", l:"What's the hardest moment your business ever survived?", t:"text", req:false},
    {e:"entry.648593041", l:"What's the one decision that changed everything for your business?", t:"text", req:false},
    {e:"entry.1937023818", l:"Did your business ever come close to shutting down?", t:"radio", req:false, o:["Yes","No"]},
    {e:"entry.1730396006", l:"If yes, please tell us briefly about that time.", t:"textarea", req:false},
    {e:"entry.1198821171", l:"What's something about Ludhiana's business culture that most people don't know?", t:"text", req:false}
  ];
  (function(){
    var box=document.getElementById('applyFields');
    FIELDS.forEach(function(f,i){
      var wrap=document.createElement('div'); wrap.className='fld';
      var lab=document.createElement('label'); lab.innerHTML=f.l+(f.req?' <span class="req">*</span>':''); lab.setAttribute('for','f'+i); wrap.appendChild(lab);
      if(f.t==='select'){ var s=document.createElement('select'); s.id='f'+i; s.name=f.e; if(f.req)s.required=true; var ph=document.createElement('option'); ph.value=''; ph.textContent='Choose…'; s.appendChild(ph); f.o.forEach(function(op){var o=document.createElement('option');o.value=op;o.textContent=op;s.appendChild(o);}); wrap.appendChild(s);
      } else if(f.t==='radio'){ var row=document.createElement('div'); row.className='radio-row'; buildRadio(row,f,f.e); wrap.appendChild(row);
      } else if(f.t==='textarea'){ var ta=document.createElement('textarea'); ta.id='f'+i; ta.name=f.e; if(f.req)ta.required=true; wrap.appendChild(ta);
      } else { var inp=document.createElement('input'); inp.type=f.t; inp.id='f'+i; inp.name=f.e; if(f.req)inp.required=true; wrap.appendChild(inp); }
      box.appendChild(wrap);
    });
  })();
  var applyModal=document.getElementById('applyModal');
  function openApply(){applyModal.classList.add('open');document.body.classList.add('modal-locked');document.getElementById('applyForm').style.display='block';document.getElementById('applySuccess').classList.remove('show');}
  function closeApply(){applyModal.classList.remove('open');document.body.classList.remove('modal-locked');}
  applyModal.addEventListener('click',function(e){if(e.target===applyModal)closeApply();});
  addEventListener('keydown',function(e){if(e.key==='Escape'){closeApply();closeLaunch();}});
  document.getElementById('applyForm').addEventListener('submit',function(ev){
    ev.preventDefault(); var form=ev.target; var missing=[];
    FIELDS.forEach(function(f){if(f.req&&f.t==='radio'&&!form.querySelector('input[name="'+f.e+'"]:checked'))missing.push(f.l);});
    if(!form.checkValidity()){form.reportValidity();return;}
    if(missing.length){alert('Please answer: '+missing.join(', '));return;}
    var fd=new FormData();
    FIELDS.forEach(function(f){ if(f.t==='radio'){var c=form.querySelector('input[name="'+f.e+'"]:checked');if(c)fd.append(f.e,c.value);} else {var el=form.querySelector('[name="'+f.e+'"]');if(el&&el.value)fd.append(f.e,el.value);} });
    var btn=document.getElementById('applySubmit'); btn.textContent='Submitting…'; btn.disabled=true;
    if(window.__track)window.__track('click','apply_submit');
    fetch(FORM_ACTION,{method:'POST',mode:'no-cors',body:fd}).catch(function(){}).finally(function(){
      form.style.display='none'; document.getElementById('applySuccess').classList.add('show');
      btn.textContent='Submit Application →'; btn.disabled=false; form.reset();
      document.querySelectorAll('#applyForm .radio-opt.sel').forEach(function(x){x.classList.remove('sel');});
    });
  });

  // ---- Launchpad modal (submits to Google Form) ----
  var LAUNCH_ACTION="https://docs.google.com/forms/d/e/1FAIpQLScqo2gAR8S18XYjz4WiyB9AoLgEyNhey05VS3tfkwcbtIR2zA/formResponse";
  var LAUNCH_FIELDS=[
    {e:"entry.1724141481", l:"Your Name", t:"text", req:true},
    {e:"entry.1518216130", l:"Mobile Number", t:"tel", req:true},
    {e:"entry.1609699328", l:"Instagram / Channel Link", t:"text", req:true},
    {e:"entry.1580895189", l:"What stage is your idea at?", t:"select", req:true, o:["Just a rough idea","Idea is clear, not started yet","Started — a few episodes done","Already running, want to scale"]},
    {e:"entry.859825944", l:"Is your idea new or inspired from creators outside?", t:"radio", req:true, o:["Completely original","Inspired by creators I follow","A mix of both"]},
    {e:"entry.282179434", l:"What's the biggest bottleneck in executing it?", t:"textarea", req:true},
    {e:"entry.1272380470", l:"How long have you been sitting on this idea?", t:"select", req:false, o:["Less than a month","1–3 months","3–6 months","6–12 months","Over a year"]}
  ];
  (function(){
    var box=document.getElementById('launchFields');
    LAUNCH_FIELDS.forEach(function(f,i){
      var wrap=document.createElement('div'); wrap.className='fld';
      var lab=document.createElement('label'); lab.innerHTML=f.l+(f.req?' <span class="req">*</span>':''); lab.setAttribute('for','lf'+i); wrap.appendChild(lab);
      if(f.t==='select'){ var s=document.createElement('select'); s.id='lf'+i; s.name=f.e; if(f.req)s.required=true; var ph=document.createElement('option'); ph.value=''; ph.textContent='Choose…'; s.appendChild(ph); f.o.forEach(function(op){var o=document.createElement('option');o.value=op;o.textContent=op;s.appendChild(o);}); wrap.appendChild(s);
      } else if(f.t==='radio'){ var row=document.createElement('div'); row.className='radio-row'; buildRadio(row,f,f.e); wrap.appendChild(row);
      } else if(f.t==='textarea'){ var ta=document.createElement('textarea'); ta.id='lf'+i; ta.name=f.e; if(f.req)ta.required=true; wrap.appendChild(ta);
      } else { var inp=document.createElement('input'); inp.type=f.t; inp.id='lf'+i; inp.name=f.e; if(f.req)inp.required=true; wrap.appendChild(inp); }
      box.appendChild(wrap);
    });
  })();
  /* ---------- BOOK A SETUP modal (sends via WhatsApp) ---------- */
  var BOOK_WA = String(C.whatsappNumber || "").replace(/[^0-9]/g,"");
  var bookModal=document.getElementById('bookModal');
  var curSetup="this setup";
  function openBook(btn){
    var tile=btn.closest('.m-tile');
    var nameEl=tile.querySelector('.m-name');
    curSetup = nameEl ? nameEl.textContent.trim() : "this setup";
    document.getElementById('bookImg').src = tile.getAttribute('data-img') || "";
    document.getElementById('bookSetup').textContent = curSetup;
    bookModal.classList.add('open'); document.body.classList.add('modal-locked');
  }
  function closeBook(){bookModal.classList.remove('open');document.body.classList.remove('modal-locked');}
  bookModal.addEventListener('click',function(e){if(e.target===bookModal)closeBook();});
  addEventListener('keydown',function(e){if(e.key==='Escape')closeBook();});
  document.getElementById('bookForm').addEventListener('submit',function(ev){
    ev.preventDefault(); var form=ev.target;
    if(!form.checkValidity()){form.reportValidity();return;}
    var d=document.getElementById('bookDate').value;
    var t=document.getElementById('bookTime').value;
    var dur=document.getElementById('bookDur').value;
    var msg="Hi! I'd like to book the *"+curSetup+"* setup at U2ber Club Studio.\n\n📅 Date: "+d+"\n⏰ Time: "+t+"\n⏳ Duration: "+dur+"\n\nPlease quote me a price.";
    if(window.__track)window.__track('click','book_setup_quote');
    window.open("https://wa.me/"+BOOK_WA+"?text="+encodeURIComponent(msg),"_blank");
    closeBook();
  });

  var launchModal=document.getElementById('launchModal');
  function openLaunch(){launchModal.classList.add('open');document.body.classList.add('modal-locked');document.getElementById('launchForm').style.display='block';document.getElementById('launchSuccess').classList.remove('show');}
  function closeLaunch(){launchModal.classList.remove('open');document.body.classList.remove('modal-locked');}
  launchModal.addEventListener('click',function(e){if(e.target===launchModal)closeLaunch();});
  document.getElementById('launchForm').addEventListener('submit',function(ev){
    ev.preventDefault(); var form=ev.target; var missing=[];
    LAUNCH_FIELDS.forEach(function(f){if(f.req&&f.t==='radio'&&!form.querySelector('input[name="'+f.e+'"]:checked'))missing.push(f.l);});
    if(!form.checkValidity()){form.reportValidity();return;}
    if(missing.length){alert('Please answer: '+missing.join(', '));return;}
    var fd=new FormData();
    LAUNCH_FIELDS.forEach(function(f){ if(f.t==='radio'){var c=form.querySelector('input[name="'+f.e+'"]:checked');if(c)fd.append(f.e,c.value);} else {var el=form.querySelector('[name="'+f.e+'"]');if(el&&el.value)fd.append(f.e,el.value);} });
    var btn=document.getElementById('launchSubmit'); btn.textContent='Submitting…'; btn.disabled=true;
    if(window.__track)window.__track('click','launch_submit');
    fetch(LAUNCH_ACTION,{method:'POST',mode:'no-cors',body:fd}).catch(function(){}).finally(function(){
      form.style.display='none'; document.getElementById('launchSuccess').classList.add('show');
      btn.textContent='Submit Application →'; btn.disabled=false; form.reset();
      document.querySelectorAll('#launchForm .radio-opt.sel').forEach(function(x){x.classList.remove('sel');});
    });
  });
