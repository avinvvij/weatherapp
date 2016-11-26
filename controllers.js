var weatherApp = angular.module('weatherApp', ['ngMaterial' , 'ngRoute']);
var controllers = {};


weatherApp.config(function($routeProvider , $mdThemingProvider) {
	$mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('teal');

    $routeProvider.when('/', {
    	templateUrl: 'weatherview.html',
    	controller: 'citycontroller'
    });

    $routeProvider.otherwise({redirectTo: '/'});
});


controllers.citycontroller = function($scope, $rootScope , $http){

	$rootScope.progresshidden = false;
	$rootScope.circularprogress = false;

	$scope.getcity = function(){
		$rootScope.circularprogress = true;
		$http.get("http://gd.geobytes.com/AutoCompleteCity?q="+$scope.city+"&filter=IN").then(function(response){
			$rootScope.circularprogress = false;
			$scope.cities = response.data;
		});
	}

	$scope.getlatlng = function(city){
			$scope.scopecity = city;
		    $http.get("http://maps.googleapis.com/maps/api/geocode/json?address="+city+"&sensor=false").then(function(response){
			$scope.lat = response.data.results[0].geometry.location.lat;
			$scope.lng = response.data.results[0].geometry.location.lng;
			$scope.getweather($scope.lat , $scope.lng);
		});
	}

	$scope.getweather = function(latitude,longitude){
		$rootScope.progresshidden = true;
		$rootScope.fontcolor = "black";	
		$http.get("https://api.darksky.net/forecast/5f0242b07ca21439da6d1335a945ac0d/"+latitude+","+longitude).
		then(function(response){
			$rootScope.progresshidden = false;
			$scope.temprature = response.data.currently.temperature;
			$scope.timezone = response.data.timezone;
			$scope.humidity = response.data.currently.humidity;
			$scope.windspeed = response.data.currently.windSpeed;
			var icon = response.data.currently.icon;
			if(icon == "clear-day")
				$scope.icoimg = "http://www.zastavki.com/pictures/originals/2014/Nature___Seasons___Spring_Clear_day_in_spring_field_067763_.jpg";
			else if(icon=="clear-night"){
				$scope.icoimg = "http://orig11.deviantart.net/81b0/f/2013/353/5/b/on_a_clear_night_sky__background__by_oakfur422-d6yl3xc.png";
				$rootScope.fontcolor = "white";
			}else if(icon=="rain")
				$scope.icoimg = "http://il8.picdn.net/shutterstock/videos/7770643/thumb/1.jpg";
			else if(icon=="snow")
				$scope.icoimg = "https://image.freepik.com/free-photo/christmas-background-with-snow_1048-3135.jpg";
			else if(icon=="sleet")
				$scope.icoimg = "http://www.abccolumbia.com/wp-content/uploads/2016/01/Image4.jpg";
			else if(icon=="wind")
				$scope.icoimg = "https://image.freepik.com/free-vector/wind-turbine-on-a-landscape-background_1048-456.jpg";
			else if(icon=="fog")
				$scope.icoimg = "http://cdn.wallpapersafari.com/77/1/iOh6zU.jpg";
			else if(icon=="cloudy")
				$scope.icoimg = "http://wallpapercave.com/wp/xGXiVFz.png";
			else if(icon=="partly-cloudy-day")
				$scope.icoimg = "http://www.weather.polischrysochous.net/images/day/partlycloudy.jpg";
			
		});

	}
}

controllers.drawercontroller = function($scope,$mdSidenav){
	$scope.opendrawer = function(){
		$mdSidenav('left').toggle();
	}
}

weatherApp.controller(controllers);