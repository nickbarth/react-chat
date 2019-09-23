import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import SocketContext from './components/socket-context'
import Router from './components/Router';
import * as io from 'socket.io-client';

const socket = io();
socket.connect();
console.log('CONNECTED');

const App = () => {
  const setName = (name) => setState({ ...state, name });
  const initialState = { name: "", socket, setName };
  const [state, setState] = useState(initialState);

  return <SocketContext.Provider value={ state }>
    <Router socket={ socket } />
 </SocketContext.Provider>
};

ReactDOM.render(<App />, document.getElementById('app'));