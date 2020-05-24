import * as React from 'react'

import Config from './view/config'
import Sourcebar from './view/sourcebar'
import Logobar from './view/logobar'
import Viewport from './view/viewport'
import Schema from './model/schema'
import * as themes from './view/themes'

interface Props {
   name: string
}

class App extends React.Component<Props> {
  config: Config
  schema: Schema

  constructor(props: Props) {
    super(props);

    this.config = new Config()
    this.schema = new Schema()

    this.schema.newEntity({
      name: "Foo",
      x: 70,
      y: 70,
      width: 150,
      height: 300,
      color: themes.ColorName.blue
    })

    this.schema.newEntity({
      name: "Bar",
      x: 250,
      y: 90,
      width: 120,
      height: 200,
      color: themes.ColorName.green
    })
  }

  render() {
    const { name } = this.props;
    return <div>
      <Viewport config={this.config} schema={this.schema}/>
      <Logobar/><Sourcebar/>
    </div>;
  }
}

export default App;
