import * as React from 'react'

import Config from './view/config'
import Topbar from './view/topbar'
import Viewport from './view/viewport'
import Schema from './model/schema'
import * as themes from './view/themes'
import UI from './ui/ui'
import SelectionMenu from './view/selection_menu'

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
    this.ui = new UI(this, this.config, this.schema)
    this.ui.listenForRender(UI.RenderType.App, this)

    const foo = this.schema.newEntity({
      name: "Foo",
      x: 75,
      y: 60,
      color: themes.ColorName.blue
    })
    foo.newAttribute("first name*")
    foo.newAttribute("last name")
    foo.newAttribute("created at : datetime")
    foo.newAttribute("address")
    foo.snapPosition(this.config)

    const bar = this.schema.newEntity({
      name: "Bar",
      x: 500,
      y: 60,
      color: themes.ColorName.blue
    })
    bar.newAttribute("time : datetime")
    bar.newAttribute("number* : integer")
    bar.newAttribute("description")
    bar.snapPosition(this.config)

    const baz = this.schema.newEntity({
      name: "Baz",
      x: 75,
      y: 400,
      color: themes.ColorName.green
    })
    baz.newAttribute("name*")
    baz.newAttribute("width: integer")
    baz.newAttribute("height: integer")
    baz.snapPosition(this.config)

    this.schema.buildAssociation()
      .add(foo, 'one')
      .add(bar, 'many')
      .build()

    this.schema.buildAssociation()
      .add(foo, 'one')
      .add(baz, 'many')
      .build()

  }

  render() {
    const { name } = this.props;
    return <div>
      <Viewport config={this.config} ui={this.ui} schema={this.schema}/>
      <Topbar config={this.config} ui={this.ui} schema={this.schema}/>
      <SelectionMenu config={this.config} ui={this.ui} schema={this.schema}/>
    </div>;
  }
}

export default App;
