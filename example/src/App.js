import React, { Fragment, useState } from 'react'

import Waves from './Waves'
import Snow from './Snow'

const App = () => {
  const [component, setComponent] = useState(<Waves />)

  return (
    <Fragment>
      <div className="navigation">
        <button onClick={() => setComponent(<Waves />)}>
          Waves
        </button>
        <button onClick={() => setComponent(<Snow />)}>
          Snow
        </button>
      </div>
      {component}
    </Fragment>
  )
}

export default App