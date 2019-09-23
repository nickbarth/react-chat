import React from 'react';

const SocketContext = React.createContext({
  name: '',
  socket: null,
  setName: () => {}
});

export default SocketContext;