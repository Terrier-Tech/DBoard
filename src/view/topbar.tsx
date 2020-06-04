import * as React from 'react';
import Logo from '../resources/svg/logo-white.svg'

interface Props {
}

class Topbar extends React.Component<Props> {
  render() {
    return <div id='topbar'>
        <a className='logo'><Logo/></a>
        <div className='file'></div>
        <a className='action entity'>Entity</a>
    </div>;
  }
}

export default Topbar;