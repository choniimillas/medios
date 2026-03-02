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

function LeafletMap({ propiedades, selectedPropiedades = [] }) {
  const valid = parseLatLong(propiedades)
  const selectedValid = valid.filter(p => selectedPropiedades.includes(p.id))

  const center = selectedValid.length > 0
    ? [selectedValid.reduce((s, p) => s + p.lat, 0) / selectedValid.length, selectedValid.reduce((s, p) => s + p.lng, 0) / selectedValid.length]
    : valid.length > 0
      ? [valid.reduce((s, p) => s + p.lat, 0) / valid.length, valid.reduce((s, p) => s + p.lng, 0) / valid.length]
      : [-32.9468, -60.6393]

  return (
    <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom style={{ minHeight: 400 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LeafletMapBounds valid={selectedValid.length > 0 ? selectedValid : valid} />
      {valid.map((p) => {
        const isSelected = selectedPropiedades.includes(p.id)
        return (
          <LeafletMarker
            key={p.id}
            position={[p.lat, p.lng]}
            opacity={selectedPropiedades.length > 0 && !isSelected ? 0.4 : 1}
          >
            <Popup>
              <div className="min-w-[150px] p-1 font-sans">
                <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1">
                  <strong className="text-sm text-slate-900">{p.ref_n}</strong>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.disponible === 'Disponible' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {p.disponible}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="font-medium text-slate-800">{p.ubicacion}</p>
                  <p>{p.localidad}</p>
                  <div className="mt-2 flex items-center gap-3 border-t border-slate-50 pt-1">
                    <div>
                      <span className="block text-[10px] text-slate-400">Dimensiones</span>
                      <span className="font-medium">{p.base}m x {p.altura}m</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Superficie</span>
                      <span className="font-medium">{p.m2}m²</span>
                    </div>
                  </div>
                  {p.precio_mensual != null && (
                    <div className="mt-2 text-right font-bold text-blue-600">
                      ${Number(p.precio_mensual).toLocaleString()}/mes
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </LeafletMarker>
        )
      })}
    </MapContainer>
  )
}

const mapContainerStyle = { width: '100%', height: '100%', minHeight: 400 }
const rosarioCenter = { lat: -32.9468, lng: -60.6393 }

function GoogleMapView({ propiedades, selectedPropiedades = [] }) {
  const [selectedId, setSelectedId] = useState(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: apiKey || '' })

  const valid = useMemo(() => parseLatLong(propiedades), [propiedades])
  const selectedValid = useMemo(() => valid.filter(p => selectedPropiedades.includes(p.id)), [valid, selectedPropiedades])

  const bounds = useMemo(() => {
    const targets = selectedValid.length > 0 ? selectedValid : valid
    if (targets.length === 0) return null
    const b = new google.maps.LatLngBounds()
    targets.forEach((p) => b.extend({ lat: p.lat, lng: p.lng }))
    return b
  }, [valid, selectedValid])

  const onMapLoad = useCallback(
    (map) => {
      if (bounds && (selectedValid.length > 0 || valid.length > 0)) {
        map.fitBounds(bounds, { top: 20, right: 20, bottom: 20, left: 20 })
      }
    },
    [bounds, valid.length, selectedValid.length]
  )

  if (loadError) return <MapFallback message="Error al cargar Google Maps" />
  if (!isLoaded) return <MapFallback message="Cargando mapa..." />

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={selectedValid.length > 0 ? { lat: selectedValid[0].lat, lng: selectedValid[0].lng } : rosarioCenter}
      zoom={13}
      onLoad={onMapLoad}
      options={{ streetViewControl: false, mapTypeControl: true, fullscreenControl: true }}
    >
      {valid.map((p) => {
        const isSelected = selectedPropiedades.includes(p.id)
        return (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            title={p.ref_n}
            onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
            opacity={selectedPropiedades.length > 0 && !isSelected ? 0.5 : 1}
            icon={isSelected ? {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            } : undefined}
          >
            {(selectedId === p.id || (isSelected && selectedValid.length === 1)) && (
              <InfoWindow onCloseClick={() => setSelectedId(null)}>
                <div className="min-w-[150px] p-1 font-sans">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1">
                    <strong className="text-sm text-slate-900">{p.ref_n}</strong>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.disponible === 'Disponible' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {p.disponible}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="font-medium text-slate-800">{p.ubicacion}</p>
                    <p>{p.localidad}</p>
                    <div className="mt-2 flex items-center gap-3 border-t border-slate-50 pt-1">
                      <div>
                        <span className="block text-[10px] text-slate-400">Dimensiones</span>
                        <span className="font-medium">{p.base}m x {p.altura}m</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Superficie</span>
                        <span className="font-medium">{p.m2}m²</span>
                      </div>
                    </div>
                    {p.precio_mensual != null && (
                      <div className="mt-2 text-right font-bold text-blue-600">
                        ${Number(p.precio_mensual).toLocaleString()}/mes
                      </div>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )
      })}
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

export function PropiedadesMap({ propiedades, selectedPropiedades = [] }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  return (
    <div className="h-full min-h-[400px] rounded-lg border border-slate-200 overflow-hidden">
      {apiKey ? (
        <GoogleMapView propiedades={propiedades} selectedPropiedades={selectedPropiedades} />
      ) : (
        <LeafletMap propiedades={propiedades} selectedPropiedades={selectedPropiedades} />
      )}
    </div>
  )
}
