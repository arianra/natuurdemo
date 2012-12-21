//Gebruik
// reminaingHeightPercentage( [ $('.header-balk-activiteit') , $('.footer-balk-activiteit') , $('.titelblok-activiteit') ] ) 
var reminaingHeightPercentage = function( arr , num = 'pixel' ){
	if(typeof arr === undefined) return;


	var windowTotal = $(window).outerHeight(), 
	excluded = 0,
	included;

	if(typeof arr != "array"){
		$.each( arr , function(i,e){
		excluded += e.outerHeight();
		});
	}
	else
	{
		excluded = arr.outerHeight();
	}

	try {
		if( numType == 'percentage' ){
		included = 100 - ( excluded / windowTotal * 100) ;
		}
		else( numType == 'pixel' ){
		included = windowTotal - excluded;	
		}
	}
	catch(err)
	{
		console.log( err.message );
	}
	return included;
}

$(document).bind('pagechange' , function(){
	if ($.mobile.activePage.attr('id') == 'pageActiviteit')
	{
		var iets = reminaingHeightPercentage( [ $('.header-balk-activiteit') , $('.footer-balk-activiteit') , $('.titelblok-activiteit') ] );
		console.log( iets )
	}
});

// Map vars - initialized and later populated
var map;
var point;
var marker;

// Vars to point to location of images
var locationIcon = 'images/pointer_icon.png';

// Default location to be set if location can't be found
var utrecht = new google.maps.LatLng(52.2167, 5.1333);

//initialize map
function initialize() {
	// Map options
	var myOptions = {
		zoom: 16,
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	map = new google.maps.Map(document.getElementById('map_canvas'),
	myOptions);
	
	// Locations for markings on the map - these normally should be obtained from a database
	point = new google.maps.LatLng(52.354425, 4.896241); // sarphatipark
	marker = createMarker('point',point,'<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')

	point = new google.maps.LatLng(52.358566, 4.869689); // vondelpark	
	marker = createMarker('point',point,'<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')

	// Try HTML5 geolocation - All in this statement is only performed when geolocation is found
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			var pos = new google.maps.LatLng(position.coords.latitude, 
			position.coords.longitude);
			
			// Show current position on map - must stay in geolocation function
			curLocation = pos;
			marker = createMarker('curLocation',curLocation,'Leave this - does not do anything - but function expects an extra argument')
		
			// Mousedown function on map - used to remove tooltips from markers
			google.maps.event.addListener(map, "mousedown", function (e) {
				// If markerTip exists - remove it before adding it
				if ($("#markerTip").length > 0){
					$('#markerTip').remove(); 
				}
			});
			
			// Center the map on current location
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

	marker = new google.maps.Marker({
		position: latlng,
		map: map,
		icon: iconType
	});
	
	// Marker mousedown - add and remove a tooltip
	google.maps.event.addListener(marker, 'mousedown', function() { console.log('mousedown');
		latLng = this.getPosition(); // returns LatLng object
		map.panTo(latLng); // setCenter takes a LatLng object
		
		// If it already exists - remove it before adding it
		if ($("#markerTip").length > 0){
			$('#markerTip').remove(); 
		}
		
		// Only add a tooltip if the clicked marker is not the current location
		if(markertype !=  'curLocation'){
			// Add tooltip
			$('.ui-content').append(contentString);
			$("#markerTip").css({'position':'absolute','left':Math.round($('.ui-content').width()/2 - 100) + 'px','top':Math.round($('.ui-content').height()/2 - 100) + 'px','z-index':'1000' });
			// Click function for marker - only starts when marker is available
			$('#markerTip').click (function() {
				if ($("#markerTip").length > 0){
					$('#markerTip').remove(); 
				}
			});
		}
	});
}

// initialize map
google.maps.event.addDomListener(window, 'load', initialize);
