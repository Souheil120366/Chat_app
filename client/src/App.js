import React, {useState, useEffect} from 'react';
import io from 'socket.io-client';
import './App.css';

function App () {
  const [socket] = useState (() => io (':8000'));
  const [message, setMessage] = useState ('');
  const [chatLog, setChatLog] = useState ([]);
  const [username, setUsername] = useState ('');
  const [userList, setUserList] = useState ([]);
  const [userJoin, setUserJoin] = useState ('');
  const [userDisconnect, setUserDisconnect] = useState ('');
  const [inputValue, setInputValue] = useState ('');
  

  useEffect (() => {
    // Send username to server for login

    // Listen for incoming chat messages from the server
    socket.on ('chat_message', data => {
      const senderId = data.username;
      const message = data.message;

      // Use the sender's socket ID and message as needed
      console.log ('Received message from:', senderId);
      console.log ('Message:', message);

      setChatLog (prevChatLog => [...prevChatLog, data]);
    });
    socket.on ('previousMessages', chatLog => {
      setChatLog (chatLog);
    });
    socket.on ('userList', userList => {
      setUserList (userList);
    });
    socket.on ('userJoin', username => {
      setUserJoin (username);
    });
    socket.on ('userDisconnect', username => {
      setUserDisconnect (username);
    });

    // Clean up the event listener when the component unmounts
    return () => {
      socket.off ('chat_message');
      socket.off ('userList');
    };
  }, []);

  function scrollToBottom () {
    const container = document.getElementById ('App');
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const scrollTop = container.scrollTop;

    // Calculate the remaining height to scroll
    const remainingHeight = scrollHeight - clientHeight - scrollTop;

    // Scroll to the remaining height
    container.scrollTop += remainingHeight;
  }

  const handleGetUser = () => {
    setUsername (inputValue);
    // Emit the chat message to the server
    socket.emit ('login', inputValue);
  };

  const handleSendMessage = () => {
    // Emit the chat message to the server
    socket.emit ('chat_message', message);
    scrollToBottom ();
    setMessage ('');
  };

  return (
    <div id="App">
      <h1>Chat App</h1>
      <div className="bottom">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue (e.target.value)}
        />
        <button onClick={handleGetUser}>Start chatting</button>
      </div>
      {username
        ? <div>
            <div>

              {chatLog.map ((msg, index) => (
                <div key={index}>
                  {msg.username == username
                    ? <div className="box-msg msg-you">
                        <p>You said </p>
                        <p>{msg.message}</p>
                      </div>
                    : <div className="box-msg msg-others">
                        <p>{msg.username} said </p>
                        <p>{msg.message}</p>
                      </div>}
                </div>
              ))}
            </div>
            <div>
              {userJoin && userJoin != username
                ? <p>{userJoin} has joined the chat</p>
                : null}
              {userDisconnect
                ? <p>{userDisconnect} has left the chat</p>
                : null}
            </div>
            <div className="bottom">
              <input
                type="text"
                value={message}
                id="messages"
                onChange={e => setMessage (e.target.value)}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        : null}
    </div>
  );
}

export default App;
