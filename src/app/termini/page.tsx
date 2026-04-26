import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termini di utilizzo e Informativa sui link affiliati',
  description: 'Termini di utilizzo di Veleggiamo.com e informativa sulla partecipazione a programmi di affiliazione.',
  robots: { index: false },
}

export default function TerminiPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Termini di utilizzo</h1>
      <p className="text-sm text-gray-500 mb-10">Ultimo aggiornamento: 27 aprile 2026</p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Informativa sui link affiliati</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-4">
          <p className="text-gray-700 leading-relaxed font-medium">
            Veleggiamo.com partecipa al programma di affiliazione di <strong>Viator</strong> (TripAdvisor LLC).
            Alcuni link presenti su questo sito sono link affiliati: se acquisti un&apos;esperienza tramite questi link,
            Veleggiamo.com riceve una commissione da Viator, <strong>senza alcun costo aggiuntivo per te</strong>.
          </p>
        </div>
        <p className="text-gray-600 leading-relaxed">
          I prezzi indicati sul sito sono forniti a titolo indicativo e possono variare. Il prezzo definitivo
          è sempre quello visualizzato su Viator al momento dell&apos;acquisto. La commissione che riceviamo non
          influenza i contenuti editoriali, le recensioni o i consigli presenti su questo sito.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Natura del sito</h2>
        <p className="text-gray-600 leading-relaxed">
          Veleggiamo.com è un sito editoriale indipendente che fornisce informazioni sulle gite in barca
          in Italia. Non siamo un operatore turistico, non vendiamo direttamente esperienze e non siamo
          responsabili delle esperienze acquistate tramite i partner affiliati. Il contratto di acquisto
          è stipulato direttamente tra l&apos;utente e il fornitore del servizio (es. Viator).
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Accuratezza delle informazioni</h2>
        <p className="text-gray-600 leading-relaxed">
          Le informazioni presenti su questo sito (prezzi, orari, disponibilità) sono aggiornate periodicamente
          ma potrebbero non riflettere la situazione in tempo reale. Prima di effettuare un acquisto, verifica
          sempre i dettagli aggiornati sul sito del fornitore. Veleggiamo.com non è responsabile per eventuali
          discrepanze tra le informazioni riportate e quelle del fornitore.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Proprietà intellettuale</h2>
        <p className="text-gray-600 leading-relaxed">
          I contenuti testuali di Veleggiamo.com sono di proprietà del gestore del sito. Le immagini
          provengono dai partner affiliati e sono utilizzate nei limiti dei rispettivi programmi di affiliazione.
          È vietata la riproduzione dei contenuti senza autorizzazione scritta.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Limitazione di responsabilità</h2>
        <p className="text-gray-600 leading-relaxed">
          Veleggiamo.com non è responsabile per danni diretti o indiretti derivanti dall&apos;utilizzo del sito
          o dall&apos;acquisto di esperienze tramite i link affiliati. In caso di problemi con un&apos;esperienza acquistata,
          contatta direttamente il fornitore (Viator o l&apos;operatore turistico).
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Legge applicabile</h2>
        <p className="text-gray-600 leading-relaxed">
          I presenti termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente
          il Foro del luogo di residenza del consumatore, ai sensi del Codice del Consumo (D.Lgs. 206/2005).
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Contatti</h2>
        <p className="text-gray-600 leading-relaxed">
          Per qualsiasi domanda: <a href="mailto:info@veleggiamo.com" className="text-sky-600 hover:underline">info@veleggiamo.com</a>
        </p>
      </section>
    </div>
  )
}
