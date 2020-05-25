import * as React from 'react';

interface Props {
}

class Topbar extends React.Component<Props> {
  render() {
    return <div id='topbar'>
        <div className='logo'>DBoard</div>
        <div className='file'></div>
        <a className='action select'>Select</a>
        <a className='action entity'>Entity</a>
        <a className='action association'>Assoc.</a>
    </div>;
  }
}

export default Topbar;