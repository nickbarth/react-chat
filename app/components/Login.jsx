import React, { Fragment, useRef, useState, useEffect } from 'react';

const Login = ({ socket, setName }) => {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  // connect socket
  useEffect(() => { 
    inputRef.current.focus();
  }, []);

  // emit new message
  const handleSubmit = (event) => {
    event.preventDefault();
    setName(input);
    socket.emit('SET_NAME', input);
    console.log('SET_NAME', input);
  }

  return <Fragment>
    <p className="card-text">Chats</p>
    <form className="form-inline d-flex" onSubmit={ handleSubmit }>
      <div className="form-group flex-grow-1">
        <label>Name</label>
        <input ref={ inputRef } onChange={ e => setInput(e.target.value) } value={ input } type="text" className="form-control w-100 mr-2" />
      </div>
      <button type="submit" className="btn btn-secondary mt-4">Login</button>
    </form>
  </Fragment>
};

export default Login;
