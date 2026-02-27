import { useMemo, useCallback, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/** Parse latlong string "lat,lng" into { lat, lng } */
function parseLatLong(propiedades) {
  return propiedades
    .map((p) => {
      const ll = p.latlong
      if (!ll || typeof ll !== 'string') return null
      const [lat, lng] = ll.split(',').map(Number)
      if (isNaN(lat) || isNaN(lng)) return null
      return { ...p, lat, lng }
    })
    .filter(Boolean)
}

// Leaflet default marker fix
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function LeafletMapBounds({ valid }) {
  const map = useMap()
  if (valid.length === 0) return null
  const bounds = L.latLngBounds(valid.map((p) => [p.lat, p.lng]))
  map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 })
  return null
}

function LeafletMap({ propiedades }) {
  const valid = parseLatLong(propiedades)
  const center = valid.length > 0
    ? [valid.reduce((s, p) => s + p.lat, 0) / valid.length, valid.reduce((s, p) => s + p.lng, 0) / valid.length]
    : [-32.9468, -60.6393]

  return (
    <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom style={{ minHeight: 400 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LeafletMapBounds valid={valid} />
      {valid.map((p) => (
        <LeafletMarker key={p.id} position={[p.lat, p.lng]}>
          <Popup>
            <strong>{p.ref_n}</strong>
            <br />
            {p.ubicacion}, {p.localidad}
            <br />
            {p.precio_mensual != null && `$${p.precio_mensual}/mes`}
          </Popup>
        </LeafletMarker>
      ))}
    </MapContainer>
  )
}

const mapContainerStyle = { width: '100%', height: '100%', minHeight: 400 }
const rosarioCenter = { lat: -32.9468, lng: -60.6393 }

function GoogleMapView({ propiedades }) {
  const [selectedId, setSelectedId] = useState(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: apiKey || '' })

  const valid = useMemo(() => parseLatLong(propiedades), [propiedades])
  const bounds = useMemo(() => {
    if (valid.length === 0) return null
    const b = new google.maps.LatLngBounds()
    valid.forEach((p) => b.extend({ lat: p.lat, lng: p.lng }))
    return b
  }, [valid])

  const onMapLoad = useCallback(
    (map) => {
      if (bounds && valid.length > 0) map.fitBounds(bounds, { top: 20, right: 20, bottom: 20, left: 20 })
    },
    [bounds, valid.length]
  )

  if (loadError) return <MapFallback message="Error al cargar Google Maps" />
  if (!isLoaded) return <MapFallback message="Cargando mapa..." />

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={valid.length > 0 ? { lat: valid[0].lat, lng: valid[0].lng } : rosarioCenter}
      zoom={13}
      onLoad={onMapLoad}
      options={{ streetViewControl: false, mapTypeControl: true, fullscreenControl: true }}
    >
      {valid.map((p) => (
        <Marker
          key={p.id}
          position={{ lat: p.lat, lng: p.lng }}
          title={p.ref_n}
          onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
        >
          {selectedId === p.id && (
            <InfoWindow onCloseClick={() => setSelectedId(null)}>
              <div className="text-sm p-1">
                <strong>{p.ref_n}</strong>
                <br />
                {p.ubicacion}, {p.localidad}
                <br />
                {p.precio_mensual != null && <span className="text-slate-600">${p.precio_mensual}/mes</span>}
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  )
}

function MapFallback({ message }) {
  return (
    <div className="flex h-[400px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
      <p className="text-sm">{message}</p>
    </div>
  )
}

export function PropiedadesMap({ propiedades }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  return (
    <div className="h-full min-h-[400px] rounded-lg border border-slate-200 overflow-hidden">
      {apiKey ? (
        <GoogleMapView propiedades={propiedades} />
      ) : (
        <LeafletMap propiedades={propiedades} />
      )}
    </div>
  )
}
