import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Uniform from './Uniform'

const Camera = ({
  fov,
  near,
  far,
  position,
  target,
  perspective,
  gl,
  program
}) => {
  const [projection, setProjection] = useState(Array.from({ length: 16 }))

  useEffect(() => {
    const { canvas } = gl
    const { clientWidth: width, clientHeight: height } = canvas

    const options = {
      width,
      height,
      perspective,
      fov,
      near,
      far,
      position,
      target
    }

    setProjection(createProjection(options))
  }, [fov, near, far, position, perspective])

  return (
    <Uniform name="u_projection" type="mat4" value={projection} gl={gl} program={program} />
  )
}

Camera.propTypes = {
  fov: PropTypes.number,
  near: PropTypes.number,
  far: PropTypes.number,
  position: PropTypes.array,
  target: PropTypes.array,
  perspective: PropTypes.bool
}

Camera.defaultProps = {
  fov: 60,
  near: 1,
  far: 10000,
  position: [0, 0, 100],
  target: [0, 0, 0],
  perspective: true
}

export const createProjection = ({
  width,
  height,
  fov = 60,
  near = 1,
  far = 10000,
  position = [0, 0, 100],
  target = [0, 0, 0],
  perspective = true
}) => {
  if (perspective) {
    const aspect = width / height

    const fovRad = fov * (Math.PI / 180)
    const f = Math.tan(Math.PI / 2 - fovRad / 2)
    const rangeInv = 1.0 / (near - far)

    const projectionMatrix = [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ]

    const normalize = v => {
      const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
      return (length > 0) ? [v[0] / length, v[1] / length, v[2] / length] : [0, 0, 0]
    }

    const cross = (a, b) => ([
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ])

    const subtract = (a, b) => ([
      a[0] - b[0], a[1] - b[1], a[2] - b[2]
    ])

    const multiply = (a, b) => {
      return a.reduce((acc, val, idx) => {
        const i = Math.floor(idx / 4) * 4
        const j = idx % 4
        acc[idx] = b[i] * a[j] + b[i + 1] * a[j + 4] + b[i + 2] * a[j + 8] + b[i + 3] * a[j + 12]
        return acc
      }, [])
    }

    const inverse = a => {
      const b = [
        a[0] * a[5] - a[1] * a[4], a[0] * a[6] - a[2] * a[4],
        a[0] * a[7] - a[3] * a[4], a[1] * a[6] - a[2] * a[5],
        a[1] * a[7] - a[3] * a[5], a[2] * a[7] - a[3] * a[6],
        a[8] * a[13] - a[9] * a[12], a[8] * a[14] - a[10] * a[12],
        a[8] * a[15] - a[11] * a[12], a[9] * a[14] - a[10] * a[13],
        a[9] * a[15] - a[11] * a[13], a[10] * a[15] - a[11] * a[14]
      ]

      const det = 1.0 / (b[0] * b[11] - b[1] * b[10] + b[2] * b[9] + b[3] * b[8] - b[4] * b[7] + b[5] * b[6])

      return [
        (a[5] * b[11] - a[6] * b[10] + a[7] * b[9]) * det,
        (a[2] * b[10] - a[1] * b[11] - a[3] * b[9]) * det,
        (a[13] * b[5] - a[14] * b[4] + a[15] * b[3]) * det,
        (a[10] * b[4] - a[9] * b[5] - a[11] * b[3]) * det,
        (a[6] * b[8] - a[4] * b[11] - a[7] * b[7]) * det,
        (a[0] * b[11] - a[2] * b[8] + a[3] * b[7]) * det,
        (a[14] * b[2] - a[12] * b[5] - a[15] * b[1]) * det,
        (a[8] * b[5] - a[10] * b[2] + a[11] * b[1]) * det,
        (a[4] * b[10] - a[5] * b[8] + a[7] * b[6]) * det,
        (a[1] * b[8] - a[0] * b[10] - a[3] * b[6]) * det,
        (a[12] * b[4] - a[13] * b[2] + a[15] * b[0]) * det,
        (a[9] * b[2] - a[8] * b[4] - a[11] * b[0]) * det,
        (a[5] * b[7] - a[4] * b[9] - a[6] * b[6]) * det,
        (a[0] * b[9] - a[1] * b[7] + a[2] * b[6]) * det,
        (a[13] * b[1] - a[12] * b[3] - a[14] * b[0]) * det,
        (a[8] * b[3] - a[9] * b[1] + a[10] * b[0]) * det
      ]
    }

    const z = normalize(subtract(position, target))
    const x = normalize(cross([0, 1, 0], z))
    const y = normalize(cross(z, x))

    const cameraMatrix = [
      x[0], x[1], x[2], 0,
      y[0], y[1], y[2], 0,
      z[0], z[1], z[2], 0,
      position[0], position[1], position[2], 1
    ]

    return multiply(projectionMatrix, inverse(cameraMatrix))
  } else {
    return [
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, 1, 0,
      -1, 1, 0, 1
    ]
  }
}

export default Camera
