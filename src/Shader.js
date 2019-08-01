import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

const Shader = ({
  antialias,
  depthTest,
  vertex,
  fragment,
  onUpdate,
  onResize,
  children,
  style,
  className
}) => {
  const canvas = useRef(null)
  const wrapper = useRef(null)
  const [gl, setGl] = useState(null)
  const [program, setProgram] = useState(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const gl = canvas.current.getContext('webgl', { antialias })

    gl.enable(gl.BLEND)
    gl.enable(gl.CULL_FACE)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    gl[depthTest ? 'enable' : 'disable'](gl.DEPTH_TEST)

    const createShader = (type, source) => {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
      else {
        console.log(gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
      }
    }

    const program = gl.createProgram()
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertex))
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragment))
    gl.linkProgram(program)

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) gl.useProgram(program)
    else {
      console.log(gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
    }

    setGl(gl)
    setProgram(program)
  }, [])

  useEffect(() => {
    const startTime = performance.now()
    let oldTime = performance.now()
    let raf = null

    const frame = () => {
      raf = requestAnimationFrame(frame)

      const now = performance.now()
      const delta = (now - oldTime)
      const elapsed = (now - startTime) / 5000
      oldTime = now

      onUpdate(delta, elapsed)
      if (count) gl.drawArrays(gl.POINTS, 0, count)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [gl, program, count])

  useEffect(() => {
    if (!gl || !program) return

    const onShaderResize = () => {
      const dpi = window.devicePixelRatio
      const { offsetWidth, offsetHeight } = wrapper.current

      canvas.current.width = offsetWidth * dpi
      canvas.current.height = offsetHeight * dpi

      gl.viewport(0, 0, offsetWidth * dpi, offsetHeight * dpi)
      gl.clearColor(0, 0, 0, 0)

      onResize(offsetWidth, offsetHeight, dpi)
    }
    onShaderResize()

    window.addEventListener('resize', onShaderResize)
    return () => window.removeEventListener('resize', onShaderResize)
  }, [gl, program])

  return (
    <div ref={wrapper} style={{ ...style }} className={className}>
      <canvas ref={canvas} style={{ display: 'block', width: '100%', height: '100%' }} />
      {gl !== null && program !== null && React.Children.map(children, child =>
        React.cloneElement(child, { gl, program, setCount })
      )}
    </div>
  )
}

Shader.propTypes = {
  antialias: PropTypes.bool,
  depthTest: PropTypes.bool,
  vertex: PropTypes.string.isRequired,
  fragment: PropTypes.string.isRequired,
  onUpdate: PropTypes.func,
  onResize: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node
}

Shader.defaultProps = {
  antialias: true,
  depthTest: false,
  vertex: '',
  fragment: '',
  onUpdate: (delta, elapsed) => {},
  onResize: (width, height, dpi) => {},
  style: {},
  className: ''
}

export default Shader
