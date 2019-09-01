import EventEmitter from 'events';
import { Auth } from 'aws-amplify';

let ws = null;
let isConnect = false;
const emitter = new EventEmitter();

if (process.env.REACT_APP_WEBSOCKET_EMITTER_EXPOSE === 'true') {
  window.emitter = emitter;
}

const connect = async () => {
  isConnect = true;

  if (process.env.REACT_APP_WEBSOCKET_API_STUB === 'true') {
    return;
  }

  if (ws) {
    return;
  }

  const idToken = (await Auth.currentSession()).getIdToken().getJwtToken();
  ws = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_API_URL}?token=${idToken}`);

  ws.onopen = () => {
    console.log('CONNECTED');
  };

  ws.onmessage = message => {
    const { data: messageData } = message || {};
    if (!messageData) {
      return;
    }
    try {
      let { event, data, ...eventData } = JSON.parse(messageData);
      if (!event) {
        event = 'CHOICE_MADE';
      }
      emitter.emit(event, { ...data, ...eventData });
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

export default Object.assign(emitter, { connect, disconnect });
