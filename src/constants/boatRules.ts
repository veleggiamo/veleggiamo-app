export const boatRules = {
  ancora: {
    pesoPerMetro: 1, // kg per metro
    tolleranza: 0.2, // ±20%
  },
  autopilota: {
    tipi: [
      { maxLength: 9, tipo: 'timoneria' },
      { maxLength: 12, tipo: 'cockpit' },
      { maxLength: Infinity, tipo: 'idraulico' },
    ],
  },
  energia: {
    ahPerMetro: 10,
    fattoreSicurezza: 0.8,
  },
}
