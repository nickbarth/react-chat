import React, { Fragment, useRef, useState, useEffect } from 'react';

const Login = ({ socket }) => {
  const [name, setName] = useState("");
  const nameRef = useRef(null);

  // connect socket
  useEffect(() => { 
    nameRef.current.focus();
  }, []);

  // emit new message
  const handleSubmit = (event) => {
    event.preventDefault();
    socket.emit('SET_NAME', name);
    console.log('SET_NAME', name);
  }

  return <Fragment>

    <p className="card-text">Chats</p>
    <form className="form-inline d-flex" onSubmit={ handleSubmit }>
      <div className="form-group flex-grow-1">
        <label>Name</label>
        <input ref={ nameRef } onChange={ e => setName(e.target.value) } value={ name } type="text" className="form-control w-100 mr-2" />
      </div>
      <button type="submit" className="btn btn-secondary mt-4">Login</button>
    </form>

  </Fragment>
};

export default Login;
