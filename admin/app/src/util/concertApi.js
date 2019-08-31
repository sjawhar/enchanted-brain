import EventEmitter from 'events';
import { Auth } from 'aws-amplify';

let ws = null;
let isConnect = false;
const emitter = new EventEmitter();

if (process.env.REACT_APP_WEBSOCKET_EMITTER_EXPOSE === 'true') {
  window.emitter = emitter;
}

const handleMessage = message => {
  const { data: messageData } = message || {};
  if (!messageData) {
    return;
  }
  try {
    const { event, data } = JSON.parse(messageData);
    emitter.emit(event, data);
  } catch (error) {
    console.error(error);
  }
};

const connect = async () => {
  isConnect = true;

  if (process.env.REACT_APP_WEBSOCKET_API_STUB === 'true') {
    return;
  } else if (ws) {
    return;
  }

  const idToken = (await Auth.currentSession()).getIdToken().getJwtToken();
  ws = new WebSocket(
    `${process.env.REACT_APP_WEBSOCKET_API_URL}?token=${idToken}`
  );

  ws.onopen = () => {
    console.log('CONNECTED');
  };

  ws.onmessage = handleMessage;

  ws.onerror = e => {
    console.error('ERROR', e.message);
  };

  ws.onclose = e => {
    ws = null;
    console.log('CLOSED', e.code, e.reason);
    if (isConnect) {
      connect();
    }
  };
};

const disconnect = () => {
  isConnect = false;
  if (!ws) {
    return;
  }
  ws.close();
};

const send = message => {
  if (process.env.REACT_APP_WEBSOCKET_API_STUB === 'true') {
    console.log('SEND', message);
    handleMessage({ data: JSON.stringify(message) });
  }
  if (!ws) {
    return false;
  }

  ws.send(JSON.stringify(message));
};

export default Object.assign(emitter, { connect, disconnect, send });
