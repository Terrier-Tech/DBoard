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

    const foo = this.schema.newEntity({
      name: "Foo",
      x: 75,
      y: 75,
      color: themes.ColorName.blue
    })
    foo.newAttribute("first name*")
    foo.newAttribute("last name")
    foo.newAttribute("created at : datetime")
    foo.newAttribute("address")

    const bar = this.schema.newEntity({
      name: "Bar",
      x: 340,
      y: 80,
      color: themes.ColorName.green
    })
    bar.newAttribute("time : datetime")
    bar.newAttribute("number* : integer")
    bar.newAttribute("description")
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
