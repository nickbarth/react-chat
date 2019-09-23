import React, { Fragment, useRef, useState, useEffect } from 'react';

const Room = ({ socket, id, name }) => {
  // emit join room
  const handleJoin = (id) => {
    event.preventDefault();
    console.log('JOIN_ROOM', id);
    socket.emit('JOIN_ROOM', id);
  }

  return <div className="card mb-4 shadow-sm">
    <div className="card-body">
      <div className="d-flex justify-content-between align-items-center">
        <div className="card-text flex-grow-1">{ name }</div>
        <button onClick={ () => handleJoin(id) } className="btn btn-sm btn-outline-secondary">Join</button>
      </div>
    </div>
  </div>
};

const Rooms = ({ socket }) => {
  const [name, setName] = useState("");
  const [rooms, setRooms] = useState([]);
  const nameRef = useRef(null);

  // init
  useEffect(() => { 
    socket.emit('GET_ROOMS');
    nameRef.current.focus();
  }, []);

  // get rooms
  useEffect(() => {
    socket.on('SET_ROOMS', (data) => {
      console.log('SET_ROOMS', data);
      setRooms(data);
    });

    return () => socket.removeListener('SET_ROOMS');
  }, []);

  // emit new room
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('CREATE_ROOM', name);
    socket.emit('CREATE_ROOM', name);
  }

  return <Fragment>
    <div className="card mb-4 shadow-sm">
      <div className="card-body">

        <p className="card-text">Create Room</p>
        <form className="form-inline d-flex" onSubmit={ handleSubmit }>
          <div className="form-group flex-grow-1">
            <input ref={ nameRef } onChange={ e => setName(e.target.value) } value={ name } type="text" className="form-control w-100 mr-2" />
          </div>
          <button type="submit" className="btn btn-secondary">Create</button>
        </form>
      </div>
    </div>

    {rooms.map(room => <Room key={ room.id } socket={ socket } { ...room } />)}
  </Fragment>
}

export default Rooms;
