import React, { Fragment, useRef, useState, useEffect } from 'react';
import SocketContext from './socket-context'

import Chrome from './Chrome';
import Rooms from './Rooms';
import Chat from './Chat';
import Login from './Login';

const Router = ({ socket }) => {
  const [page, setPage] = useState('');

  // load current page
  useEffect(() => { 
    socket.emit('GET_PAGE');
  }, []);

  // show rooms
  useEffect(() => {
    socket.on('SET_PAGE', (data) => {
      console.log('SET_PAGE', data);
      setPage(data);
    });

    return () => socket.removeListener('SET_PAGE');
  }, []);

  return <Chrome>
    <SocketContext.Consumer>
    {(context) => (
      {
        'LOGIN': <Login {...context} />,
        'ROOMS': <Rooms {...context} />,
        'CHAT':  <Chat {...context} />,
        '':  <h1>Loading...</h1>
      }[page]
    )}
    </SocketContext.Consumer>
  </Chrome>
}

export default Router;