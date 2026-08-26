import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin, Home, Building2, Wrench, Paintbrush, Sparkles, Layers,
  Loader2, CheckCircle2, ArrowLeft, Send, LocateFixed, Search, ExternalLink,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getServiceTypesConfig, submitServiceRequest } from '../services/serviceRequestService'

// Default map center — Bangalore (company HQ)
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 }

const INDIA_BOUNDS = [
  [6.5, 68.0],   // SW corner
  [37.5, 97.5],  // NE corner
]

function isInIndia(lat, lng) {
  return lat >= 6.5 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5
}

const SERVICE_ICONS = {
  wall: Layers,
  home: Home,
  building: Building2,
  wrench: Wrench,
  paintbrush: Paintbrush,
  sparkles: Sparkles,
}

// Nominatim usage policy: max ~1 req/sec, identify your app via a Referer/User-Agent.
// Browsers auto-send Referer, so this is fine for client-side use at low volume.
// For production at scale, proxy these calls through your own backend instead.
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse'
const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search'
const GEOCODE_DEBOUNCE_MS = 700

function formatINR(num) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(num || 0))
}

// India-friendly, but generally permissive phone check: 10-15 digits, optional leading +
function isValidPhone(value) {
  const digitsOnly = value.replace(/[\s()-]/g, '')
  return /^\+?\d{10,15}$/.test(digitsOnly)
}

// Pulls state / city / pincode out of a Nominatim address object.
// Coordinate-driven, so it works correctly no matter what country/locale
// the browser or client settings are set to (e.g. a US-locale browser
// picking a location in India still resolves the correct Indian address).
function parseNominatimAddress(addr) {
  if (!addr) return { state: '', city: '', pincode: '' }
  const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || ''
  return {
    state: addr.state || addr.state_district || '',
    city,
    pincode: addr.postcode || '',
  }
}

function googleMapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

// ── Leaflet marker icon (default icon path breaks under bundlers, so we set it manually) ──
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// ── Handles map click-to-place + exposes the marker itself ──

function LocationMarker({ position, onMove, onOutOfBounds }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      if (!isInIndia(lat, lng)) {
        onOutOfBounds?.()
        return
      }
      onMove(lat, lng)
    },
  })

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={markerIcon}
      draggable
      alt="Selected property location"
      eventHandlers={{
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng()
          if (!isInIndia(lat, lng)) {
            onOutOfBounds?.()
            e.target.setLatLng([position.lat, position.lng]) // snap back
            return
          }
          onMove(lat, lng)
        },
      }}
    />
  )
}

