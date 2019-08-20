import EventEmitter from 'events';
import { WEBSOCKET_API_URL, WEBSOCKET_API_STUB } from 'react-native-dotenv';

let ws = null;
let isConnect = false;
const events = new EventEmitter();

const isStub = WEBSOCKET_API_STUB !== 'false';

const connect = idToken => {
  if (isStub) {
    const stageData = require('./stub').default;
    events.emit('EVENT_STAGE_CHANGED', stageData[WEBSOCKET_API_STUB]);
    return;
  } else if (ws) {
    return;
  }

  isConnect = true;
  ws = new WebSocket(`${WEBSOCKET_API_URL}?token=${idToken.split('.').pop()}`, null, {
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
  if (isStub) {
    console.log('SEND', message);
    return;
  } else if (!ws) {
    return false;
  }

  ws.send(JSON.stringify(message));
};

export default Object.assign(events, { connect, disconnect, send });
