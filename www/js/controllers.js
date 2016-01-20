angular.module('starter.controllers', ['ngAutocomplete'])

.controller('HomeCtrl', ['$rootScope', '$scope', '$location', '$window', 'Users', 'Token', 'Routes', 'Camera', function($rootScope, $scope, $location, $window, Users, Token, Routes, Camera) {
	
	$scope.modifyUser = false;

	$scope.newUser = false;

	$scope.meDetails = (Users.me() === undefined) ? {} : Users.me();

	$scope.token = Token.get();

	$scope.auth = {
		email:'',
		password:''
	};

	$scope.authNew = {
		email:'',
		password:'',
		password2: '',
		pseudo: ''
	};

	$scope.modifyNew = {
		email: $scope.meDetails.email,
		password:'',
		password2: '',
		pseudo: $scope.meDetails.pseudo,
		bio: $scope.meDetails.bio
	};

	$scope.newUserForm = function(choice) {
		$scope.newUser = choice;
	};

	$scope.modifyUserForm = function(choice) {
		$scope.modifyUser = choice;
	};

    $scope.signin = function() {

        var formData = {
            email: $scope.auth.email,
            password: $scope.auth.password
        }

        if($scope.auth.email == '' || $scope.auth.password == '') {
        	alert('Email and password required !');
        	if($scope.auth.email == '')
        		
        	if($scope.auth.password == '')

        	return;
        }

        Users.signin(formData, function(res) {
            if (res.type == false) {
                alert(res.data);
            } else {
            	$scope.auth.email = '';
            	$scope.auth.password = '';
                Token.modify(res);
                $scope.token = Token.get();
                $scope.meDetails = Users.me();
                Routes.updateRoutes(true);
                window.location = "#/tab/account";    
            }
        }, function() {
        	console.log("fail");
            $rootScope.error = 'Failed to signin';
            window.location = "#/tab/account";
        })
    };
 
    $scope.signup = function() {
        var formData = {
            email: $scope.authNew.email,
            password: $scope.authNew.password,
            pseudo: $scope.authNew.pseudo
        }

        Users.save(formData, function(res) {
            if (res.type == false) {
                alert(res.data)
            } else {
            	Token.modify(res);
            	$scope.token = Token.get();
            	$scope.newUserForm(false);

            	$scope.meDetails = Users.me();

                window.location = "#/tab/account";
            }
        }, function() {
            $rootScope.error = 'Failed to signup';
        })
    };

    $scope.takePhoto = function() {
    	$scope.getPhoto = function() {
	    	console.log('Getting camera');
	    	Camera.getPicture({
		    	quality: 75,
		     	targetWidth: 320,
		      	targetHeight: 320,
		      	saveToPhotoAlbum: false
		    }).then(function(imageURI) {
		      	console.log(imageURI);
		     	 $scope.meDetails = imageURI;
		    }, function(err) {
		     	 console.err(err);
			});
	  	}
    }

    $scope.modify = function() {
    	var modifyUserData = {
    		email: $scope.modifyNew.email,
    		pseudo: $scope.modifyNew.pseudo,
    		bio: $scope.modifyNew.bio,
    		password: $scope.modifyNew.password,
    		oldEmail: $scope.meDetails.email
    	}

    	Users.modify(modifyUserData, function(res) {
            if (res.type == false) {
                alert(res.data)
            } else {
            	Token.modify(res);
            	$scope.token = Token.get();
            	$scope.modifyUserForm(false);

            	$scope.meDetails = Users.me();

                window.location = "#/tab/account";
            }
        }, function() {
            $rootScope.error = 'Failed to modify your personnal informations !';
        })
    };

    $scope.logout = function() {
        Users.logout(function() {
			delete $scope.token;
			Token.clearIt();
			Routes.updateRoutes(false);
            window.location = "#/tab/account"
        }, function() {
            alert("Failed to logout!");
        });
    };

    $scope.deleteUser = function() {
    	Users.deleteUser(function() {
    		delete $scope.token;
			Token.clearIt();
			Routes.updateRoutes(false);
			window.location = "#/tab/account";
			$scope.modifyUserForm(false);
    	}, function() {
            alert("Failed to delete account!");
        });
        
    };
}])

.controller('SearchCtrl', function($scope, Routes, Users) {
	$scope.search = {
		startingCity:'',
		arrivalCity:'',
		date:null,
		returnDate:null
	};

	$scope.userDetails = {};

	$scope.viewUser = false;

	$scope.routesResults = [];

	$scope.joinTrue = false;
	
    $scope.options = {
      country: 'fr',
      types: '(cities)'
    };

    $scope.checkbox = {
    	check: false
    };

    $scope.goToOwnRoutes = function() {
    	window.location = "#/routes";
    };

    $scope.toggleGroup = function(route) {
    	if ($scope.isGroupShown(route)) {
      		$scope.shownRoute = null;
    	} else {
      		$scope.shownRoute = route;
    	}
  	};

	$scope.isGroupShown = function(route) {
		return $scope.shownRoute === route;
	};

	$scope.showUser = function(idUser) {
		Users.getUserDetails(idUser).success(function(data) {
			$scope.userDetails = data;
		});
		$scope.viewUser = true;
	};

	$scope.hideUserDetails = function() {
		$scope.viewUser = false;
		$scope.userDetails = {};
	};
    
	//CHECK IF BROWSER HAS HTML5 GEO LOCATION
	$scope.geoloc = function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
		
				//GET USER CURRENT LOCATION
				var locCurrent = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({ 'latLng': locCurrent }, function (results, status) {
					var locItemCount = results.length;
					var locCountryNameCount = locItemCount - 1;
					var locCountryName = results[1].formatted_address;		
					$scope.search.startingCity = locCountryName;
					$scope.$apply();
				});
			})
		}
	};

	$scope.launchSearch = function() {
		$scope.routesResults = {};
		$scope.routesReturnResults = {};
		console.log($scope.search.date);
		Routes.get($scope.search.startingCity, $scope.search.arrivalCity, $scope.search.date).success(function(data, status) {
			$scope.routesResults = data;
			// $scope.routesResults.forEach(function(part, index, theArray) {
			// 	theArray[index].date = new Date(theArray[index].date).toUTCString();
			// });
		});
		if($scope.checkbox.check) {
			Routes.get($scope.search.arrivalCity ,$scope.search.startingCity, $scope.search.returnDate).success(function(data, status) {
				$scope.routesReturnResults = data;
			});
		}
	};

	$scope.searchAll = function() {
		$scope.routesResults = {};
		Routes.all().success(function(data, status) {
			$scope.routesResults = data;
		});
	};

	$scope.joinRoute = function(routeId) {
		console.log(routeId);
		Routes.joinRoute(routeId).success(function(data, status) {
			console.log(status);
			//$scope.joinTrue = true;
		})
		.error(function(err) {
			console.log(err);
		});
	};
})

