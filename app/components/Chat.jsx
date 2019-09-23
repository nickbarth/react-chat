import React, { Fragment, useRef, useState, useEffect } from 'react';
const uuid = require('uuid/v4');

const ChatMessage = ({ message }) => (
  <span className="message">{ message }</span>
);

const Chat = ({ socket, name }) => {
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // connect socket
  useEffect(() => { 
    socket.emit('GET_MESSAGES');
    inputRef.current.focus();
  }, []);

  // load messages   
  useEffect(() => {
    socket.on('LOAD_MESSAGES', (data) => {
      console.log('LOAD_MESSAGES', data);
      setMessages(data);
    });

    return () => socket.removeListener('LOAD_MESSAGES');
  }, []);

  // emit new message
  const handleSubmit = (event) => {
    event.preventDefault();
    const message = { id: uuid(), message: `${name}: ${input}` };
    setMessages([...messages, message]);
    socket.emit('SEND_MESSAGE', input);
    setInput("");
    inputRef.current.focus();
  }

  // emit leave room
  const handleBack = (event) => {
    event.preventDefault();
    socket.emit('LEAVE_ROOM');
  }

  // new message from server
  useEffect(() => {
    socket.on('NEW_MESSAGE', (data) => {
      console.log('NEW_MESSAGE', data);
      setMessages([...messages, data]);
    });

    return () => socket.removeListener('NEW_MESSAGE');
  });

  // scroll on message update
  useEffect(() => {
    chatRef.current.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  return <Fragment>
    <p className="card-text">
      <button onClick={ handleBack } className="btn btn-outline-secondary btn-sm">&lt; Back</button>
    </p>
    <div id="messages" ref={ chatRef } className="pre-scrollable">
      {messages.map((message) => <ChatMessage key={ message.id } { ...message } />)}
    </div>
    <form className="form-inline d-flex" onSubmit={ handleSubmit }>
      <div className="form-group flex-grow-1">
        <input ref={ inputRef } onChange={ e => setInput(e.target.value) } value={ input } type="text" className="form-control w-100 mr-2" />
      </div>
      <button type="submit" className="btn btn-secondary">Send</button>
    </form>
  </Fragment>
}

export default Chat;