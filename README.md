# react-shader

> 

[![NPM](https://img.shields.io/npm/v/react-shader.svg)](https://www.npmjs.com/package/react-shader) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-shader
```

or

```bash
yarn add react-shader
```

## Usage

```jsx
import React, { useState, useMemo } from 'react'
import ReactDOM from 'react-dom'

import { Shader, Uniform, Attribute, Camera } from 'react-shader'

const vertex = `
  precision highp float;

  attribute vec4 a_position;

  uniform mat4 u_projection;
  uniform float u_time;

  varying vec4 v_color;

  void main() {
    vec3 pos = a_position.xyz;

    float a = -u_time;
    pos.x = a_position.x * cos(a) - a_position.z * sin(a);
    pos.z = a_position.x * sin(a) + a_position.z * cos(a);

    gl_Position = u_projection * vec4(pos.xyz, a_position.w);
    gl_PointSize = (5.0 * ${devicePixelRatio}.0 / gl_Position.w) * 100.0;

    v_color = vec4(0.0, (pos.z + 30.0) / 60.0, 1.0, 1.0);
  }
`

const fragment = `
  precision highp float;

  varying vec4 v_color;

  void main() {
    if(length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
    gl_FragColor = v_color;
  }
`

const Demo = () => {
  const [elapsed, setElapsed] = useState(0)

  const position = useMemo(() => {
    return Array.from({ length: 500 }).reduce((a, v) => {
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)
      a.push(
        30 * Math.sin(phi) * Math.cos(theta),
        30 * Math.sin(phi) * Math.sin(theta),
        30 * Math.cos(phi)
      )
      return a
    },[])

  }, [])

  const onUpdate = (delta, elapsed) => setElapsed(elapsed)

  const style = { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: '#000' }

  return (
    <Shader vertex={vertex} fragment={fragment} onUpdate={onUpdate} style={style}>
      <Camera perspective={true} />
      <Attribute name="a_position" size={3} value={position} main />
      <Uniform name="u_time" type="float" value={elapsed} />
    </Shader>
  )
}

ReactDOM.render(<Demo />, document.getElementById('root'))
```

## License

MIT © [bsehovac](https://github.com/bsehovac)
