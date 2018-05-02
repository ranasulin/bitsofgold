// App
const app = angular.module('app', ['btford.socket-io'])

    .factory('clientSocketManager', function (socketFactory) {
        return socketFactory({
            ioSocket: io.connect('http://localhost:3000')
        });
    });