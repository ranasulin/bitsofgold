let socketFunctionality = {
    io: {},
    connectSocket: function(server){
        this.io = require('socket.io').listen(server);
    },
    sendDecryptedResult: function(decryptions){
        console.log(JSON.stringify(decryptions));
        this.io.emit('successfulDecrypt', decryptions);
    }
};


module.exports = socketFunctionality;
