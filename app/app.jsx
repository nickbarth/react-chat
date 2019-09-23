import React from 'react';
import ReactDOM from 'react-dom';
import * as io from 'socket.io-client';

import SocketContext from './components/socket-context'
import Router from './components/Router';

const socket = io();
socket.connect();
console.log('CONNECTED');

ReactDOM.render(
  <SocketContext.Provider value={{ socket: socket }}>
    <Router socket={ socket } />
  </SocketContext.Provider>,
  document.getElementById('app')
);