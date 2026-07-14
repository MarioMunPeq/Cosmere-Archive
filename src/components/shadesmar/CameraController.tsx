'use client'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const MOVE_ACCEL = 60
const MOVE_DRAG = 0.92
const MAX_SPEED = 3.5
const MOUSE_SENSITIVITY = 0.002
const EYE_HEIGHT = 0.16

export default function CameraController() {
  const { gl } = useThree()
  const keys = useRef<Set<string>>(new Set())
  const velocity = useRef(new THREE.Vector3())
  const yaw = useRef(0)
  const pitch = useRef(-0.15)
  const isLocked = useRef(false)

  useEffect(() => {
    const canvas = gl.domElement

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.code.toLowerCase())
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.code.toLowerCase())
    }
    const onPointerLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas
    }
    const onClick = () => {
      if (!isLocked.current) {
        void canvas.requestPointerLock()
      }
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return
      yaw.current -= e.movementX * MOUSE_SENSITIVITY
      pitch.current -= e.movementY * MOUSE_SENSITIVITY
      pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current))
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    canvas.addEventListener('click', onClick)
    document.addEventListener('mousemove', onMouseMove)

    void canvas.requestPointerLock()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      canvas.removeEventListener('click', onClick)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [gl])

  useFrame((state, delta) => {
    const fwd = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)

    const accel = new THREE.Vector3()
    if (keys.current.has('keyw') || keys.current.has('arrowup')) accel.add(fwd)
    if (keys.current.has('keys') || keys.current.has('arrowdown')) accel.sub(fwd)
    if (keys.current.has('keya') || keys.current.has('arrowleft')) accel.sub(right)
    if (keys.current.has('keyd') || keys.current.has('arrowright')) accel.add(right)

    if (accel.lengthSq() > 0) {
      accel.normalize().multiplyScalar(MOVE_ACCEL * delta)
      velocity.current.add(accel)
    }

    velocity.current.multiplyScalar(MOVE_DRAG)
    const speed = velocity.current.length()
    if (speed > MAX_SPEED) {
      velocity.current.multiplyScalar(MAX_SPEED / speed)
    }

    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
    state.camera.quaternion.setFromEuler(euler)

    const move = velocity.current.clone().multiplyScalar(delta)
    state.camera.position.add(move)
    state.camera.position.setY(EYE_HEIGHT)
  })

  return null
}
