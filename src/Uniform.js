import { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

const Uniform = ({
  name,
  type,
  value,
  gl,
  program
}) => {
  const data = useRef({ update: () => {} })

  useEffect(() => {
    const location = gl.getUniformLocation(program, name)
    const update = ({
      'int': value => gl.uniform1i(location, value),
      'float': value => gl.uniform1f(location, value),
      'vec2': value => gl.uniform2f(location, ...value),
      'vec3': value => gl.uniform3f(location, ...value),
      'vec4': value => gl.uniform4f(location, ...value),
      'mat2': value => gl.uniformMatrix2fv(location, false, value),
      'mat3': value => gl.uniformMatrix3fv(location, false, value),
      'mat4': value => gl.uniformMatrix4fv(location, false, value)
    })[type]

    data.current = { update }
  }, [])

  useEffect(() => {
    const { update } = data.current
    update(value)
  }, [value])

  return null
}

Uniform.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['int', 'float', 'vec2', 'vec3', 'vec4', 'mat2', 'mat3', 'mat4']).isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.array]).isRequired
}

export default Uniform