.filter('groupByMonthYear', function($parse) {
    var dividers = {};

    return function(input) {
        if (!input || !input.length) return;

        var output = [], 
            previousDate, 
            currentDate;

        for (var i = 0, ii = input.length; i < ii && (route = input[i]); i++) {
            currentDate = moment(route.date);
            //if (!previousDate || currentDate.month() != previousDate.month() || currentDate.year() != previousDate.year()) {
            if (!previousDate || currentDate.day() != previousDate.day() || currentDate.month() != previousDate.month()) {
                // var dividerId = currentDate.format('MMYYYY');
                var dividerId = currentDate.format('ddddDDMM');
                if (!dividers[dividerId]) {
                    dividers[dividerId] = {
                        isDivider: true,
                        // divider: currentDate.format('MMMM YYYY')
                        divider: currentDate.format('dddd DD MMMM')
                    };
                }
                output.push(dividers[dividerId]);               
            }

            output.push(route);
            previousDate = currentDate;
        }

        return output;
    };
})

.directive('dividerCollectionRepeat', function($parse) {
    return {
        priority: 1001,
        compile: compile
    };

    function compile (element, attr) {
        var height = attr.itemHeight || '120';
        attr.$set('itemHeight', 'route.isDivider ? 37 : ' + height);

        element.children()[0].setAttribute('ng-hide', 'route.isDivider');
        element.prepend(
            '<div class="item item-divider ng-hide" ng-show="route.isDivider" ng-bind="route.divider"></div>'
        );
    }
})

.controller('RoutesCtrl', function($scope, Routes, Token, $window) {
	$scope.token = Token;

	$scope.routes = Routes;

	$scope.unsubscribe = function(routeItem) {
		Routes.unsubscribeRoute(routeItem.id).success(function(data, status) {
			// $scope.participatedRoutes.splice($scope.participatedRoutes.indexOf(routeItem), 1);
			Routes.updateRoutes(true);
			window.location = "#/tab/routes";
		});
	}

	$scope.redirectLogin = function() {
		window.location = "#/tab/account";
	};
})

.controller('SuggestCtrl', function($scope, $window, $ionicModal, Routes, Token) {
	$scope.checkBox = {
		roundTrip: false
	};

	$scope.suggest = {
		startingCity:'',
		arrivalCity:'',
		date:'',
		returnDate:'',
		hour:'',
		returnHour:'',
		seats:'',
		rate:''
	};
	
    $scope.options = {
      country: 'fr',
      types: '(cities)'
    };

    $ionicModal.fromTemplateUrl('templates/modal.html', {
	    scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.redirectLogin = function() {
		$scope.modal.hide();
		window.location = "#/tab/account";
	};
    
	//CHECK IF BROWSER HAS HTML5 GEO LOCATION
	$scope.geoloc = function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
		
				//GET USER CURRENT LOCATION
				var locCurrent = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({ 'latLng': locCurrent }, function (results, status) {
					var locItemCount = results.length;
					var locCountryNameCount = locItemCount - 1;
					var locCountryName = results[1].formatted_address;		
					$scope.suggest.startingCity = locCountryName;
					$scope.$apply();
				});
			})
		}
	};

	$scope.submitSuggest = function() {
		if(typeof $window.localStorage['jwtToken'] == 'undefined') {
			$scope.modal.show();
			return;
		}
		if($scope.checkBox.roundTrip) {
			if($scope.suggest.returnDate != '' &&  $scope.suggest.returnHour != '') {
				Routes.suggest($scope.suggest.arrivalCity, $scope.suggest.startingCity, $scope.suggest.returnDate, $scope.suggest.returnHour, $scope.suggest.seats, $scope.suggest.rate).success(function(data, status) {
		        	console.log(status);
				});
			} else {
				alert("All fields are required !");
				return;
			}
		}
		if($scope.suggest.startingCity != '' && $scope.suggest.arrivalCity != '' && $scope.suggest.date != '' && $scope.suggest.hour != '') {
			Routes.suggest($scope.suggest.startingCity, $scope.suggest.arrivalCity, $scope.suggest.date, $scope.suggest.hour, $scope.suggest.seats, $scope.suggest.rate).success(function(data, status) {
	        	console.log(status);
			});
		}
		else {
			alert("All fields are required !");
			return;
		}
	};
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
	
})