// ── Recenter the map imperatively when position changes from outside the map
//    (e.g. "Use My Location" or the search box) ──
function RecenterMap({ position }) {
  const map = useMap()
  useEffect(() => {
    map.setView([position.lat, position.lng], Math.max(map.getZoom(), 15))
  }, [position.lat, position.lng]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function PropertyServicePage() {
  // ── Config from backend ──────────────────────────────────────────────────
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Form state ────────────────────────────────────────────────────────────
  const [position, setPosition] = useState(DEFAULT_CENTER)
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [pincode, setPincode] = useState('')
  const [serviceTypeId, setServiceTypeId] = useState(null)
  const [areaSqft, setAreaSqft] = useState('')
  const [requirement, setRequirement] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // ── Location search state ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [locationError, setLocationError] = useState(null)

  // ── Submit state ──────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [result, setResult] = useState(null) // { message, reference, estimated_price }

  // ── Refs for cleanup / debounce ──────────────────────────────────────────
  const mountedRef = useRef(true)
  const geocodeTimerRef = useRef(null)
  const searchTimerRef = useRef(null)
  const geocodeAbortRef = useRef(null)
  const searchAbortRef = useRef(null)
  const submitAbortRef = useRef(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearTimeout(geocodeTimerRef.current)
      clearTimeout(searchTimerRef.current)
      geocodeAbortRef.current?.abort()
      searchAbortRef.current?.abort()
      submitAbortRef.current?.abort()
    }
  }, [])

  // ── Fetch service types config ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const fetchConfig = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getServiceTypesConfig()
        if (cancelled) return
        setConfig(data)
        if (data.service_types?.length) setServiceTypeId(data.service_types[0].id)
      } catch (err) {
        if (!cancelled) setError('Could not load services. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchConfig()
    return () => { cancelled = true }
  }, [])

  const serviceTypes = config?.service_types || []
  const selectedType = serviceTypes.find((s) => s.id === serviceTypeId) || null
  const needsArea = selectedType?.pricing_mode === 'per_sqft'

  // ── Reverse geocode a lat/lng into address + state/city/pincode (debounced) ──
  const reverseGeocode = useCallback((lat, lng) => {
    clearTimeout(geocodeTimerRef.current)
    geocodeAbortRef.current?.abort()

    geocodeTimerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      geocodeAbortRef.current = controller
      setGeocoding(true)
      setLocationError(null)
      try {
        const res = await fetch(
          `${NOMINATIM_REVERSE}?format=json&addressdetails=1&lat=${lat}&lon=${lng}`,
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error('Reverse geocode request failed')
        const data = await res.json()
        if (!mountedRef.current) return
        if (data?.display_name) setAddress(data.display_name)
        const parsed = parseNominatimAddress(data?.address)
        setCity(parsed.city)
        setStateName(parsed.state)
        setPincode(parsed.pincode)
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Reverse geocode failed', err)
        if (mountedRef.current) {
          setLocationError('Could not auto-fill address details. Please fill them in manually.')
        }
      } finally {
        if (mountedRef.current) setGeocoding(false)
      }
    }, GEOCODE_DEBOUNCE_MS)
  }, [])

  const handleMove = useCallback((lat, lng) => {
    const roundedLat = Number(lat.toFixed(6))
    const roundedLng = Number(lng.toFixed(6))
    setPosition({ lat: roundedLat, lng: roundedLng })
    reverseGeocode(roundedLat, roundedLng)
  }, [reverseGeocode])

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Your browser does not support location services.')
      return
    }
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lng = Number(pos.coords.longitude.toFixed(6))
        if (!isInIndia(lat, lng)) {
          setLocationError('This service is only available for locations within India.')
          return
        }
        setPosition({ lat, lng })
        reverseGeocode(lat, lng)
      },
      (err) => {
        const messages = {
          1: 'Location access was denied. Please pick your location on the map instead.',
          2: 'Your location could not be determined. Please pick it on the map instead.',
          3: 'Location request timed out. Please pick it on the map instead.',
        }
        setLocationError(messages[err.code] || 'Could not get your location.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // ── Address search (type a place/pincode → jump the pin there) ──────────
  const handleSearchChange = (value) => {
    setSearchQuery(value)
    clearTimeout(searchTimerRef.current)
    searchAbortRef.current?.abort()

    if (value.trim().length < 3) {
      setSearchResults([])
      return
    }

    searchTimerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      searchAbortRef.current = controller
      setSearching(true)
      try {
        const res = await fetch(
          `${NOMINATIM_SEARCH}?format=json&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(value)}`,
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error('Search request failed')
        const data = await res.json()
        if (!mountedRef.current) return
        setSearchResults(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Location search failed', err)
      } finally {
        if (mountedRef.current) setSearching(false)
      }
    }, GEOCODE_DEBOUNCE_MS)
  }

  const selectSearchResult = (item) => {
    const lat = Number(parseFloat(item.lat).toFixed(6))
    const lng = Number(parseFloat(item.lon).toFixed(6))
    if (!isInIndia(lat, lng)) {
      setLocationError('Please select a location within India.')
      setSearchResults([])
      return
    }
    setPosition({ lat, lng })
    setAddress(item.display_name || '')
    const parsed = parseNominatimAddress(item.address)
    setCity(parsed.city)
    setStateName(parsed.state)
    setPincode(parsed.pincode)
    setSearchQuery('')
    setSearchResults([])
  }

  // ── Live price preview (final price is always recalculated server-side) ──
  const previewPrice = useMemo(() => {
    if (!selectedType) return 0
    if (selectedType.pricing_mode === 'flat') return selectedType.flat_price || 0
    if (selectedType.pricing_mode === 'per_sqft') {
      const area = parseFloat(areaSqft)
      if (!area || area <= 0) return 0
      return Math.round((selectedType.price_per_sqft || 0) * area)
    }
    return 0
  }, [selectedType, areaSqft])

  const canSubmit =
    name.trim().length >= 2 &&
    isValidPhone(phone) &&
    address.trim().length > 0 &&
    serviceTypeId &&
    requirement.trim().length > 0 &&
    (!needsArea || (parseFloat(areaSqft) > 0))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setSubmitError(null)

    const controller = new AbortController()
    submitAbortRef.current = controller

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        city: city.trim() || undefined,
        state: stateName.trim() || undefined,
        pincode: pincode.trim() || undefined,
        latitude: Number(position.lat.toFixed(6)),
        longitude: Number(position.lng.toFixed(6)),
        service_type: serviceTypeId,
        area_sqft: needsArea ? Number(areaSqft) : undefined,
        requirement_text: requirement.trim(),
        source: 'property_services_page',
      }
      const res = await submitServiceRequest(payload, { signal: controller.signal })
      if (!mountedRef.current) return
      setResult(res)
    } catch (err) {
      if (err.name === 'AbortError' || !mountedRef.current) return
      const data = err?.response?.data
      let firstError = null
      if (typeof data === 'string') {
        firstError = data
      } else if (data && typeof data === 'object') {
        if (typeof data.detail === 'string') firstError = data.detail
        else if (typeof data.message === 'string') firstError = data.message
        else {
          try {
            firstError = Object.values(data).flat().filter(Boolean).join(' ')
          } catch {
            firstError = null
          }
        }
      }
      setSubmitError(firstError || 'Something went wrong submitting your request. Please try again.')
    } finally {
      if (mountedRef.current) setSubmitting(false)
    }
  }

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="psr psr--center">
        <style>{SHARED_SPIN_STYLES}</style>
        <Loader2 size={32} className="psr__spin" />
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="psr psr--center">
        <style>{`
          ${SHARED_SPIN_STYLES}
          .psr--center {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            min-height: 100vh; background: #071422; color: #8fa3b8; gap: 1rem; text-align: center; padding: 2rem;
          }
          .psr__retry-btn {
            padding: 0.75rem 1.5rem; border-radius: 0.75rem;
            background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
            color: #071422; border: none; font-weight: 600; cursor: pointer;
          }
        `}</style>
        <p>{error || 'Something went wrong.'}</p>
        <button className="psr__retry-btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    )
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="psr">
        <style>{PAGE_STYLES}</style>
        <div className="psr__success">
          <CheckCircle2 size={56} className="psr__success-icon" />
          <h1 className="psr__success-title">Request Submitted</h1>
          <p className="psr__success-msg">{result.message}</p>
          <div className="psr__success-card">
            <div className="psr__success-row">
              <span>Reference</span>
              <strong>{result.reference}</strong>
            </div>
            {result.estimated_price > 0 && (
              <div className="psr__success-row">
                <span>Estimated Price</span>
                <strong>₹{formatINR(result.estimated_price)}</strong>
              </div>
            )}
          </div>
          <Link to="/" className="psr__btn psr__btn--primary">
            <ArrowLeft size={18} /> Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="psr">
      <style>{PAGE_STYLES}</style>
      <Link to="/" className="psr__back"><ArrowLeft size={14} /> Back</Link>
      <div className="psr__header">
        <span className="psr__eyebrow">Property Services</span>
        <h1 className="psr__title">
          Manage Your <span className="psr__title-gradient">Property</span>, From Anywhere
        </h1>
        <p className="psr__subtitle">
          Pin your land's location, tell us what it needs — a compound wall, new construction,
          remodeling, or repair — and get an instant price based on our current rates.
        </p>
      </div>

      <form className="psr__grid" onSubmit={handleSubmit}>
        <div className="psr__left">

          {/* ── Location ── */}
          <div className="psr__card">
            <label htmlFor="psr-search" className="psr__label psr__label--icon"><MapPin size={14} /> Property Location</label>

            {/* Search box — type an address/pincode to jump the pin, instead of leaving the page */}
            <div className="psr__search-wrap">
              <Search size={14} className="psr__search-icon" />
              <input
                id="psr-search"
                type="text"
                className="psr__input psr__search-input"
                placeholder="Search for an address, area, or pincode..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoComplete="off"
              />
              {searching && <Loader2 size={14} className="psr__spin psr__search-spin" />}
              {searchResults.length > 0 && (
                <ul className="psr__search-results">
                  {searchResults.map((item) => (
                    <li key={item.place_id}>
                      <button type="button" onClick={() => selectSearchResult(item)}>
                        {item.display_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="psr__map-wrap">
              <MapContainer
                center={[position.lat, position.lng]}
                zoom={15}
                className="psr__map"
                scrollWheelZoom={true}
                maxBounds={INDIA_BOUNDS}
                maxBoundsViscosity={1.0}
                minZoom={5}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker
                  position={position}
                  onMove={handleMove}
                  onOutOfBounds={() => setLocationError('Please select a location within India.')}
                />
                <RecenterMap position={position} />
              </MapContainer>
              <div className="psr__map-actions">
                <button type="button" className="psr__locate-btn" onClick={useMyLocation}>
                  <LocateFixed size={14} /> Use My Location
                </button>
                <a
                  className="psr__locate-btn"
                  href={googleMapsUrl(position.lat, position.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={14} /> View in Google Maps
                </a>
              </div>
            </div>

            {geocoding && <p className="psr__hint">Looking up address details…</p>}
            {locationError && <p className="psr__error">{locationError}</p>}

            <label htmlFor="psr-address" className="psr__sr-only">Address</label>
            <input
              id="psr-address"
              type="text"
              className="psr__input"
              placeholder="Address / plot number / survey number"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <div className="psr__address-grid">
              <div>
                <label htmlFor="psr-city" className="psr__label">City</label>
                <input
                  id="psr-city"
                  type="text"
                  className="psr__input"
                  placeholder="Auto-filled from map"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="psr-state" className="psr__label">State</label>
                <input
                  id="psr-state"
                  type="text"
                  className="psr__input"
                  placeholder="Auto-filled from map"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="psr-pincode" className="psr__label">Pincode</label>
                <input
                  id="psr-pincode"
                  type="text"
                  className="psr__input"
                  placeholder="Auto-filled from map"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Service type ── */}
          <div className="psr__card">
            <label className="psr__label psr__label--block">What does your property need?</label>
            <div className="psr__service-grid">
              {serviceTypes.map((s) => {
                const Icon = SERVICE_ICONS[s.icon] || Sparkles
                const active = s.id === serviceTypeId
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setServiceTypeId(s.id)}
                    className={`psr__service-btn ${active ? 'psr__service-btn--active' : ''}`}
                    aria-pressed={active}
                  >
                    <Icon size={20} />
                    <span className="psr__service-label">{s.label}</span>
                    {s.description && <span className="psr__service-desc">{s.description}</span>}
                    <span className="psr__service-rate">
                      {s.pricing_mode === 'flat'
                        ? `₹${formatINR(s.flat_price)} flat`
                        : `₹${formatINR(s.price_per_sqft)} / sq.ft`}
                    </span>
                  </button>
                )
              })}
            </div>

            {needsArea && (
              <div className="psr__area-row">
                <label htmlFor="psr-area" className="psr__label">Area (sq.ft)</label>
                <input
                  id="psr-area"
                  type="number"
                  min="1"
                  max="1000000"
                  className="psr__input"
                  placeholder="e.g. 1200"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {/* ── Requirement ── */}
          <div className="psr__card">
            <label htmlFor="psr-requirement" className="psr__label psr__label--block">Describe what you need</label>
            <textarea
              id="psr-requirement"
              className="psr__textarea"
              rows={4}
              placeholder="e.g. Compound wall on the east side is cracked and needs rebuilding, roughly 80 ft long..."
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              required
            />
          </div>

          {/* ── Contact ── */}
          <div className="psr__card">
            <label className="psr__label psr__label--block">Your Contact Details</label>
            <div className="psr__contact-grid">
              <label htmlFor="psr-name" className="psr__sr-only">Full name</label>
              <input
                id="psr-name"
                type="text"
                className="psr__input"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label htmlFor="psr-phone" className="psr__sr-only">Phone number</label>
              <input
                id="psr-phone"
                type="tel"
                className="psr__input"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {phone.length > 0 && !isValidPhone(phone) && (
                <p className="psr__error psr__input--full">Please enter a valid phone number (10-15 digits).</p>
              )}
              <label htmlFor="psr-email" className="psr__sr-only">Email</label>
              <input
                id="psr-email"
                type="email"
                className="psr__input psr__input--full"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: live price + submit ── */}
        <div className="psr__right">
          <motion.div layout className="psr__result">
            <div className="psr__result-glow" />
            <p className="psr__result-label">Estimated Price</p>
            <div className="psr__result-total">₹{formatINR(previewPrice)}</div>
            {needsArea && (
              <p className="psr__result-note">
                Based on ₹{formatINR(selectedType?.price_per_sqft)}/sq.ft × {areaSqft || 0} sq.ft
              </p>
            )}
            <p className="psr__disclaimer">
              Final price is confirmed by our team using current rates after reviewing your request.
            </p>

            {submitError && <p className="psr__error">{submitError}</p>}

            <button type="submit" className="psr__btn psr__btn--primary psr__btn--full" disabled={!canSubmit || submitting}>
              {submitting ? <Loader2 size={18} className="psr__spin" /> : <Send size={18} />}
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </motion.div>
        </div>
      </form>
    </div>
  )
}

const SHARED_SPIN_STYLES = `
.psr__spin { animation: psr-spin 1s linear infinite; color: #c9a84c; }
@keyframes psr-spin { to { transform: rotate(360deg); } }
`

const PAGE_STYLES = `
${SHARED_SPIN_STYLES}

.psr {
  min-height: 100vh;
  background: linear-gradient(160deg, #050b14 0%, #0d1826 45%, #071422 100%);
  color: #e8d5a3;
  font-family: 'Inter', system-ui, sans-serif;
  padding: 5rem 0 6rem;
}

.psr__header { max-width: 72rem; margin: 0 auto 3rem; padding: 0 1.5rem; text-align: center; position: relative; }
.psr__back {
  position: absolute; top: 32px ; left: 3.5rem;
  display: inline-flex; align-items: center; gap: 0.4rem;
  color: #8fa3b8; text-decoration: none; font-size: 0.85rem;
  padding: 0.4rem 0.85rem; border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s ease;
}
.psr__back:hover {
  color: #c9a84c;
  border-color: rgba(201,168,76,0.4);
  background: rgba(224, 169, 15, 0.06);
}

.psr__eyebrow {
  display: inline-block; color: #c9a84c; font-size: 1.0rem; letter-spacing: 0.2em;
  text-transform: uppercase; margin-bottom: 1rem; font-weight: 600;
}
.psr__title {
  font-family: Georgia, 'Times New Roman', serif; font-size: 2.25rem; font-weight: 700;
  color: #ffffff; margin: 0 0 1rem;
}
@media (min-width: 768px) { .psr__title { font-size: 3rem; } }
.psr__title-gradient {
  background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
}
.psr__subtitle { color: #8fa3b8; max-width: 40rem; margin: 0 auto; }

.psr__grid {
  max-width: 72rem; margin: 0 auto; padding: 0 1.5rem;
  display: grid; grid-template-columns: 1fr; gap: 2rem;
}
@media (min-width: 1024px) { .psr__grid { grid-template-columns: 1.1fr 0.9fr; } }
.psr__left { display: flex; flex-direction: column; gap: 1.5rem; }
.psr__right { position: relative; }

.psr__card {
  background: linear-gradient(135deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01));
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1rem; padding: 1.5rem;
}
.psr__label { font-size: 0.875rem; color: #8fa3b8; text-transform: uppercase; letter-spacing: 0.025em; }
.psr__label--block { display: block; margin-bottom: 1rem; }
.psr__label--icon { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
.psr__sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

.psr__search-wrap { position: relative; margin-bottom: 1rem; }
.psr__search-icon { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: #5f7285; }
.psr__search-input { padding-left: 2.2rem; }
.psr__search-spin { position: absolute; right: 0.9rem; top: 50%; transform: translateY(-50%); }
.psr__search-results {
  list-style: none; margin: 0.4rem 0 0; padding: 0.3rem;
  background: #0d1826; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.6rem;
  position: absolute; z-index: 1100; width: 100%; max-height: 220px; overflow-y: auto;
}
.psr__search-results li button {
  width: 100%; text-align: left; background: none; border: none; color: #e8d5a3;
  font-size: 0.8rem; padding: 0.55rem 0.6rem; border-radius: 0.4rem; cursor: pointer;
}
.psr__search-results li button:hover { background: rgba(201,168,76,0.1); color: #f0d080; }

.psr__map-wrap { position: relative; margin-bottom: 1rem; }
.psr__map { width: 100%; height: 260px; border-radius: 0.75rem; overflow: hidden; }
.psr__map-actions {
  position: absolute; bottom: 0.75rem; right: 0.75rem; left: 0.75rem; z-index: 1000;
  display: flex; justify-content: flex-end; gap: 0.5rem; flex-wrap: wrap;
}
.psr__locate-btn {
  display: flex; align-items: center; gap: 0.35rem;
  background: rgba(7,20,34,0.9); border: 1px solid rgba(201,168,76,0.4);
  color: #c9a84c; font-size: 0.75rem; padding: 0.4rem 0.7rem; border-radius: 0.5rem;
  cursor: pointer; text-decoration: none;
}
.psr__hint { font-size: 0.75rem; color: #5f7285; margin: -0.5rem 0 0.75rem; }

.psr__input, .psr__textarea {
  width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.6rem; padding: 0.7rem 0.9rem; color: #e8d5a3; font-size: 0.9rem;
  font-family: inherit; outline: none; transition: border-color 0.2s ease;
}
.psr__input:focus, .psr__textarea:focus { border-color: rgba(201,168,76,0.5); }
.psr__input::placeholder, .psr__textarea::placeholder { color: #5f7285; }
.psr__textarea { resize: vertical; }

.psr__address-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 0.75rem; }
.psr__address-grid .psr__label { display: block; margin-bottom: 0.35rem; }

.psr__service-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
@media (min-width: 640px) { .psr__service-grid { grid-template-columns: repeat(3, 1fr); } }
.psr__service-btn {
  display: flex; flex-direction: column; align-items: flex-start; gap: 0.35rem;
  padding: 0.9rem; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.1);
  background: transparent; color: #8fa3b8; cursor: pointer; text-align: left; transition: all 0.2s ease;
}
.psr__service-btn:hover { border-color: rgba(201,168,76,0.4); }
.psr__service-btn--active {
  border-color: #c9a84c; background: rgba(201,168,76,0.08); color: #f0d080;
}
.psr__service-label { font-weight: 600; font-size: 0.85rem; color: #ffffff; }
.psr__service-btn--active .psr__service-label { color: #f0d080; }
.psr__service-desc { font-size: 0.7rem; color: #5f7285; }
.psr__service-rate { font-size: 0.75rem; color: #c9a84c; margin-top: 0.15rem; }

.psr__area-row { margin-top: 1rem; }

.psr__contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.psr__input--full { grid-column: 1 / -1; }

.psr__result {
  position: sticky; top: 6rem;
  background: linear-gradient(135deg, #0d2035 0%, #071422 100%);
  border: 1px solid rgba(201,168,76,0.25); border-radius: 1rem; padding: 1.75rem;
  overflow: hidden;
}
.psr__result-glow {
  position: absolute; top: -40%; right: -20%; width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(201,168,76,0.15), transparent 70%); pointer-events: none;
}
.psr__result-label { font-size: 0.8rem; color: #8fa3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.psr__result-total {
  font-family: Georgia, 'Times New Roman', serif; font-size: 2.5rem; font-weight: 700; color: #f0d080; margin: 0.35rem 0;
}
.psr__result-note { font-size: 0.75rem; color: #5f7285; margin-bottom: 0.75rem; }
.psr__disclaimer { font-size: 0.75rem; color: #5f7285; margin: 0.75rem 0 1.25rem; line-height: 1.5; }
.psr__error { font-size: 0.8rem; color: #f0a0a0; margin-bottom: 1rem; }

.psr__btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.85rem 1.5rem; border-radius: 0.75rem; font-weight: 600; font-size: 0.9rem;
  text-decoration: none; border: none; cursor: pointer; transition: all 0.2s ease;
}
.psr__btn--primary { background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%); color: #071422; }
.psr__btn--primary:hover { filter: brightness(1.08); }
.psr__btn--primary:disabled { opacity: 0.5; cursor: not-allowed; filter: none; }
.psr__btn--full { width: 100%; }

.psr__success {
  max-width: 32rem; margin: 6rem auto 0; padding: 0 1.5rem; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}
.psr__success-icon { color: #c9a84c; }
.psr__success-title { font-family: Georgia, 'Times New Roman', serif; font-size: 1.75rem; color: #ffffff; }
.psr__success-msg { color: #8fa3b8; }
.psr__success-card {
  width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.75rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; margin: 0.5rem 0 1rem;
}
.psr__success-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #8fa3b8; }
.psr__success-row strong { color: #f0d080; }
`