import * as React from 'react';

interface Props {
}

class Topbar extends React.Component<Props> {
  render() {
    return <div id='topbar'>
        <div className='logo'>DBoard</div>
        <div className='file'></div>
        <a className='action entity'>Entity</a>
    </div>;
  }
}

export default Topbar;