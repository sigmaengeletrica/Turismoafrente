(() => {
  const cfg = window.TURISMO_CONFIG || {
    whatsapp: "5554991503391",
    agencyName: "Turismo a Frente",
    flightsApi: "https://turismo-api-voos.onrender.com"
  };
  const phone = (cfg.whatsapp || "").replace(/\D/g, "");
  const wa = (text) => "https://wa.me/" + phone + "?text=" + encodeURIComponent(text || "Olá! Gostaria de informações sobre uma viagem.");
  const form = document.getElementById("flight-form");
  const results = document.getElementById("results");
  let search = null;

  document.querySelectorAll("[data-wa]").forEach(a => {
    a.href = phone ? wa("Olá! Gostaria de informações sobre uma viagem.") : "#";
    if (!phone) a.addEventListener("click", e => {
      e.preventDefault();
      alert("Configure o WhatsApp em js/config.js.");
    });
  });

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  toggle?.addEventListener("click", () => nav?.classList.toggle("open"));
  const year = document.getElementById("year");
  if (year && !year.textContent.trim()) year.textContent = new Date().getFullYear();

  const tripRadios = form?.querySelectorAll('input[name="trip"]') || [];
  function updateTripFields() {
    if (!form) return;
    const oneWay = form.elements.trip.value === "Só ida";
    form.elements.return.required = !oneWay;
    form.elements.return.disabled = oneWay;
    const returnField = document.querySelector(".return");
    if (returnField) returnField.style.opacity = oneWay ? ".45" : "1";
  }
  tripRadios.forEach(r => r.addEventListener("change", updateTripFields));
  updateTripFields();

  form?.elements.depart?.addEventListener("change", () => {
    form.elements.return.min = form.elements.depart.value;
    if (form.elements.return.value && form.elements.return.value < form.elements.depart.value) {
      form.elements.return.value = "";
    }
  });

  document.getElementById("swap")?.addEventListener("click", () => {
    [form.elements.origin.value, form.elements.destination.value] =
      [form.elements.destination.value, form.elements.origin.value];
  });

  // Accepta códigos IATA ou texto no formato "Cidade (ABC)".
  // Para evitar pesquisas ambíguas, nomes sem código IATA são recusados.
  function parseIata(value) {
    const text = String(value || "").trim().toUpperCase();
    const inParens = text.match(/\(([A-Z]{3})\)\s*$/);
    if (inParens) return inParens[1];
    if (/^[A-Z]{3}$/.test(text)) return text;
    return null;
  }

  function passengerCount(value) {
    const match = String(value || "").match(/\d+/);
    return match ? Math.min(9, Math.max(1, Number(match[0]))) : 1;
  }

  function cabinCode(value) {
    const v = String(value || "").toLowerCase();
    if (v.includes("premium")) return "premium_economy";
    if (v.includes("executiva")) return "business";
    if (v.includes("primeira")) return "first";
    return "economy";
  }

  function formatDate(value) {
    return value ? new Date(value + "T12:00:00").toLocaleDateString("pt-BR") : "";
  }

  function ensureOfferContainer() {
    let container = document.getElementById("flight-offers");
    if (!container && results) {
      container = document.createElement("div");
      container.id = "flight-offers";
      container.className = "flight-offers";
      const quote = document.getElementById("quote");
      if (quote) results.insertBefore(container, quote);
      else results.appendChild(container);
    }
    return container;
  }

  function showMessage(message, isError = false) {
    const container = ensureOfferContainer();
    if (!container) return;
    container.replaceChildren();
    const p = document.createElement("p");
    p.className = isError ? "flight-error" : "fine";
    p.textContent = message;
    container.appendChild(p);
  }

  function renderOffers(data) {
    const container = ensureOfferContainer();
    if (!container) return;
    container.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = data.offers?.length ? "Voos encontrados" : "Nenhuma oferta retornada";
    container.appendChild(heading);

    if (!Array.isArray(data.offers) || data.offers.length === 0) {
      const p = document.createElement("p");
      p.className = "fine";
      p.textContent = "A consulta foi recebida, mas a API não retornou ofertas nesta resposta. A disponibilidade pode variar; você também pode pedir uma cotação pelo WhatsApp.";
      container.appendChild(p);
      return;
    }

    data.offers.forEach((offer, index) => {
      const card = document.createElement("article");
      card.className = "flight-offer";
      card.style.cssText = "border:1px solid #d6e0ea;border-radius:12px;padding:14px;margin:12px 0;background:#fff;color:#17263b";
      const title = document.createElement("h4");
      title.textContent = (offer.owner?.name || "Companhia aérea") + " — " +
        (offer.total_currency && offer.total_amount
          ? new Intl.NumberFormat("pt-BR", {style:"currency",currency:offer.total_currency}).format(Number(offer.total_amount))
          : "preço não informado");
      card.appendChild(title);

      (offer.slices || []).forEach((slice, sliceIndex) => {
        const p = document.createElement("p");
        const segments = slice.segments || [];
        const route = `${slice.origin || segments[0]?.origin || "?"} → ${slice.destination || segments[segments.length - 1]?.destination || "?"}`;
        const legs = segments.map(seg => {
          const airline = seg.marketing_carrier || "Companhia não informada";
          const flight = seg.marketing_carrier_flight_number ? " " + seg.marketing_carrier_flight_number : "";
          return `${airline}${flight}: ${formatDateTime(seg.departing_at)}–${formatDateTime(seg.arriving_at)}`;
        }).join("; ");
        p.textContent = `${sliceIndex === 0 ? "Trecho" : "Volta"}: ${route}${legs ? " • " + legs : ""}`;
        card.appendChild(p);
      });

      const choose = document.createElement("button");
      choose.type = "button";
      choose.className = "btn green";
      choose.textContent = "Solicitar este voo pelo WhatsApp";
      choose.addEventListener("click", () => {
        const text = `Olá! Gostaria de uma cotação pela ${cfg.agencyName || "Turismo a Frente"}.\n` +
          `Origem: ${search.origin}\nDestino: ${search.destination}\n` +
          `Tipo: ${search.trip}\n` +
          `Ida: ${formatDate(search.depart)}${search.back ? "\nVolta: " + formatDate(search.back) : ""}\n` +
          `Passageiros: ${search.passengers}\nClasse: ${search.cabin}`;
        if (phone) window.open(wa(text), "_blank", "noopener,noreferrer");
        else alert(text);
      });
      card.appendChild(choose);
      container.appendChild(card);
    });
  }

  function formatDateTime(value) {
    if (!value) return "horário não informado";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("pt-BR", {day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
  }

  form?.addEventListener("submit", async e => {
    e.preventDefault();
    const d = new FormData(form);
    const oneWay = d.get("trip") === "Só ida";
    const originText = String(d.get("origin") || "").trim();
    const destinationText = String(d.get("destination") || "").trim();
    const origin = parseIata(originText);
    const destination = parseIata(destinationText);

    search = {
      origin: originText,
      destination: destinationText,
      trip: oneWay ? "Só ida" : "Ida e volta",
      depart: String(d.get("depart") || ""),
      back: oneWay ? "" : String(d.get("return") || ""),
      passengers: String(d.get("passengers") || "1 passageiro"),
      cabin: String(d.get("cabin") || "Econômica")
    };

    const summary = document.getElementById("summary");
    if (summary) {
      summary.textContent = `${search.trip}: ${originText} → ${destinationText} • Ida: ${formatDate(search.depart)}` +
        `${search.back ? " • Volta: " + formatDate(search.back) : ""} • ${search.passengers} • ${search.cabin}.`;
    }
    if (results) {
      results.hidden = false;
      results.scrollIntoView({behavior:"smooth", block:"start"});
    }

    if (!origin || !destination) {
      showMessage("Para pesquisar tarifas, informe os códigos IATA de 3 letras (por exemplo, POA e REC) ou escreva a cidade seguida do código entre parênteses, como “Porto Alegre (POA)”.", true);
      return;
    }
    if (!search.depart) {
      showMessage("Informe a data de ida.", true);
      return;
    }
    if (!oneWay && (!search.back || search.back < search.depart)) {
      showMessage("Informe uma data de volta igual ou posterior à data de ida, ou selecione “Só ida”.", true);
      return;
    }

    const container = ensureOfferContainer();
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Pesquisando...";
    }
    showMessage("Consultando ofertas de voos. Na primeira chamada, a Render pode levar alguns segundos para despertar.");

    const payload = {
      origin,
      destination,
      depart: search.depart,
      passengers: passengerCount(search.passengers),
      cabin: cabinCode(search.cabin)
    };
    if (search.back) payload.return = search.back;

    try {
      const response = await fetch(String(cfg.flightsApi || "https://turismo-api-voos.onrender.com").replace(/\/+$/, "") + "/api/flight-search", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        showMessage(data.error || `A consulta falhou (HTTP ${response.status}). Confira a configuração da API e tente novamente.`, true);
      } else {
        renderOffers(data);
      }
    } catch (error) {
      showMessage("Não foi possível conectar à API. Verifique se o serviço da Render está ativo e se ALLOWED_ORIGIN está configurado para https://sigmaengeletrica.github.io. Detalhe: " + error.message, true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Pesquisar voos →";
      }
    }
  });

  document.getElementById("quote")?.addEventListener("click", () => {
    if (!search) {
      alert("Preencha e envie primeiro os dados da viagem.");
      return;
    }
    const s = search;
    const text = `Olá! Gostaria de uma cotação pela ${cfg.agencyName || "Turismo a Frente"}.\nOrigem: ${s.origin}\nDestino: ${s.destination}\nTipo: ${s.trip}\nIda: ${s.depart}${s.back ? "\nVolta: " + s.back : ""}\nPassageiros: ${s.passengers}\nClasse: ${s.cabin}`;
    if (phone) window.open(wa(text), "_blank", "noopener,noreferrer");
    else alert("Configure o WhatsApp em js/config.js.");
  });



  // Ofertas do carrossel vêm de ofertas.json, sem misturar dados ao script principal.
  const offerSection = document.getElementById("ofertas-especiais");
  const offerTrack = document.getElementById("offer-track");
  const offerModal = document.getElementById("offer-modal");
  const moneyOffer = value => {
    const n = Number(String(value ?? "").replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n.toLocaleString("pt-BR", {style:"currency", currency:"BRL"}) : String(value ?? "");
  };
  const offerImage = offer => {
    const slot = Math.max(1, Math.min(3, Number(offer.imageSlot || offer.slot || 1)));
    return `imagens/capas/Oferta${slot}.jpg`;
  };
  const safeText = (parent, selector, value) => {
    const el = parent.querySelector(selector);
    if (el) el.textContent = value || "";
  };
  function openOffer(offer) {
    if (!offerModal) return;
    const image = offerImage(offer);
    const hero = document.getElementById("offer-modal-hero");
    if (hero) {
      hero.style.backgroundImage = `linear-gradient(90deg,rgba(4,28,52,.82),rgba(4,28,52,.18)),url("${image}")`;
      hero.style.backgroundSize = "cover";
      hero.style.backgroundPosition = "center";
    }
    safeText(offerModal, "#offer-modal-destination", offer.destination);
    safeText(offerModal, "#offer-modal-title", offer.title);
    safeText(offerModal, "#offer-modal-period", `${offer.period || ""}${offer.nights ? " · " + offer.nights + " noites" : ""}${offer.price ? " · a partir de " + moneyOffer(offer.price) : ""}`);
    safeText(offerModal, "#offer-modal-description", offer.description || "");
    safeText(offerModal, "#offer-modal-disclaimer", offer.disclaimer || "Valores sujeitos a alteração e disponibilidade.");
    const list = document.getElementById("offer-modal-inclusions");
    if (list) {
      list.replaceChildren();
      String(offer.inclusions || "").split(/\r?\n/).map(x => x.trim()).filter(Boolean).forEach(item => {
        const li = document.createElement("li"); li.textContent = "✓ " + item; list.append(li);
      });
      if (!list.children.length) {
        const li = document.createElement("li"); li.textContent = "Consulte os detalhes pelo WhatsApp."; list.append(li);
      }
    }
    const waLink = document.getElementById("offer-modal-whatsapp");
    if (waLink) {
      const message = `Olá! Tenho interesse na oferta "${offer.title}" para ${offer.destination}, período ${offer.period}. Preço anunciado: ${moneyOffer(offer.price)}. Gostaria de confirmar disponibilidade e condições.`;
      waLink.href = wa(message);
    }
    offerModal.hidden = false;
    document.body.classList.add("offer-modal-open");
    offerModal.querySelector("[data-offer-close]")?.focus();
  }
  function renderOfferCards(allOffers) {
    if (!offerSection || !offerTrack) return;
    const published = allOffers.filter(o => o && (o.status === "published" || o.status === "publicada")).slice(0, 3);
    offerTrack.replaceChildren();
    if (!published.length) {
      offerSection.hidden = true;
      return;
    }
    offerSection.hidden = false;
    published.forEach(offer => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "offer-tile";
      const imageWrap = document.createElement("span"); imageWrap.className = "offer-tile-image";
      const img = document.createElement("img"); img.src = offerImage(offer); img.alt = offer.title || "Oferta de viagem"; img.loading = "lazy";
      img.onerror = () => { imageWrap.classList.add("inspiration-image"); img.remove(); };
      imageWrap.append(img);
      const badge = document.createElement("span"); badge.className = "offer-badge"; badge.textContent = "🚨 IMPERDÍVEL"; imageWrap.append(badge);
      const copy = document.createElement("span"); copy.className = "offer-tile-copy";
      const destination = document.createElement("small"); destination.textContent = offer.destination || "";
      const title = document.createElement("strong"); title.textContent = offer.title || "Oferta de viagem";
      const period = document.createElement("span"); period.textContent = `${offer.period || ""}${offer.nights ? " · " + offer.nights + " noites" : ""}`;
      const price = document.createElement("b"); price.textContent = offer.price ? `A partir de ${moneyOffer(offer.price)} por pessoa` : "Consulte o preço";
      const cta = document.createElement("span"); cta.className = "offer-tile-cta"; cta.textContent = "Ver promoção →";
      copy.append(destination, title, period, price, cta); button.append(imageWrap, copy);
      button.addEventListener("click", () => openOffer(offer)); offerTrack.append(button);
    });
    // O cartão "Em breve" ocupa a última posição disponível, mas não aparece sem ofertas.
    if (published.length < 3) {
      const soon = document.createElement("button"); soon.type = "button"; soon.className = "offer-tile offer-coming-soon"; soon.disabled = true;
      const imageWrap = document.createElement("span"); imageWrap.className = "offer-tile-image inspiration-image";
      const badge = document.createElement("span"); badge.className = "offer-badge"; badge.textContent = "EM BREVE"; imageWrap.append(badge);
      const copy = document.createElement("span"); copy.className = "offer-tile-copy";
      const small = document.createElement("small"); small.textContent = "NOVAS EXPERIÊNCIAS";
      const title = document.createElement("strong"); title.textContent = "Novos destinos em breve";
      const desc = document.createElement("span"); desc.textContent = "Estamos preparando outras ofertas para você.";
      const cta = document.createElement("span"); cta.className = "offer-tile-cta"; cta.textContent = "Acompanhe as novidades →";
      copy.append(small, title, desc, cta); soon.append(imageWrap, copy); offerTrack.append(soon);
    }
  }
  document.querySelector(".carousel-prev")?.addEventListener("click", () => {
    offerTrack?.scrollBy({left: -Math.max(260, offerTrack.clientWidth * 0.8), behavior: "smooth"});
  });
  document.querySelector(".carousel-next")?.addEventListener("click", () => {
    offerTrack?.scrollBy({left: Math.max(260, offerTrack.clientWidth * 0.8), behavior: "smooth"});
  });
  offerModal?.querySelectorAll("[data-offer-close]").forEach(button => button.addEventListener("click", () => {
    offerModal.hidden = true; document.body.classList.remove("offer-modal-open");
  }));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && offerModal && !offerModal.hidden) {
      offerModal.hidden = true; document.body.classList.remove("offer-modal-open");
    }
  });
  fetch("ofertas.json", {cache:"no-store"})
    .then(response => { if (!response.ok) throw new Error("Arquivo ofertas.json não encontrado"); return response.json(); })
    .then(data => renderOfferCards(Array.isArray(data) ? data : (Array.isArray(data.ofertas) ? data.ofertas : [])))
    .catch(() => { if (offerSection) offerSection.hidden = true; });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || navigator.connection?.saveData) {
    document.querySelectorAll("video[autoplay]").forEach(v => { v.pause(); v.removeAttribute("autoplay"); });
  }
})();
