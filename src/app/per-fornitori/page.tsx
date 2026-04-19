import Link from 'next/link'

export default function PerFornitoriPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* HERO */}
      <section className="bg-[#0f172a] text-white px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-4">Per i rivenditori nautici</div>
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Trasforma i visitatori del tuo sito in clienti
          </h1>
          <p className="text-lg text-slate-300 mb-10">
            Il tuo cliente arriva sul sito, non sa cosa comprare per la sua barca.
            Il widget Veleggiamo lo guida alla scelta giusta — e lo porta direttamente da te.
          </p>
          <a
            href="mailto:dropengoworld@gmail.com?subject=Voglio attivare Veleggiamo&body=Ciao, sono interessato ad attivare il widget Veleggiamo nel mio negozio."
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition"
          >
            Attiva gratis per 6 mesi →
          </a>
          <p className="text-slate-400 text-sm mt-4">Nessuna carta di credito. Attivazione in 5 minuti.</p>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">Come funziona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Incolla 2 righe di codice', desc: 'Un box di ricerca AI appare sul tuo sito. Nessun tecnico, nessuna configurazione.' },
              { n: '2', title: 'Il cliente cerca', desc: 'Scrive "ancora per barca 10m" — il motore capisce e consiglia il prodotto corretto tra i tuoi.' },
              { n: '3', title: 'Il lead arriva da te', desc: 'Il cliente clicca "Contatta" e la richiesta arriva direttamente a te, qualificata e pronta.' },
            ].map(s => (
              <div key={s.n} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">{s.n}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO WIDGET */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Provalo adesso</h2>
            <p className="text-slate-500 text-sm">Esattamente quello che vedono i tuoi clienti sul tuo sito</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <div className="text-xs text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
              <span className="ml-2">preview — sito del fornitore</span>
            </div>
            <div id="veleggiamo-widget-demo"></div>
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var s = document.createElement('script');
                  s.src = '/widget.js';
                  s.setAttribute('data-supplier', 'daceb4df-cce7-407a-94df-c6f97a036e67');
                  s.setAttribute('data-container', 'veleggiamo-widget-demo');
                  document.head.appendChild(s);
                })();
              `
            }}
          />
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-4">Prezzi semplici</h2>
          <p className="text-center text-slate-500 mb-12 text-sm">Parti gratis. Paga solo quando vedi i risultati.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* FREE */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="text-sm font-semibold text-slate-400 uppercase mb-2">Starter</div>
              <div className="text-4xl font-bold text-slate-900 mb-1">Gratis</div>
              <div className="text-sm text-slate-400 mb-6">per 6 mesi</div>
              <ul className="flex flex-col gap-3 text-sm text-slate-600 mb-8">
                {['Widget sul tuo sito', 'Fino a 3 prodotti nel motore', 'Pagina profilo su Veleggiamo', 'Supporto email'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span>{f}</li>
                ))}
              </ul>
              <a
                href="mailto:dropengoworld@gmail.com?subject=Voglio attivare Veleggiamo&body=Ciao, vorrei attivare il piano gratuito."
                className="block text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-6 py-3 rounded-xl transition"
              >
                Inizia gratis
              </a>
            </div>

            {/* PRO */}
            <div className="bg-blue-600 rounded-2xl p-8 border border-blue-500 shadow-lg text-white relative">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">Più scelto</div>
              <div className="text-sm font-semibold text-blue-200 uppercase mb-2">Pro</div>
              <div className="text-4xl font-bold mb-1">€299<span className="text-xl font-normal text-blue-200">/anno</span></div>
              <div className="text-sm text-blue-200 mb-6">≈ €25/mese</div>
              <ul className="flex flex-col gap-3 text-sm text-blue-100 mb-8">
                {[
                  'Tutto il piano Starter',
                  'Prodotti illimitati',
                  'Priorità nei risultati di ricerca',
                  'Lead tracking e analytics',
                  'Scarica codice widget personalizzato',
                  'Supporto prioritario',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-yellow-300 font-bold">✓</span>{f}</li>
                ))}
              </ul>
              <a
                href="mailto:dropengoworld@gmail.com?subject=Voglio attivare Veleggiamo Pro&body=Ciao, sono interessato al piano Pro."
                className="block text-center bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
              >
                Attiva Pro →
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Pronto a ricevere più clienti?</h2>
          <p className="text-slate-500 mb-8">Bastano 5 minuti. Ti mandiamo il codice widget e sei online.</p>
          <a
            href="mailto:dropengoworld@gmail.com?subject=Voglio attivare Veleggiamo"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition"
          >
            Scrivici ora →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 px-6 py-8 text-center text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600">← Torna alla ricerca</Link>
        <span className="mx-4">·</span>
        <span>© 2026 Veleggiamo</span>
      </footer>

    </main>
  )
}
