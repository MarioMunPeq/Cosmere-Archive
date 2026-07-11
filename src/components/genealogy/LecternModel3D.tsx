const SURFACE_W = 0.9
const SURFACE_D = 0.62

export default function LecternModel3D() {
  return (
    <group>
      {/* Inclined reading surface */}
      <mesh position={[0, 0.88, 0.04]} rotation={[0.28, 0, 0]}>
        <boxGeometry args={[SURFACE_W, 0.025, SURFACE_D]} />
        <meshStandardMaterial color="#3a2212" roughness={0.7} metalness={0} />
      </mesh>

      {/* Front edge lip */}
      <mesh position={[0, 0.78, 0.32]}>
        <boxGeometry args={[SURFACE_W - 0.02, 0.02, 0.02]} />
        <meshStandardMaterial color="#2d1a0e" roughness={0.8} metalness={0} />
      </mesh>

      {/* Central column */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.08, 0.78, 0.08]} />
        <meshStandardMaterial color="#2d1a0e" roughness={0.75} metalness={0} />
      </mesh>

      {/* Column decorative ring */}
      <mesh position={[0, 0.79, 0]}>
        <boxGeometry args={[0.1, 0.015, 0.1]} />
        <meshStandardMaterial color="#4a3020" roughness={0.6} metalness={0.02} />
      </mesh>

      {/* Base */}
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.35, 0.025, 0.3]} />
        <meshStandardMaterial color="#2d1a0e" roughness={0.8} metalness={0} />
      </mesh>

      {/* Base feet */}
      <mesh position={[-0.14, 0.003, -0.11]}>
        <boxGeometry args={[0.03, 0.005, 0.03]} />
        <meshStandardMaterial color="#1a0e06" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0.14, 0.003, -0.11]}>
        <boxGeometry args={[0.03, 0.005, 0.03]} />
        <meshStandardMaterial color="#1a0e06" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[-0.14, 0.003, 0.11]}>
        <boxGeometry args={[0.03, 0.005, 0.03]} />
        <meshStandardMaterial color="#1a0e06" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0.14, 0.003, 0.11]}>
        <boxGeometry args={[0.03, 0.005, 0.03]} />
        <meshStandardMaterial color="#1a0e06" roughness={0.9} metalness={0} />
      </mesh>
    </group>
  )
}
