const ws = new WebSocket('wss://gem4rt4c0j.execute-api.us-east-1.amazonaws.com/Prod');

ws.onopen = () => {
  console.log('CONNECTED');
  ws.send(JSON.stringify({
    event: "CHOICE_MADE",
    choiceType: "CHOICE_COLOR",
    color: "COLOR_BLUE",
  }));
  console.log('MESSAGE SENT.');
};

ws.onmessage = (e) => {
  console.log('MESSAGE', e.data);
};

ws.onerror = (e) => {
  console.error('ERROR', e.message);
};

ws.onclose = (e) => {
  console.log('CLOSED', e.code, e.reason);
};

export default ws;
