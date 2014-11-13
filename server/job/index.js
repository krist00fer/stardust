var socket = require('socket.io-client')('http://localhost:3000');
  socket.on('connect', function(){
console.log('job server connected');

    socket.emit('message',Math.round(random(0,99)));

    socket.on('message', function(data){
        console.log(data);
    });

    socket.on('disconnect', function(){
	console.log('disconnection happened...');
    });
});

function random (low, high) {
    return Math.random() * (high - low) + low;
}