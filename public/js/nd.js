
var map;
var locationIcon = 'pointer_icon.png';

// Default location to be set if location can't be found
var utrecht = new google.maps.LatLng(52.2167, 5.1333);

// Locations for markings on the map - these normally should be obtained from a database
var point = new google.maps.LatLng(52.354425, 4.896241); // sarphatipark
var marker = createMarker('curLocation',point,'<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')

var point = new google.maps.LatLng(52.358566, 4.869689); // vondelpark	
var marker = createMarker('curLocation',point,'<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')

//initialize map
function initialize() {
	var myOptions = {
		zoom: 16,
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map($('#map_canvas'),
	myOptions);

	// Try HTML5 geolocation
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			var pos = new google.maps.LatLng(position.coords.latitude, 
			position.coords.longitude);
			
			var curLocation = pos;
			var marker = createMarker('curLocation',curLocation,'<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')
			
			
/*
			// Marker on the spot of your geolocation
			var locationMarker = new google.maps.Marker({
				position: pos,
				map: map,
				icon: locationIcon
			});
		
			// create current location
			var curLocation = pos;
			var marker = createMarker(point,'<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')
			
			// Add tooltip if a marker is clicked - map will center
			google.maps.event.addListener(geoMarker, "mousedown", function (e) {

				latLng = geoMarker.getPosition(); // returns LatLng object
				map.panTo(latLng); // setCenter takes a LatLng object
				
				// If it already exists - remove it before adding it
				if ($("#markerTip").length > 0){
					$('#markerTip').remove(); 
				}
				
				// Add tooltip
				$('#container').append('<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>');
				$("#markerTip").css({'position':'absolute','left':Math.round($('#container').width()/2 - 100) + 'px','top':Math.round($('#container').height()/2 - 100) + 'px' });
				// Click function for marker - only starts when marker is available
				$('#markerTip').click (function() {
					if ($("#markerTip").length > 0){
						$('#markerTip').remove(); 
					}
				});
				
			});
			
			
			
			// Marker for other locations // should be obtained from database - and a function
			var marker0 = new google.maps.Marker({
				position: sarphatipark,
				map: map,
				icon: iconImage
			});
			
			
			var marker1 = new google.maps.Marker({
				position: vondelpark,
				map: map,
				icon: iconImage
			});
*/			
			// Mousedown function on map - used to remove tooltips from markers
			google.maps.event.addListener(map, "mousedown", function (e) {
				// If markerTip exists - remove it before adding it
				if ($("#markerTip").length > 0){
					$('#markerTip').remove(); 
				}
			});

			

			map.setCenter(pos);
		}, function () {
			handleNoGeolocation(true);
		});
	} else {
		// Browser doesn't support Geolocation
		handleNoGeolocation(false);
	}
}

// ERROR HANDLING
function handleNoGeolocation(errorFlag) {
	if (errorFlag) {
		var content = 'Error: De geolocotie-service is mislukt.';
	} else {
		var content = 'Error: Je browser ondersteund geen geolocation.';
	}

	var options = {
		map: map,
		position: utrecht,
		content: content
	};
}

// Create all markers - and click functionality
function createMarker(markertype, latlng, html) {
	var contentString = html;
	// Check what kind of markerIcon the marker should have
	if(markertype == 'curLocation'){
		var iconType = locationIcon;
	}else{
		var iconType = locationIcon;
	}
	var marker = new google.maps.Marker({
		position: latlng,
		map: map,
		icon: iconType
	//zIndex: Math.round(latlng.lat()*-100000)<<5
	});
	
	// Marker mousedown - add and remove a tooltip
	google.maps.event.addListener(marker, 'mousedown', function() {
		latLng = marker.getPosition(); // returns LatLng object
		map.panTo(latLng); // setCenter takes a LatLng object
		
		// If it already exists - remove it before adding it
		if ($("#markerTip").length > 0){
			$('#markerTip').remove(); 
		}
		
		// Add tooltip
		$('#container').append(contentString);
		$("#markerTip").css({'position':'absolute','left':Math.round($('#container').width()/2 - 100) + 'px','top':Math.round($('#container').height()/2 - 100) + 'px' });
		// Click function for marker - only starts when marker is available
		$('#markerTip').click (function() {
			if ($("#markerTip").length > 0){
				$('#markerTip').remove(); 
			}
		});
	});
}

// initialize map
google.maps.event.addDomListener(window, 'load', initialize);