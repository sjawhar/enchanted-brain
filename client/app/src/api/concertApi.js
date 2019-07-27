import EventEmitter from 'events';
import config from '../config';

let ws = null;
let isConnect = false;
const events = new EventEmitter();

const connect = idToken => {
  if (ws) {
    return;
  }

  isConnect = true;
  ws = new WebSocket(config.WEBSOCKET_API_URL, null, {
    headers: { Authorization: idToken },
  });

  ws.onopen = () => {
    console.debug('CONNECTED');
  };
  ws.onmessage = message => {
    if (!message || !message.data) {
      return;
    }
    try {
      const { event, data } = JSON.parse(message.data);
      console.debug('MESSAGE', event, data);
      events.emit(event, data);
    } catch (error) {
      console.error(error);
    }
  };

  ws.onerror = e => {
    console.error('ERROR', e.message);
  };

  ws.onclose = e => {
    ws = null;
    console.debug('CLOSED', e.code, e.reason);
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

export default Object.assign(events, { connect, disconnect, send });
