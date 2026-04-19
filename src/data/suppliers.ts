export interface Fornitore {
  id: string
  nome: string
  distanzaKm: number
  prezzo: number
  indirizzo: string
  telefono: string
  email: string
  sito?: string
}

export const fornitori: Record<string, Omit<Fornitore, 'distanzaKm' | 'prezzo'>> = {
  'nautica-genova': {
    id: 'nautica-genova',
    nome: 'Nautica Genova',
    indirizzo: 'Via del Porto 12, Genova',
    telefono: '+39 010 123 4567',
    email: 'dropengoworld@gmail.com',
    sito: 'https://www.nauticagenova.it',
  },
  'ship-store-milano': {
    id: 'ship-store-milano',
    nome: 'Ship Store Milano',
    indirizzo: 'Via Navigli 45, Milano',
    telefono: '+39 02 987 6543',
    email: 'info@shipstore.it',
    sito: 'https://www.shipstore.it',
  },
  'nautica-rossi': {
    id: 'nautica-rossi',
    nome: 'Nautica Rossi',
    indirizzo: 'Lungomare Trieste 8, Livorno',
    telefono: '+39 0586 234 567',
    email: 'info@nauticarossi.it',
  },
  'mare-vela-torino': {
    id: 'mare-vela-torino',
    nome: 'Mare & Vela Torino',
    indirizzo: 'Corso Francia 120, Torino',
    telefono: '+39 011 456 7890',
    email: 'info@marevela.it',
    sito: 'https://www.marevela.it',
  },
  'elettronica-nautica-roma': {
    id: 'elettronica-nautica-roma',
    nome: 'Elettronica Nautica Roma',
    indirizzo: 'Via Ostia 33, Roma',
    telefono: '+39 06 789 0123',
    email: 'info@elettronautica.it',
    sito: 'https://www.elettronautica.it',
  },
}

export interface FornitorePerProdotto {
  fornitoreId: string
  distanzaKm: number
  prezzo: number
}

export const suppliersByProduct: Record<string, FornitorePerProdotto[]> = {
  'anc-001': [
    { fornitoreId: 'nautica-genova', distanzaKm: 2.3, prezzo: 318 },
    { fornitoreId: 'ship-store-milano', distanzaKm: 12, prezzo: 325 },
    { fornitoreId: 'nautica-rossi', distanzaKm: 18, prezzo: 315 },
  ],
  'anc-002': [
    { fornitoreId: 'nautica-genova', distanzaKm: 2.3, prezzo: 245 },
    { fornitoreId: 'mare-vela-torino', distanzaKm: 8, prezzo: 252 },
  ],
  'anc-003': [
    { fornitoreId: 'ship-store-milano', distanzaKm: 12, prezzo: 428 },
    { fornitoreId: 'nautica-rossi', distanzaKm: 18, prezzo: 435 },
  ],
  'anc-004': [
    { fornitoreId: 'nautica-genova', distanzaKm: 2.3, prezzo: 338 },
    { fornitoreId: 'mare-vela-torino', distanzaKm: 8, prezzo: 345 },
    { fornitoreId: 'ship-store-milano', distanzaKm: 12, prezzo: 340 },
  ],
  'aut-001': [
    { fornitoreId: 'elettronica-nautica-roma', distanzaKm: 4, prezzo: 445 },
    { fornitoreId: 'ship-store-milano', distanzaKm: 12, prezzo: 449 },
  ],
  'aut-002': [
    { fornitoreId: 'nautica-genova', distanzaKm: 2.3, prezzo: 940 },
    { fornitoreId: 'elettronica-nautica-roma', distanzaKm: 4, prezzo: 955 },
    { fornitoreId: 'ship-store-milano', distanzaKm: 12, prezzo: 950 },
  ],
  'ene-001': [
    { fornitoreId: 'elettronica-nautica-roma', distanzaKm: 4, prezzo: 215 },
    { fornitoreId: 'nautica-genova', distanzaKm: 2.3, prezzo: 220 },
    { fornitoreId: 'mare-vela-torino', distanzaKm: 8, prezzo: 218 },
  ],
  'ene-002': [
    { fornitoreId: 'ship-store-milano', distanzaKm: 12, prezzo: 615 },
    { fornitoreId: 'elettronica-nautica-roma', distanzaKm: 4, prezzo: 620 },
  ],
}
