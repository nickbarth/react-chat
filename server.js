const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const uuid = require('uuid/v4');

const state = {
  rooms: {
    byId: [],
    byHash: {}
  },
  players: {
    byId: [],
    byHash: {}
  }
}

const newPlayer = (id) => ({
  id,
  name: '',
  page: '',
  room: '',
});

const createPlayer = (id) => {
  state.players.byId.push(id);
  state.players.byHash[id] = newPlayer(id);
};

const getPlayer = (id) => state.players.byHash[id];

const updatePlayer = (id, data) => {
  state.players.byHash[id] = {...state.players.byHash[id], ...data};
};

const newMessage = (player, message) => ({
  id: uuid(),
  message: `${player.name}: ${message}`
});

const newRoom = (name) => ({
  id: uuid(),
  name,
  players: [],
  messages: []
});

const createRoom = (name) => {
  const room = newRoom(name);
  state.rooms.byId.push(room.id);
  state.rooms.byHash[room.id] = room;
  return room.id;
};

const getRoom = (id) => state.rooms.byHash[id];

const updateRoom = (id, data) => {
  state.rooms.byHash[id] = {...state.rooms.byHash[id], ...data};
};

const joinRoom = (id, player) => {
  updateRoom(id, {players: [...getRoom(id).players, player.id]});
}

const leaveRoom = (player) => {
  const id = player.room;

  if (!id) {
    return;
  }

  // remove player from room
  updateRoom(id, { players: getRoom(id).players.filter((index) => index != player.id) });
  updatePlayer(player.id, { room: [] });
  
  // delete room if no players
  if (getRoom(id).players.length === 0) {
    state.rooms.byId = state.rooms.byId.filter((index) => index != id);
    delete state.rooms.byHash[id];
  }
}

io.on('connection', function(socket) {
  console.log('USER_CONNECTED', socket.id);

  // create player on connection
  createPlayer(socket.id);

  // handle disconnect
  socket.on('disconnect', function() {
    console.log('USER_DISCONNECTED', socket.id);

    const player = getPlayer(socket.id);

    // leave room
    if (player.room !== "") {
      socket.leave(player.room);
      leaveRoom(player);
    }

    // remove player
    state.players.byId = state.players.byId.filter((index) => index != player.id);
    delete state.players.byHash[player.id];
  });


  // handle requests current page
  socket.on('GET_PAGE', function() {
    const player = getPlayer(socket.id);
    if (player.page === "") {
      socket.emit('SET_PAGE', 'LOGIN');
      updatePlayer(player.id, { 'page': 'LOGIN' });
    } else {
      socket.emit('SET_PAGE', player.page);
    }
  });
  
  // handle sets name
  socket.on('SET_NAME', function(data) {
    const player = getPlayer(socket.id);

    updatePlayer(player.id, { name: data, page: 'ROOMS' });
    socket.emit('SET_PAGE', 'ROOMS');

    console.log('SET_NAME', getPlayer(socket.id), data);
  });

  // handle creates new chat room
  socket.on('CREATE_ROOM', function(data) {
    const player = getPlayer(socket.id);
    const id = createRoom(data);

    joinRoom(id, player);
    updatePlayer(player.id, { room: id, page: 'CHAT' });
    socket.join(id);

    socket.broadcast.emit('SET_ROOMS', state.rooms.byId.map(id => getRoom(id)));

    socket.emit('SET_PAGE', 'CHAT');
    console.log('CREATE_ROOM', getPlayer(socket.id), data);
  });

  // handle get rooms
  socket.on('GET_ROOMS', function() {
    const player = getPlayer(socket.id);
    const rooms = state.rooms.byId.map(id => getRoom(id));

    socket.emit('SET_ROOMS', rooms);
    console.log('GET_ROOMS', player);
  });

  // handle join room
  socket.on('JOIN_ROOM', function(id) {
    const player = getPlayer(socket.id);

    // check room exists
    if (state.rooms.byId.includes(id)) {
      // leave current room
      if (player.room !== "") {
        socket.leave(player.room);
        leaveRoom(player);
      }

      joinRoom(id, player);
      updatePlayer(player.id, { room: id, page: 'CHAT' });
      socket.join(id);

      socket.emit('SET_PAGE', 'CHAT');
    }

    console.log('JOIN_ROOM', getPlayer(socket.id), id);
  });

  // handle leave room
  socket.on('LEAVE_ROOM', function() {
    const player = getPlayer(socket.id);

    socket.leave(player.room);
    leaveRoom(player);
    updatePlayer(player.id, { room: '', page: 'ROOMS' });
    socket.emit('SET_PAGE', 'ROOMS');

    console.log('LEAVE_ROOM', getPlayer(socket.id));
  });


  // handle get chat messages
  socket.on('GET_MESSAGES', function() {
    const player = getPlayer(socket.id);

    // check room exists
    if (state.rooms.byId.includes(player.room)) {
      socket.emit('LOAD_MESSAGES', getRoom(player.room).messages);
    }

    console.log('GET_MESSAGES', player, getRoom(player.room));
  });

  // handle sends a chat message
  socket.on('SEND_MESSAGE', function(data){
    const player = getPlayer(socket.id);
    const room = getRoom(player.room);
    const message = newMessage(player, data);

    updateRoom(room.id, { messages: [...room.messages, message] });
    socket.broadcast.to(room.id).emit('NEW_MESSAGE', message);

    console.log('SEND_MESSAGES', player, getRoom(player.room), data);
  });
});

app.use(express.static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

http.listen(process.env.PORT, function(){
  console.log(`Listening on localhost:${process.env.PORT}`);
});