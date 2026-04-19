(function () {
  const ORIGIN = 'https://veleggiamo.vercel.app'

  const script = document.currentScript
  const supplierId = script?.getAttribute('data-supplier') || ''
  const containerId = script?.getAttribute('data-container') || 'veleggiamo-widget'

  const CSS = `
    #vlg-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; width: 100%; }
    #vlg-widget * { box-sizing: border-box; margin: 0; padding: 0; }
    .vlg-box { border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
    .vlg-header { background: #1d4ed8; padding: 16px 20px; }
    .vlg-header p { color: #bfdbfe; font-size: 12px; margin-top: 4px; }
    .vlg-header h3 { color: #fff; font-size: 15px; font-weight: 600; }
    .vlg-search { display: flex; gap: 8px; padding: 16px; border-bottom: 1px solid #f3f4f6; }
    .vlg-input { flex: 1; border: 1px solid #d1d5db; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; transition: border .2s; }
    .vlg-input:focus { border-color: #1d4ed8; }
    .vlg-btn { background: #1d4ed8; color: #fff; border: none; border-radius: 10px; padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .vlg-btn:hover { background: #1e40af; }
    .vlg-btn:disabled { opacity: .5; cursor: default; }
    .vlg-results { padding: 8px 0; max-height: 420px; overflow-y: auto; }
    .vlg-empty { padding: 24px; text-align: center; color: #9ca3af; font-size: 13px; }
    .vlg-card { display: flex; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #f3f4f6; transition: background .15s; }
    .vlg-card:last-child { border-bottom: none; }
    .vlg-card:hover { background: #f9fafb; }
    .vlg-img { width: 64px; height: 64px; object-fit: contain; border-radius: 8px; background: #f3f4f6; flex-shrink: 0; }
    .vlg-img-placeholder { width: 64px; height: 64px; border-radius: 8px; background: #f3f4f6; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .vlg-info { flex: 1; min-width: 0; }
    .vlg-name { font-size: 14px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .vlg-brand { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .vlg-reasoning { font-size: 12px; color: #374151; margin-top: 4px; line-height: 1.4; }
    .vlg-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
    .vlg-price { font-size: 14px; font-weight: 700; color: #111827; }
    .vlg-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
    .vlg-badge-green { background: #dcfce7; color: #15803d; }
    .vlg-badge-yellow { background: #fef9c3; color: #854d0e; }
    .vlg-badge-red { background: #fee2e2; color: #b91c1c; }
    .vlg-cta { display: inline-block; margin-top: 8px; background: #1d4ed8; color: #fff; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 8px; text-decoration: none; }
    .vlg-cta:hover { background: #1e40af; }
    .vlg-supplier { font-size: 11px; color: #059669; font-weight: 600; margin-top: 4px; }
    .vlg-footer { padding: 10px 16px; text-align: right; border-top: 1px solid #f3f4f6; }
    .vlg-footer a { font-size: 11px; color: #9ca3af; text-decoration: none; }
    .vlg-footer a:hover { color: #6b7280; }
  `

  function injectStyle() {
    if (document.getElementById('vlg-style')) return
    const style = document.createElement('style')
    style.id = 'vlg-style'
    style.textContent = CSS
    document.head.appendChild(style)
  }

  function scoreLabel(score) {
    if (score >= 80) return ['Ottimo', 'vlg-badge-green']
    if (score >= 60) return ['Adatto', 'vlg-badge-yellow']
    return ['Critico', 'vlg-badge-red']
  }

  function render(container, results) {
    const list = document.getElementById('vlg-results')
    if (!list) return

    if (!results.length) {
      list.innerHTML = '<div class="vlg-empty">Nessun prodotto trovato. Prova a descrivere la tua barca (es. "ancora 10m")</div>'
      return
    }

    list.innerHTML = results.map(p => {
      const [label, cls] = scoreLabel(p.score)
      const img = p.immagine
        ? `<img class="vlg-img" src="${p.immagine}" alt="${p.nome}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''
      const placeholder = `<div class="vlg-img-placeholder" style="${p.immagine ? 'display:none' : ''}">⚓</div>`
      const fornitore = p.fornitore
      const ctaUrl = fornitore
        ? `${ORIGIN}/fornitore/${fornitore.id}?product=${p.id}`
        : null

      return `
        <div class="vlg-card">
          ${img}${placeholder}
          <div class="vlg-info">
            <div class="vlg-name">${p.nome}</div>
            <div class="vlg-brand">${p.marca}</div>
            ${p.reasoning ? `<div class="vlg-reasoning">${p.reasoning}</div>` : ''}
            ${fornitore ? `<div class="vlg-supplier">✓ Disponibile qui · €${fornitore.prezzo}</div>` : ''}
            <div class="vlg-bottom">
              <span class="vlg-badge ${cls}">${label} ${p.score}/100</span>
              ${ctaUrl ? `<a class="vlg-cta" href="${ctaUrl}" target="_blank">Richiedi info →</a>` : ''}
            </div>
          </div>
        </div>
      `
    }).join('')
  }

  async function doSearch(q, btn) {
    btn.disabled = true
    btn.textContent = '...'
    const list = document.getElementById('vlg-results')
    if (list) list.innerHTML = '<div class="vlg-empty">Ricerca in corso...</div>'

    try {
      const url = `${ORIGIN}/api/widget/search?q=${encodeURIComponent(q)}&sid=${encodeURIComponent(supplierId)}`
      const res = await fetch(url)
      const data = await res.json()
      render(null, data.results || [])
    } catch {
      if (list) list.innerHTML = '<div class="vlg-empty">Errore di connessione. Riprova.</div>'
    }

    btn.disabled = false
    btn.textContent = 'Cerca'
  }

  function init() {
    injectStyle()

    const target = document.getElementById(containerId)
    if (!target) return

    target.innerHTML = `
      <div id="vlg-widget">
        <div class="vlg-box">
          <div class="vlg-header">
            <h3>⚓ Trova il prodotto giusto per la tua barca</h3>
            <p>Descrivi cosa cerchi — es. "ancora 10m", "autopilota vela"</p>
          </div>
          <div class="vlg-search">
            <input id="vlg-input" class="vlg-input" type="text" placeholder="es. ancora per barca 10m..." />
            <button id="vlg-btn" class="vlg-btn">Cerca</button>
          </div>
          <div id="vlg-results" class="vlg-results">
            <div class="vlg-empty">Scrivi cosa stai cercando sopra</div>
          </div>
          <div class="vlg-footer">
            <a href="${ORIGIN}" target="_blank">Powered by Veleggiamo</a>
          </div>
        </div>
      </div>
    `

    const btn = document.getElementById('vlg-btn')
    const input = document.getElementById('vlg-input')

    btn.addEventListener('click', () => {
      const q = input.value.trim()
      if (q) doSearch(q, btn)
    })

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = input.value.trim()
        if (q) doSearch(q, btn)
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
