'use client'

import { useState } from 'react'

interface Props {
  fornitoreId: string
  fornitoreNome: string
  prodottoId: string | null
  prodottoNome: string | null
}

export default function FornitoreForm({ fornitoreId, fornitoreNome, prodottoId, prodottoNome }: Props) {
  const messaggioDefault = prodottoNome
    ? `Ciao, sono interessato al prodotto "${prodottoNome}". Vorrei sapere disponibilità e prezzo.`
    : 'Ciao, vorrei ricevere informazioni sui prodotti disponibili.'

  const [form, setForm] = useState({
    nome: '',
    telefono: '',
    email: '',
    messaggio: messaggioDefault,
  })
  const [inviato, setInviato] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrore(null)

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fornitoreId,
          prodottoId,
          ...form,
        }),
      })

      if (!res.ok) throw new Error('Errore invio')
      setInviato(true)
    } catch {
      setErrore('Errore durante l\'invio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  if (inviato) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-2xl mb-2">✔</div>
        <div className="font-semibold text-green-800">Richiesta inviata</div>
        <div className="text-sm text-green-600 mt-1">{fornitoreNome} ti contatterà al più presto.</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {prodottoNome && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-800">
          Richiesta per: <span className="font-semibold">{prodottoNome}</span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Nome *</label>
        <input
          type="text"
          required
          value={form.nome}
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Il tuo nome"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Telefono *</label>
        <input
          type="tel"
          required
          value={form.telefono}
          onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="+39 333 123 4567"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="opzionale"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Messaggio</label>
        <textarea
          rows={4}
          value={form.messaggio}
          onChange={e => setForm(f => ({ ...f, messaggio: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </div>

      {errore && (
        <div className="text-sm text-red-600">{errore}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm py-3 rounded-xl transition"
      >
        {loading ? 'Invio in corso...' : 'Invia richiesta'}
      </button>

    </form>
  )
}
