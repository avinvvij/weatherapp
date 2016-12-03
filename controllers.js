var weatherApp = angular.module('weatherApp', ['ngMaterial' , 'ngRoute' ,'chart.js']);
var controllers = {};


weatherApp.config(function($routeProvider , $mdThemingProvider) {
	$mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('teal');

    $routeProvider.when('/', {
    	templateUrl: 'weatherview.html',
    	controller: 'citycontroller'
    });
    
    $routeProvider.when('/map',{
    	templateUrl: 'mapview.html',
    	controller: 'citycontroller',
    	resolve:{
    		init: function(){
    			return function(){
    				alert('loading map here');
    			}
    		}
    	}
    });

    $routeProvider.otherwise({redirectTo: '/'});
});


weatherApp.factory('latlngfactory', function(){
	var factory = {};
	var flat;
	var flng;
	factory.setlatlng = function(faclat , faclng){
		flat = faclat;
		flng = faclng;
	}

	factory.getlat = function(){
		return flat;
	}

	factory.getlng = function(){
		return flng;
	}

	return factory;
})

controllers.citycontroller = function(latlngfactory, $scope, $rootScope , $http ,$location){

	$rootScope.progresshidden = false;
	$rootScope.circularprogress = false;

	$scope.init = function(){
		if(latlngfactory.getlat() === undefined && latlngfactory.getlng() === undefined)
		{

		}else{
		  $scope.getweather(latlngfactory.getlat() , latlngfactory.getlng());
		}
	} 
	
	$scope.getcity = function(){
		$rootScope.circularprogress = true;
		$http.jsonp("http://gd.geobytes.com/AutoCompleteCity?q="+$scope.city+"&callback=JSON_CALLBACK")
		.success(function(data){
			$rootScope.circularprogress = false;
			$scope.cities=data;
		});
	}

	$scope.getlatlng = function(city){
			$rootScope.scopecity = city;
		    $http.get("http://maps.googleapis.com/maps/api/geocode/json?address="+city+"&sensor=false").then(function(response){
			$scope.lat = response.data.results[0].geometry.location.lat;
			$scope.lng = response.data.results[0].geometry.location.lng;
			$scope.getweather($scope.lat , $scope.lng);
		});
	}

	$scope.loadmap = function(){
		var mymap = L.map('mapid').setView([18.5204, 73.8567], 13);
		L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXZpbnZ2aWoiLCJhIjoiY2l3NGhmeDdyMDA3NTJ6bDVjaWFvZWRzayJ9.Gc7Gc9USClhWJCaC3yqRcQ', {
	    attribution: 'weatherApp Map',
	    maxZoom: 18,
	    accessToken: 'pk.eyJ1IjoiYXZpbnZ2aWoiLCJhIjoiY2l3NGhmeDdyMDA3NTJ6bDVjaWFvZWRzayJ9.Gc7Gc9USClhWJCaC3yqRcQ'
	}).addTo(mymap);
	var marker = L.marker([18.5204, 73.8567]).addTo(mymap);

	function ifmapclicked(e){
		//alert('you clicked at '+e.latlng);
		mymap.removeLayer(marker);
		marker = L.marker(e.latlng).addTo(mymap);
		marker.bindPopup("you clicked at "+e.latlng).openPopup();
		var latitude = e.latlng.lat;
		var longitude = e.latlng.lng;
		$scope.getweather(latitude , longitude);
		latlngfactory.setlatlng(latitude , longitude);
		$scope.getcitybylatlng(latitude , longitude);
		$location.path("http://localhost:8090/weatherapp/parsing.html#/");
	}
	mymap.on('click', ifmapclicked);
	
	}



    $scope.getcitybylatlng = function(clat , clng){
    	$http.get("http://maps.googleapis.com/maps/api/geocode/json?latlng="+clat+","+clng+"&sensor=true")
    	.then(function(response){
    		$rootScope.scopecity = response.data.results[0].formatted_address;
    	});
    }

	
	$scope.getweather = function(latitude,longitude){
		$rootScope.progresshidden = true;
		$rootScope.fontcolor = "black";	
		

		$http.jsonp("https://api.darksky.net/forecast/5f0242b07ca21439da6d1335a945ac0d/"+latitude+","+longitude+"?callback=JSON_CALLBACK")
		.success(function(data){
			$rootScope.progresshidden = false;
			var temp = data.currently.temperature -32;
			temp = temp * (5.0 / 9.0);
			temp = temp.toPrecision(6);
			$rootScope.temprature = temp+" \u00B0 C";
			$rootScope.timezone = data.timezone;
			$rootScope.humidity = data.currently.humidity;
			$rootScope.windspeed = data.currently.windSpeed;
			$rootScope.dewpoint = data.currently.dewPoint;
			$rootScope.pressure = data.currently.pressure;
			var dailydata = data.daily.data;
			var label = [];
			var value = []; 
			for(var i=0 ; i<dailydata.length ; i++)
			{

				var d = dailydata[i].time;
				var date = new Date(d*1000);
				//console.log(date);
				var month = date.getMonth()+1;
				label.push(date.getDate()+"/"+month);
				var temp1 = dailydata[i].temperatureMax -32;
				temp1 = temp1 * (5.0 / 9.0);
				temp1 = temp1.toPrecision(6);
				value.push(temp1);
			}
			$rootScope.labels = label;
			$rootScope.values = value;
			var icon = data.currently.icon;
			if(icon == "clear-day")
				$rootScope.icoimg = "http://www.zastavki.com/pictures/originals/2014/Nature___Seasons___Spring_Clear_day_in_spring_field_067763_.jpg";
			else if(icon=="clear-night"){
				$rootScope.icoimg = "http://orig11.deviantart.net/81b0/f/2013/353/5/b/on_a_clear_night_sky__background__by_oakfur422-d6yl3xc.png";
				$rootScope.fontcolor = "white";
			}else if(icon=="rain")
				$rootScope.icoimg = "http://il8.picdn.net/shutterstock/videos/7770643/thumb/1.jpg";
			else if(icon=="snow")
				$rootScope.icoimg = "https://image.freepik.com/free-photo/christmas-background-with-snow_1048-3135.jpg";
			else if(icon=="sleet")
				$rootScope.icoimg = "http://www.abccolumbia.com/wp-content/uploads/2016/01/Image4.jpg";
			else if(icon=="wind")
				$rootScope.icoimg = "https://image.freepik.com/free-vector/wind-turbine-on-a-landscape-background_1048-456.jpg";
			else if(icon=="fog")
				$rootScope.icoimg = "http://cdn.wallpapersafari.com/77/1/iOh6zU.jpg";
			else if(icon=="cloudy")
				$rootScope.icoimg = "http://wallpapercave.com/wp/xGXiVFz.png";
			else if(icon=="partly-cloudy-day")
				$rootScope.icoimg = "http://www.weather.polischrysochous.net/images/day/partlycloudy.jpg";
			else if(icon=="partly-cloudy-night"){
				$rootScope.icoimg = "http://cdn.wallpapersafari.com/86/40/NShrsK.jpg";
				$rootScope.fontcolor = "white";
			}

		});




		//$http.get("https://api.darksky.net/forecast/5f0242b07ca21439da6d1335a945ac0d/"+latitude+","+longitude).
		//then(function(response){
		//	
			
		//});

	}
}

controllers.drawercontroller = function($scope,$mdSidenav){
	$scope.opendrawer = function(){
		$mdSidenav('left').toggle();
	}
}

weatherApp.controller(controllers);