(() => {
 const cfg=window.TURISMO_CONFIG||{whatsapp:"",agencyName:"Turismo a Frente"}, phone=(cfg.whatsapp||"").replace(/\D/g,"");
 const msg="Olá! Gostaria de informações sobre uma viagem.";
 const wa=(text)=>"https://wa.me/"+phone+"?text="+encodeURIComponent(text||msg);
 document.querySelectorAll("[data-wa]").forEach(a=>{a.href=phone?wa(msg):"#";if(!phone)a.addEventListener("click",e=>{e.preventDefault();alert("Configure o WhatsApp em js/config.js antes de usar este botão.");});});
 const toggle=document.querySelector(".menu-toggle"),nav=document.querySelector(".nav");
 toggle?.addEventListener("click",()=>nav.classList.toggle("open"));
 document.getElementById("year")?.append(new Date().getFullYear());
 const form=document.getElementById("flight-form"), results=document.getElementById("results");let search=null;
 form?.querySelectorAll('input[name="trip"]').forEach(r=>r.addEventListener("change",()=>{const one=form.elements.trip.value==="Só ida";form.elements.return.required=!one;form.elements.return.disabled=one;document.querySelector(".return").style.opacity=one?".45":"1";}));
 form?.elements.depart.addEventListener("change",()=>{form.elements.return.min=form.elements.depart.value;if(form.elements.return.value<form.elements.depart.value)form.elements.return.value="";});
 document.getElementById("swap")?.addEventListener("click",()=>{[form.elements.origin.value,form.elements.destination.value]=[form.elements.destination.value,form.elements.origin.value];});
 form?.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(form),one=d.get("trip")==="Só ida";search={origin:d.get("origin").trim(),destination:d.get("destination").trim(),trip:d.get("trip"),depart:d.get("depart"),back:one?"":d.get("return"),passengers:d.get("passengers"),cabin:d.get("cabin")};const date=x=>x?new Date(x+"T12:00:00").toLocaleDateString("pt-BR"):"";document.getElementById("summary").textContent=`${search.trip}: ${search.origin} → ${search.destination} • Ida: ${date(search.depart)}${search.back?" • Volta: "+date(search.back):""} • ${search.passengers} • ${search.cabin}.`;results.hidden=false;results.scrollIntoView({behavior:"smooth",block:"center"});});
 document.getElementById("quote")?.addEventListener("click",()=>{if(!search)return;const s=search,text=`Olá! Gostaria de uma cotação pela ${cfg.agencyName}.\nOrigem: ${s.origin}\nDestino: ${s.destination}\nTipo: ${s.trip}\nIda: ${s.depart}${s.back?"\nVolta: "+s.back:""}\nPassageiros: ${s.passengers}\nClasse: ${s.cabin}`;if(phone)window.open(wa(text),"_blank","noopener");else alert("Configure o WhatsApp em js/config.js. Esta versão não armazena dados nem consulta tarifas em tempo real.");});
 if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||navigator.connection?.saveData)document.querySelectorAll("video[autoplay]").forEach(v=>{v.pause();v.removeAttribute("autoplay");});
})();