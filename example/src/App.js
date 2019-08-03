import React, { Fragment, useState } from 'react'

import Waves from './Waves'
import Snow from './Snow'
import Stars from './Stars'
import Sphere from './Sphere'

const App = () => {
  const [component, setComponent] = useState(<Stars />)

  return (
    <Fragment>
      <div className="navigation">
        <button onClick={() => setComponent(<Stars />)}>
          Stars
        </button>
        <button onClick={() => setComponent(<Waves />)}>
          Waves
        </button>
        <button onClick={() => setComponent(<Snow />)}>
          Snow
        </button>
        <button onClick={() => setComponent(<Sphere />)}>
          Sphere
        </button>
      </div>
      {component}
    </Fragment>
  )
}

export default App