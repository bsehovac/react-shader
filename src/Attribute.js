import { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

const Attribute = ({
  name = '',
  size = 3,
  value = [],
  main = false,
  gl,
  program,
  setCount
}) => {
  const data = useRef({ update: () => {} })

  useEffect(() => {
    const index = gl.getAttribLocation(program, name)
    const buffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(index)
    gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0)

    const update = value => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(value), gl.STATIC_DRAW)
    }

    data.current = { update }
  }, [])

  useEffect(() => {
    const { update } = data.current
    if (main === true) setCount(value.length / size)
    update(value)
  }, [value])

  return null
}

Attribute.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  value: PropTypes.array.isRequired
}

export default Attribute
