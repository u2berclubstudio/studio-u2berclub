
  var loginEl=document.getElementById('login'), appEl=document.getElementById('app');
  var statusEl=document.getElementById('status');
  var content={};

  function api(path,opts){ opts=opts||{}; opts.headers=Object.assign({'Content-Type':'application/json'},opts.headers||{}); opts.credentials='same-origin'; return fetch(path,opts); }
  function markDirty(){statusEl.textContent='Unsaved changes';statusEl.classList.remove('ok');}
  function esc(s){return String(s==null?'':s);}

  // ---- auth ----
  function showApp(){ loginEl.style.display='none'; appEl.style.display='block'; loadContent(); loadStats(); startPolling(); }
  document.getElementById('loginBtn').addEventListener('click',login);
  document.getElementById('pw').addEventListener('keydown',function(e){if(e.key==='Enter')login();});
  function login(){
    var err=document.getElementById('loginErr'); err.textContent='';
    api('/api/login',{method:'POST',body:JSON.stringify({password:document.getElementById('pw').value})})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
      .then(function(res){ if(res.ok){showApp();} else {err.textContent=res.j.error||'Login failed';} })
      .catch(function(){err.textContent='Network error';});
  }
  document.getElementById('logoutBtn').addEventListener('click',function(){
    api('/api/logout',{method:'POST'}).finally(function(){location.reload();});
  });
  // auto-enter if already logged in
  api('/api/me').then(function(r){return r.json();}).then(function(j){if(j.authed)showApp();});

  // ---- tabs ----
  document.querySelectorAll('.tab').forEach(function(t){
    t.addEventListener('click',function(){
      document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('active');}); t.classList.add('active');
      document.querySelectorAll('.view').forEach(function(v){v.classList.remove('active');});
      document.getElementById('view-'+t.dataset.view).classList.add('active');
    });
  });

  // ---- content editor build ----
  function buildForm(){
    var form=document.getElementById('contentForm'); form.innerHTML='';
    var track=document.getElementById('trackFields'); track.innerHTML='';
    window.SITE_FIELDS.forEach(function(group){
      if(group[0]==='Tracking & Ads'){
        group[1].forEach(function(f){ track.appendChild(fieldEl(f)); });
        return;
      }
      var det=document.createElement('details'); det.className='group'; det.open=true;
      var sum=document.createElement('summary'); sum.innerHTML=group[0]+' <span class="chev">›</span>'; det.appendChild(sum);
      var body=document.createElement('div'); body.className='group-body';
      group[1].forEach(function(f){ body.appendChild(fieldEl(f)); });
      det.appendChild(body); form.appendChild(det);
    });
  }
  function fieldEl(f){
    var key=f[0],label=f[1],type=f[2],opts=f[3];
    var wrap=document.createElement('div'); wrap.className='fld';
    var lab=document.createElement('label'); lab.textContent=label; lab.setAttribute('for','a_'+key); wrap.appendChild(lab);
    var el;
    if(type==='textarea'){ el=document.createElement('textarea'); }
    else if(type==='select'){
      el=document.createElement('select');
      (opts||[]).forEach(function(o){ var op=document.createElement('option'); op.value=o[0]; op.textContent=o[1]; el.appendChild(op); });
    } else { el=document.createElement('input'); el.type='text'; }
    el.id='a_'+key; el.name=key; el.value=esc(content[key]); el.addEventListener('input',markDirty); el.addEventListener('change',markDirty);
    wrap.appendChild(el); return wrap;
  }
  function collect(){
    var data={};
    window.SITE_FIELDS.forEach(function(g){g[1].forEach(function(f){var el=document.getElementById('a_'+f[0]); if(el)data[f[0]]=el.value;});});
    return data;
  }
  function loadContent(){
    api('/api/content').then(function(r){return r.json();}).then(function(c){ content=c; buildForm(); statusEl.textContent='All changes saved'; statusEl.classList.add('ok'); });
  }
  function save(){
    var data=collect();
    api('/api/content',{method:'PUT',body:JSON.stringify(data)}).then(function(r){
      if(r.status===401){alert('Session expired, please log in again.');location.reload();return;}
      statusEl.textContent='✓ Saved & live'; statusEl.classList.add('ok'); content=window.mergeContent(data);
    }).catch(function(){statusEl.textContent='Save failed — check connection';});
  }
  document.getElementById('saveBtn').addEventListener('click',save);
  document.getElementById('saveTrack').addEventListener('click',save);

  document.getElementById('exportBtn').addEventListener('click',function(){
    var blob=new Blob([JSON.stringify(collect(),null,2)],{type:'application/json'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='u2ber-content-backup.json'; a.click(); URL.revokeObjectURL(a.href);
  });
  document.getElementById('importFile').addEventListener('change',function(e){
    var file=e.target.files[0]; if(!file)return; var rd=new FileReader();
    rd.onload=function(){ try{ var data=JSON.parse(rd.result); Object.keys(data).forEach(function(k){var el=document.getElementById('a_'+k);if(el)el.value=data[k];}); markDirty(); statusEl.textContent='Imported — press Save to apply.'; }catch(err){alert('Not a valid backup file.');} };
    rd.readAsText(file);
  });
  document.getElementById('resetBtn').addEventListener('click',function(){
    if(!confirm('Reset all content to the original defaults?'))return;
    api('/api/content/reset',{method:'POST'}).then(function(){loadContent();});
  });

  // ---- analytics ----
  var pollTimer=null;
  function startPolling(){ if(pollTimer)clearInterval(pollTimer); pollTimer=setInterval(loadStats,5000); }
  function loadStats(){
    api('/api/stats').then(function(r){ if(!r.ok)return null; return r.json(); }).then(function(s){ if(s)renderStats(s); });
  }
  function renderStats(s){
    document.getElementById('kLive').textContent=s.live;
    document.getElementById('kToday').textContent=s.views24h;
    document.getElementById('kWeek').textContent=s.views7d;
    document.getElementById('kTotal').textContent=s.totalViews;
    // chart
    var max=Math.max(1,Math.max.apply(null,s.byDay.map(function(d){return d.views;})));
    document.getElementById('chart').innerHTML=s.byDay.map(function(d){
      var h=Math.round(d.views/max*120);
      var dn=new Date(d.day+'T00:00:00').toLocaleDateString(undefined,{weekday:'short'});
      return '<div class="bar-col"><div class="v">'+d.views+'</div><div class="bar" style="height:'+h+'px"></div><div class="d">'+dn+'</div></div>';
    }).join('');
    // clicks
    document.getElementById('clicks').innerHTML = s.topClicks.length ? s.topClicks.map(function(c){
      return '<div class="row"><span class="lab">'+c[0]+'</span><span class="val">'+c[1]+'</span></div>';
    }).join('') : '<p class="muted">No clicks recorded yet.</p>';
    // refs
    document.getElementById('refs').innerHTML = s.topRefs.length ? s.topRefs.map(function(c){
      return '<div class="row"><span class="lab">'+c[0]+'</span><span class="val">'+c[1]+'</span></div>';
    }).join('') : '<p class="muted">No referrers yet (direct visits don\'t show a source).</p>';
    // recent
    document.getElementById('recent').innerHTML = s.recent.length ? s.recent.map(function(e){
      var time=new Date(e.t).toLocaleTimeString();
      var what=e.type==='click'?('click · '+e.label):e.type;
      return '<div><span class="tag">'+time+'</span> '+what+'</div>';
    }).join('') : '<p class="muted">Nothing yet.</p>';
  }
