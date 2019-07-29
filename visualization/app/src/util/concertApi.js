import EventEmitter from 'events';

let ws = null;
let isConnect = false;
const emitter = new EventEmitter();

const connect = idToken => {
  if (ws) {
    return;
  }

  isConnect = true;
  ws = new WebSocket(
    `${process.env.REACT_APP_WEBSOCKET_API_URL}?token=${idToken}`
  );

  ws.onopen = () => {
    console.log('CONNECTED');
  };

  ws.onmessage = message => {
    if (!message || !message.data) {
      return;
    }
    try {
      const { event, data } = JSON.parse(message.data);
      console.log('MESSAGE', event, data);
      emitter.emit(event, data);
    } catch (error) {
      console.error(error);
    }
  };

  ws.onerror = e => {
    console.error('ERROR', e.message);
  };

  ws.onclose = e => {
    ws = null;
    console.log('CLOSED', e.code, e.reason);
    if (isConnect) {
      connect(idToken);
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
  if (!ws) {
    return false;
  }

  ws.send(message);
};

export default Object.assign(emitter, { connect, disconnect, send });
