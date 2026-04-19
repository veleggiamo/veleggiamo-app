'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Negozio } from '@/types/searchResult'

export default function MapView({ stores }: { stores: Negozio[] }) {
  return (
    <MapContainer
      center={[43.0, 12.5]}
      zoom={5}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {stores.map((store) => (
        <Marker key={store.id} position={[store.lat, store.lng]}>
          <Popup>{store.nome}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
