import React, { useState, useRef } from 'react'

import { Shader, Uniform, Attribute, Camera } from 'react-shader'

const glsl = x => x[0]

const vertex = glsl`
  precision highp float;

  attribute vec4 a_position;
  attribute vec4 a_color;

  uniform mat4 u_projection;
  uniform vec3 u_worldSize;
  uniform float u_dpi;
  uniform float u_time;

  varying vec4 v_color;

  void main() {
    vec3 pos = a_position.xyz;

    pos.x = mod(pos.x - u_time * 20.0, u_worldSize.x * 2.0) - u_worldSize.x;

    gl_Position = u_projection * vec4(pos.xyz, a_position.w);
    gl_PointSize = (u_dpi / gl_Position.w) * 100.0;

    v_color = a_color;
  }
`

const fragment = glsl`
  precision highp float;

  varying vec4 v_color;

  void main() {
    gl_FragColor = v_color;
  }`

const Stars = () => {
  const [elapsed, setElapsed] = useState(0)

  const data = useRef({
    color: [],
    position: [],
    worldSize: [0, 0, 0],
    dpi: 1
  })

  const onUpdate = (delta, elapsed) => setElapsed(elapsed)

  const onResize = (w, h, dpi) => {
    const position = [], color = []

    const aspect = w / h
    const count = aspect * 25000
    const width = 100 * aspect * 1.2
    const height = 100 * 1.2
    const depth = 80

    for (let x = 0; x < count; x++) {
      const z = Math.random() * depth
      position.push(
        -width + Math.random() * width * 2,
        -height + Math.random() * height * 2,
        z
      )
      const c = 1 / 3 + (z / depth) * (2 / 3)
      color.push(c, c, 1, c)
    }

    const worldSize = [width, height, depth]

    data.current = { position, color, dpi, worldSize }
  }

  const style = { position: 'absolute', width: '100%', height: '100%' }
  const { position, color, dpi, worldSize } = data.current

  return (
    <Shader vertex={vertex} fragment={fragment} style={style} onResize={onResize} onUpdate={onUpdate}>
      <Camera perspective={true} />
      <Attribute name="a_position" size={3} value={position} main />
      <Attribute name="a_color" size={4} value={color} />
      <Uniform name="u_time" type="float" value={elapsed} />
      <Uniform name="u_dpi" type="float" value={dpi} />
      <Uniform name="u_speed" type="float" value={5} />
      <Uniform name="u_worldSize" type="vec3" value={worldSize} />
    </Shader>
  )
}

export default Stars