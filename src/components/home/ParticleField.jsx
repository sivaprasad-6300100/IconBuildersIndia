import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// ── Responsive Camera — backs off + widens FOV on small screens ──────────
function ResponsiveCamera() {
  const { camera, size } = useThree()

  useEffect(() => {
    const isMobile = size.width < 768
    const isSmallMobile = size.width < 400

    if (isSmallMobile) {
      camera.position.set(0, -0.1, 13)
      camera.fov = 62
    } else if (isMobile) {
      camera.position.set(0, 0, 11.5)
      camera.fov = 58
    } else {
      camera.position.set(0, 0.3, 8.5)
      camera.fov = 52
    }
    camera.updateProjectionMatrix()
  }, [size.width, camera])

  return null
}

// ── Starfield ────────────────────────────────────────────────────────────
function Starfield({ count = 400 }) {
  const ref = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 24
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12 + 3
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.015
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#f0d080"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.5}
      />
    </Points>
  )
}

// ── Constellation Lines — visible but calm background layer ───────────────
function ConstellationLines({ count = 150, maxDistance = 3.5, travelers = 50, speed = 0.25 }) {
  const lineRef = useRef()
  const lineMatRef = useRef()
  const travelRef = useRef()

  const { linePositions, segmentPairs } = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 24
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12 + 3
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4
    }

    const segs = []
    const pairs = []
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = arr[i * 3]     - arr[j * 3]
        const dy = arr[i * 3 + 1] - arr[j * 3 + 1]
        const dz = arr[i * 3 + 2] - arr[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < maxDistance) {
          segs.push(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2])
          segs.push(arr[j * 3], arr[j * 3 + 1], arr[j * 3 + 2])
          pairs.push([
            new THREE.Vector3(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]),
            new THREE.Vector3(arr[j * 3], arr[j * 3 + 1], arr[j * 3 + 2]),
          ])
        }
      }
    }

    return { linePositions: new Float32Array(segs), segmentPairs: pairs }
  }, [count, maxDistance])

  const travelData = useMemo(() => {
    if (segmentPairs.length === 0) return []
    const n = Math.min(travelers, segmentPairs.length)
    return Array.from({ length: n }, () => ({
      pair: segmentPairs[Math.floor(Math.random() * segmentPairs.length)],
      offset: Math.random(),
      speed: speed * (0.6 + Math.random() * 0.8),
    }))
  }, [segmentPairs, travelers, speed])

  const travelPositions = useMemo(
    () => new Float32Array(travelData.length * 3),
    [travelData]
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (lineRef.current) lineRef.current.rotation.y = t * 0.015
    if (lineMatRef.current) {
      lineMatRef.current.opacity = 0.22 + Math.sin(t * 0.6) * 0.08
    }

    if (travelRef.current && travelData.length) {
      for (let i = 0; i < travelData.length; i++) {
        const d = travelData[i]
        const progress = (t * d.speed + d.offset) % 1
        const p = new THREE.Vector3().lerpVectors(d.pair[0], d.pair[1], progress)
        travelPositions[i * 3]     = p.x
        travelPositions[i * 3 + 1] = p.y
        travelPositions[i * 3 + 2] = p.z
      }
      travelRef.current.geometry.attributes.position.needsUpdate = true
      travelRef.current.rotation.y = t * 0.015
    }
  })

  return (
    <group>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMatRef}
          color="#ffdb8a"
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {travelData.length > 0 && (
        <points ref={travelRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={travelPositions.length / 3}
              array={travelPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#fff6d9"
            size={0.07}
            transparent
            opacity={0.85}
            depthWrite={false}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  )
}
// ── One villa: ground floor + set-back upper floor (balcony) + flat roof ──
// Wide & short proportions on purpose — this is what reads as "home," not tower.
function Villa({
  x,
  w,
  d,
  groundH,
  upperH = 0,
  groundY = -1.5,
  featured = false,
  mirrored = false,
}) {
  const upperW = w * 0.8
  const upperD = d * 0.7
  const balconyDepth = (d - upperD) / 2

  const groundGeo = useMemo(() => new THREE.BoxGeometry(w, groundH, d), [w, groundH, d])
  const groundEdges = useMemo(() => new THREE.EdgesGeometry(groundGeo), [groundGeo])

  const upperGeo = useMemo(
    () => (upperH > 0 ? new THREE.BoxGeometry(upperW, upperH, upperD) : null),
    [upperW, upperH, upperD]
  )
  const upperEdges = useMemo(() => (upperGeo ? new THREE.EdgesGeometry(upperGeo) : null), [upperGeo])

  const topH = groundY + groundH + upperH
  const bodyOp = mirrored ? 0.16 : 0.5
  const edgeOp = mirrored ? 0.2 : 0.75
  const lineOp = mirrored ? 0.08 : 0.4

  return (
    <group position={[x, 0, 0]}>
      {/* ── ground floor ── */}
      <mesh position={[0, groundY + groundH / 2, 0]} geometry={groundGeo}>
        <meshStandardMaterial color="#050505" transparent opacity={bodyOp} metalness={0.7} roughness={0.3} />
      </mesh>
      <lineSegments position={[0, groundY + groundH / 2, 0]} geometry={groundEdges}>
        <lineBasicMaterial color="#c9a227" transparent opacity={edgeOp} />
      </lineSegments>

      {/* ground floor windows (small grid, not one long strip) */}
      {[-w * 0.28, 0, w * 0.28].map((wx, i) => (
        <mesh key={i} position={[wx, groundY + groundH * 0.55, d / 2 + 0.005]}>
          <boxGeometry args={[w * 0.14, groundH * 0.35, 0.01]} />
          <meshBasicMaterial color="#f0d080" transparent opacity={lineOp + 0.15} />
        </mesh>
      ))}

      {/* ── upper floor, set back to create a front balcony ── */}
      {upperH > 0 && (
        <>
          <mesh
            position={[0, groundY + groundH + upperH / 2, -balconyDepth / 2]}
            geometry={upperGeo}
          >
            <meshStandardMaterial color="#050505" transparent opacity={bodyOp} metalness={0.7} roughness={0.3} />
          </mesh>
          <lineSegments
            position={[0, groundY + groundH + upperH / 2, -balconyDepth / 2]}
            geometry={upperEdges}
          >
            <lineBasicMaterial color="#c9a227" transparent opacity={edgeOp} />
          </lineSegments>

          {/* balcony railing along the exposed front edge of the ground floor roof */}
          <mesh position={[0, groundY + groundH + 0.06, d / 2 - 0.15]}>
            <boxGeometry args={[w * 0.82, 0.1, 0.02]} />
            <meshBasicMaterial color="#c9a227" transparent opacity={edgeOp * 0.8} />
          </mesh>
          {[-1, -0.5, 0, 0.5, 1].map((t, i) => (
            <mesh key={i} position={[t * w * 0.38, groundH * 0.5 + groundY + groundH * 0.5 + 0.05, d / 2 - 0.15]}>
              <boxGeometry args={[0.015, 0.16, 0.02]} />
              <meshBasicMaterial color="#c9a227" transparent opacity={edgeOp * 0.7} />
            </mesh>
          ))}

          {/* upper floor windows */}
          {[-upperW * 0.25, upperW * 0.25].map((wx, i) => (
            <mesh key={i} position={[wx, groundY + groundH + upperH * 0.55, -balconyDepth / 2 + upperD / 2 + 0.005]}>
              <boxGeometry args={[upperW * 0.18, upperH * 0.4, 0.01]} />
              <meshBasicMaterial color="#f0d080" transparent opacity={lineOp + 0.15} />
            </mesh>
          ))}
        </>
      )}

      {/* ── flat roof parapet (thin frame on top — this is what makes it a HOME, not a spire) ── */}
      <lineSegments
        position={[0, topH + 0.03, 0]}
        geometry={new THREE.EdgesGeometry(new THREE.BoxGeometry(upperH > 0 ? upperW : w, 0.06, upperH > 0 ? upperD : d))}
      >
        <lineBasicMaterial color="#f0d080" transparent opacity={edgeOp} />
      </lineSegments>

      {/* ── compound wall + gate posts — only on the featured (hero) home ── */}
      {featured && !mirrored && (
        <>
          <mesh position={[0, groundY + 0.15, d / 2 + 0.55]}>
            <boxGeometry args={[w * 1.15, 0.3, 0.04]} />
            <meshBasicMaterial color="#c9a227" transparent opacity={0.35} />
          </mesh>
          {[-0.42, 0.42].map((gx, i) => (
            <mesh key={i} position={[gx * w, groundY + 0.28, d / 2 + 0.55]}>
              <boxGeometry args={[0.06, 0.56, 0.06]} />
              <meshBasicMaterial color="#c9a227" transparent opacity={0.5} />
            </mesh>
          ))}
        </>
      )}

      {/* warm glow at roof of the featured home only */}
      {featured && !mirrored && (
        <pointLight position={[0, topH + 0.4, 0]} color="#f0d080" intensity={1.1} distance={3.5} />
      )}
    </group>
  )
}

const HOUSE_LAYOUT = [
  { x: -3.5, w: 2.0, d: 1.5, groundH: 0.85, upperH: 0 },               // single-story home
  { x: 0,    w: 2.6, d: 2.0, groundH: 0.9,  upperH: 0.8, featured: true }, // hero two-story home
  { x: 3.4,  w: 2.2, d: 1.7, groundH: 0.85, upperH: 0.7 },              // two-story home
]

// ── Full row of homes — slow continuous rotation + gentle bob ─────────────
function HomeRow() {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.08
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.05
  })

  return (
    <group ref={groupRef}>
      {HOUSE_LAYOUT.map((h, i) => (
        <Villa key={i} groundY={-1.5} {...h} />
      ))}

      {/* faint mirrored reflection */}
      <group scale={[1, -1, 1]} position={[0, -3.05, 0]}>
        {HOUSE_LAYOUT.map((h, i) => (
          <Villa key={`refl-${i}`} groundY={-1.5} {...h} mirrored />
        ))}
      </group>

      {/* reflective ground plane */}
      <mesh position={[0, -1.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.85} roughness={0.2} transparent opacity={0.55} />
      </mesh>

      {/* ground accent line */}
      <mesh position={[0, -1.515, 0]}>
        <boxGeometry args={[8.4, 0.02, 0.02]} />
        <meshBasicMaterial color="#c9a227" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

// ── Main export ──────────────────────────────────────────────────────────
export default function ParticleField() {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 8.5], fov: 52 }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ResponsiveCamera />

      <ambientLight intensity={0.28} />
      <pointLight position={[6, 6, 8]} intensity={0.6} color="#c9a227" />
      <pointLight position={[-6, -2, -4]} intensity={0.3} color="#1e4470" />

      <HomeRow />
      <Starfield count={400} />
      <ConstellationLines count={150} maxDistance={3.5} travelers={50} speed={0.25} />
    </Canvas>
  )
}