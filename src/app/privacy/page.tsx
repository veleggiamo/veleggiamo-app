import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy e Cookie Policy',
  description: 'Informativa sulla privacy e sui cookie di Veleggiamo.com ai sensi del GDPR.',
  robots: { index: false },
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy e Cookie Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Ultimo aggiornamento: 27 aprile 2026</p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Titolare del trattamento</h2>
        <p className="text-gray-600 leading-relaxed">
          Il titolare del trattamento dei dati personali è il gestore di Veleggiamo.com, contattabile
          all&apos;indirizzo email: <a href="mailto:info@veleggiamo.com" className="text-sky-600 hover:underline">info@veleggiamo.com</a>.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Dati raccolti</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          Veleggiamo.com raccoglie i seguenti dati:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, pagine visitate, orario di accesso. Sono raccolti automaticamente dai server e utilizzati esclusivamente per finalità tecniche e di sicurezza.</li>
          <li><strong>Cookie analitici (Google Analytics 4):</strong> solo con il tuo consenso esplicito. Servono a comprendere come gli utenti utilizzano il sito (pagine visitate, durata della sessione). I dati sono aggregati e anonimizzati.</li>
          <li><strong>Cookie tecnici:</strong> necessari al funzionamento del sito (es. preferenza consenso cookie). Non richiedono consenso.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Finalità e base giuridica</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li><strong>Funzionamento del sito</strong> (interesse legittimo, art. 6 par. 1 lett. f GDPR)</li>
          <li><strong>Analisi statistica</strong> (consenso dell&apos;utente, art. 6 par. 1 lett. a GDPR) — solo se accetti i cookie analitici</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Cookie</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Questo sito utilizza due categorie di cookie:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700">Cookie</th>
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700">Tipo</th>
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700">Finalità</th>
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700">Consenso</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr>
                <td className="border border-gray-200 px-4 py-2">cookie_consent</td>
                <td className="border border-gray-200 px-4 py-2">Tecnico</td>
                <td className="border border-gray-200 px-4 py-2">Memorizza la tua preferenza sui cookie</td>
                <td className="border border-gray-200 px-4 py-2">Non richiesto</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">_ga, _ga_*</td>
                <td className="border border-gray-200 px-4 py-2">Analitico</td>
                <td className="border border-gray-200 px-4 py-2">Google Analytics 4 — statistiche di navigazione</td>
                <td className="border border-gray-200 px-4 py-2">Richiesto</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-600 leading-relaxed mt-4">
          Puoi revocare il consenso ai cookie analitici in qualsiasi momento cancellando i cookie del browser o modificando le impostazioni del tuo browser.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Terze parti</h2>
        <p className="text-gray-600 leading-relaxed">
          Veleggiamo.com contiene link affiliati a <strong>Viator</strong> (TripAdvisor LLC). Quando clicchi su un link affiliato, potresti essere tracciato da Viator secondo la propria informativa privacy. Veleggiamo.com non trasmette dati personali a Viator. Per l&apos;informativa di Viator: <a href="https://www.viator.com/privacy" className="text-sky-600 hover:underline" target="_blank" rel="noopener noreferrer">viator.com/privacy</a>.
        </p>
        <p className="text-gray-600 leading-relaxed mt-3">
          Se hai acconsentito ai cookie analitici, i tuoi dati di navigazione sono trattati da <strong>Google LLC</strong> ai sensi della propria informativa: <a href="https://policies.google.com/privacy" className="text-sky-600 hover:underline" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Conservazione dei dati</h2>
        <p className="text-gray-600 leading-relaxed">
          I dati di navigazione tecnici sono conservati per il tempo strettamente necessario alle finalità indicate. I dati di Google Analytics sono conservati per 14 mesi (impostazione predefinita GA4).
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">7. I tuoi diritti (GDPR)</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          Hai diritto di:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1 leading-relaxed">
          <li>Accedere ai tuoi dati personali</li>
          <li>Rettificare dati inesatti</li>
          <li>Cancellare i tuoi dati (&quot;diritto all&apos;oblio&quot;)</li>
          <li>Limitare il trattamento</li>
          <li>Opporti al trattamento</li>
          <li>Portabilità dei dati</li>
          <li>Revocare il consenso in qualsiasi momento</li>
          <li>Proporre reclamo al Garante per la Protezione dei Dati Personali (<a href="https://www.garanteprivacy.it" className="text-sky-600 hover:underline" target="_blank" rel="noopener noreferrer">garanteprivacy.it</a>)</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mt-3">
          Per esercitare i tuoi diritti: <a href="mailto:info@veleggiamo.com" className="text-sky-600 hover:underline">info@veleggiamo.com</a>
        </p>
      </section>
    </div>
  )
}
