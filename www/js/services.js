angular.module('starter.services', [])

.factory('Token', function($window){

  return {
    get: function() {
      if($window.localStorage['jwtToken'])
        return $window.localStorage['jwtToken'];
      else 
        return null;
    },
    clearIt: function() {
      delete $window.localStorage['jwtToken'];
    },
    modify: function(newValue) {
      $window.localStorage['jwtToken'] = newValue;
    }
  }
})

.factory('Routes', function($http, Users) {
  var baseUrl = "https://blablacar.herokuapp.com";
  //var baseUrl = "http://localhost:3000";
  var suggestedRoutes = {};
  var participatedRoutes = {};
  return {
    all: function() {
      return $http.get(baseUrl + '/getAllRoutes');
    },
    suggest: function(startingCity, arrivalCity, date, heure, seats, rate) {
      return $http.post(baseUrl + '/addRoute', { startingCity: startingCity, arrivalCity: arrivalCity, date: date, heure:heure, idUser: Users.me().id, seats: seats, rate: rate });
    },
    get: function(startingCity, arrivalCity, date) {
      return $http.get(baseUrl + '/getRouteByCities/'+startingCity+'&'+arrivalCity+'&'+date);
    },
    updateRoutes: function(test) {
      if(test) {
        $http.get(baseUrl + '/getSuggestedRoutesByUser/'+Users.me().id).success(function(data, status) {
          suggestedRoutes = data;
        });

        $http.get(baseUrl + '/getParticipatedRoutes/'+Users.me().id).success(function(data, status) {
          participatedRoutes = data;
        });
      } else {
        suggestedRoutes = {};
        participatedRoutes = {};
      }
    },
    getSuggested: function() {
      console.log(suggestedRoutes);
      return suggestedRoutes;
    },
    getParticipated: function() {
      return participatedRoutes;
    },
    joinRoute: function(idRoute) {
      return $http.post(baseUrl + '/joinRoute', { idUser: Users.me().id, idRoute: idRoute });
    },
    unsubscribeRoute: function(idRoute) {
      return $http.post(baseUrl + '/unsubscribeRoute', { idUser: Users.me().id, idRoute: idRoute });
    }
  };
})

.factory('Users', ['$http', '$window',function($http, $window){
  var baseUrl = "https://blablacar.herokuapp.com";
  //var baseUrl = "http://localhost:3000";

  function urlBase64Decode(str) {
      var output = str.replace('-', '+').replace('_', '/');
      switch (output.length % 4) {
          case 0:
              break;
          case 2:
              output += '==';
              break;
          case 3:
              output += '=';
              break;
          default:
              throw 'Illegal base64url string!';
      }
      return window.atob(output);
  }

  function getUserFromToken() {
      var token = $window.localStorage['jwtToken'];
      var user = {};
      if (typeof token !== 'undefined') {
          var encoded = token.split('.')[1];
          user = JSON.parse(urlBase64Decode(encoded));
      }
      return user;
  }

  var currentUser = getUserFromToken();

  return {
      save: function(data, success, error) {
          $http.post(baseUrl + '/signin', data).success(success).error(error);
      },
      signin: function(data, success, error) {
          $http.post(baseUrl + '/authenticate', data).success(success).error(error);
      },
      modify: function(data, success, error) {
          $http.post(baseUrl + '/modify', data).success(success).error(error);
          currentUser = {};
      },
      me: function(success, error) {
          if(Object.getOwnPropertyNames(currentUser).length === 0 || !currentUser)
            currentUser = getUserFromToken();
          return currentUser;
      },
      logout: function(success) {
          delete $window.localStorage['jwtToken'];
          currentUser = getUserFromToken();
          success();
      },
      deleteUser: function(success, error) {
        $http.delete(baseUrl + '/deleteUser').success(success).error(error);
        //delete $window.localStorage['jwtToken'];
        currentUser = getUserFromToken();
      },
      getUserDetails: function(idUser) {
        return $http.get(baseUrl + '/getUser/'+idUser);
      }
  };
}])

.factory('Camera', ['$q', function($q) {
 
  return {
    getPicture: function(options) {
      var q = $q.defer();
      
      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);
      
      return q.promise;
    }
  }
}])
