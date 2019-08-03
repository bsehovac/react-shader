import React, { useState } from 'react'

import { Shader, Uniform, Attribute, Camera, Texture } from 'react-shader'

const glsl = x => x[0]

const vertex = glsl`
  #define M_PI 3.1415926535897932384626433832795

  precision highp float;

  attribute vec4 a_position;
  attribute vec4 a_color;

  uniform float u_time;
  uniform float u_size;
  uniform float u_speed;
  uniform vec3 u_field;
  uniform mat4 u_projection;

  varying vec4 v_color;

  void main() {
    vec3 pos = a_position.xyz;

    pos.y += (
      cos(pos.x / u_field.x * M_PI * 8.0 + u_time * u_speed) +
      sin(pos.z / u_field.z * M_PI * 8.0 + u_time * u_speed)
    ) * u_field.y;

    gl_Position = u_projection * vec4(pos.xyz, a_position.w);
    gl_PointSize = (u_size / gl_Position.w) * 100.0;

    v_color = a_color;
  }`

const fragment = glsl`
  precision highp float;

  uniform sampler2D u_texture;

  varying vec4 v_color;

  void main() {
    gl_FragColor = v_color * texture2D(u_texture, gl_PointCoord);
  }`

const texture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAb1BMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8v0wLRAAAAJHRSTlMAC/goGvDhmwcExrVjWzrm29TRqqSKenRXVklANSIUE8mRkGpv+HOfAAABCElEQVQ4y4VT13LDMAwLrUHteO+R9f/fWMfO6dLaPeKVEECRxOULWsEGpS9nULDwia2Y+ALqUNbAWeg775zv+sA4/FFRMxt8U2FZFCVWjR/YrH4/H9sarclSKdPMWKzb8VsEeHB3m0shkhVCyNzeXeAQ9Xl4opEieX2QCGnwGbj6GMyjw9t1K0fK9YZunPXeAGsfJtYjwzxaBnozGGorYz0ypK2HzQSYx1y8DgSRo2ewOiyh2QWOEk1Y9OrQV0a8TiBM1a8eMHWYnRMy7CZ4t1CmyRkhSUvP3gRXyHOCLBxNoC3IJv//ZrJ/kxxUHPUB+6jJZZHrpg6GOjnqaOmzp4NDR48OLxn/H27SRQ08S0ZJAAAAAElFTkSuQmCC'

const Waves = () => {
  const [elapsed, setElapsed] = useState(0)
  const [field, setField] = useState([0, 0, 0])
  const [pointSize, setPointSize] = useState(5)
  const [position, setPosition] = useState([])
  const [color, setColor] = useState([])

  const onUpdate = (delta, elapsed) => setElapsed(elapsed)

  const onResize = (w, h, dpi) => {
    const position = [], color = []

    const width = 400 * (w / h)
    const depth = 400
    const height = 3
    const distance = 5

    for (let x = 0; x < width; x += distance) {
      for (let z = 0; z < depth; z+= distance) {
        position.push(- width / 2 + x, -30, -depth / 2 + z)
        color.push(0, 1 - (x / width) * 1, 0.5 + x / width * 0.5, z / depth)
      }
    }

    setColor(color)
    setPosition(position)
    setField([width, height, depth])
    setPointSize((h / 400) * 4 * dpi)
  }

  const style = { position: 'absolute', width: '100%', height: '100%' }

  return (
    <Shader vertex={vertex} fragment={fragment} style={style} onResize={onResize} onUpdate={onUpdate}>
      <Camera perspective={true} />
      <Attribute name="a_position" size={3} value={position} main />
      <Attribute name="a_color" size={4} value={color} />
      <Uniform name="u_time" type="float" value={elapsed} />
      <Uniform name="u_size" type="float" value={pointSize} />
      <Uniform name="u_field" type="vec3" value={field} />
      <Uniform name="u_speed" type="float" value={5} />
      <Texture src={texture} />
    </Shader>
  )
}

export default Waves