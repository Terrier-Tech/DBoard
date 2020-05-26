import * as React from 'react'

import Config from './view/config'
import Topbar from './view/topbar'
import Viewport from './view/viewport'
import Schema from './model/schema'
import * as themes from './view/themes'
import UI from './ui/ui'

interface Props {
   name: string
}

class App extends React.Component<Props> {
  config: Config
  ui: UI
  schema: Schema

  constructor(props: Props) {
    super(props);

    this.config = new Config()
    this.schema = new Schema()
    this.ui = new UI(this)

    const foo = this.schema.newEntity({
      name: "Foo",
      x: 75,
      y: 40,
      color: themes.ColorName.blue
    })
    foo.newAttribute("first name*")
    foo.newAttribute("last name")
    foo.newAttribute("created at : datetime")
    foo.newAttribute("address")

    const bar = this.schema.newEntity({
      name: "Bar",
      x: 400,
      y: 40,
      color: themes.ColorName.green
    })
    bar.newAttribute("time : datetime")
    bar.newAttribute("number* : integer")
    bar.newAttribute("description")

    const baz = this.schema.newEntity({
      name: "Baz",
      x: 75,
      y: 300,
      color: themes.ColorName.orange
    })
    baz.newAttribute("name*")
    baz.newAttribute("width: integer")
    baz.newAttribute("height: integer")
  }

  render() {
    const { name } = this.props;
    return <div>
      <Viewport config={this.config} ui={this.ui} schema={this.schema}/>
      <Topbar/>
    </div>;
  }
}

export default App;
