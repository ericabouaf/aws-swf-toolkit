// TODO: REP socket which connects to the activity poller REQ socket 

var zeromq = require('zmq')
    , port = 'tcp://127.0.0.1:12345';

var socket = zeromq.socket('pull');

socket.identity = 'hello-' + process.pid;

socket.connect(port);

console.log('connected!');

socket.on('message', function(data) {
  
  console.log(socket.identity + ': received ' + data.toString());
  
});

