app.factory('MainPageManager', ['$http',($http) => {
    return {
        crackPassword : (encryptedText, keySize)=> {
            return $http({
                timeout: 1200000,
                url: '/crackPassword',
                method: "GET",
                params: {text: encryptedText, keySize: keySize}
            });
        }
    }
}]);