import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { fornitori } from '@/data/suppliers'
import { products } from '@/data/products'

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { fornitoreId, prodottoId, nome, telefono, email, messaggio } = await req.json()

  const fornitore = fornitori[fornitoreId]
  const prodotto = products.find(p => p.id === prodottoId)

  if (!fornitore) {
    return NextResponse.json({ error: 'Fornitore non trovato' }, { status: 400 })
  }

  try {
    const emails = [
      resend.emails.send({
        from: 'Veleggiamo <noreply@veleggiamo.com>',
        to: fornitore.email,
        subject: `Nuovo cliente interessato: ${prodotto?.nome ?? 'prodotto'}`,
        html: `
          <h2>Nuova richiesta da Veleggiamo</h2>
          <p><strong>Prodotto:</strong> ${prodotto?.nome ?? prodottoId}</p>
          <hr />
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Telefono:</strong> ${telefono}</p>
          ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
          <p><strong>Messaggio:</strong><br/>${messaggio}</p>
          <hr />
          <p style="color:#999;font-size:12px">Lead generato da Veleggiamo.it</p>
        `,
      }),
    ]

    if (email) {
      emails.push(
        resend.emails.send({
          from: 'Veleggiamo <noreply@veleggiamo.com>',
          to: email,
          subject: `Richiesta inviata a ${fornitore.nome}`,
          html: `
            <h2>Abbiamo inoltrato la tua richiesta</h2>
            <p>Ciao ${nome},</p>
            <p><strong>${fornitore.nome}</strong> ti contatterà al più presto al numero <strong>${telefono}</strong>.</p>
            ${prodotto ? `<p><strong>Prodotto richiesto:</strong> ${prodotto.nome}</p>` : ''}
            <hr />
            <p><strong>Il tuo messaggio:</strong><br/>${messaggio}</p>
            <hr />
            <p style="color:#999;font-size:12px">Veleggiamo.it — Il motore di ricerca per la nautica</p>
          `,
        })
      )
    }

    await Promise.all(emails)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Errore invio email' }, { status: 500 })
  }
}
