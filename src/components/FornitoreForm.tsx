'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

  const [form, setForm] = useState({ nome: '', telefono: '', email: '', messaggio: messaggioDefault })
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
        body: JSON.stringify({ fornitoreId, prodottoId, ...form }),
      })
      if (!res.ok) throw new Error()
      setInviato(true)
    } catch {
      setErrore("Errore durante l'invio. Riprova.")
    } finally {
      setLoading(false)
    }
  }

  if (inviato) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-3">✔</div>
        <div className="font-semibold text-green-800">Richiesta inviata</div>
        <div className="text-sm text-green-600 mt-1">{fornitoreNome} ti contatterà al più presto.</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {prodottoNome && (
        <Badge variant="default" className="self-start bg-blue-50 text-blue-800 border border-blue-100">
          Richiesta per: {prodottoNome}
        </Badge>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">Nome *</label>
        <Input
          required
          value={form.nome}
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          placeholder="Il tuo nome"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">Telefono *</label>
        <Input
          type="tel"
          required
          value={form.telefono}
          onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
          placeholder="+39 333 123 4567"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">Email</label>
        <Input
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="opzionale"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">Messaggio</label>
        <textarea
          rows={4}
          value={form.messaggio}
          onChange={e => setForm(f => ({ ...f, messaggio: e.target.value }))}
          className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {errore && <p className="text-sm text-red-600">{errore}</p>}

      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? 'Invio in corso...' : 'Invia richiesta'}
      </Button>

    </form>
  )
}
