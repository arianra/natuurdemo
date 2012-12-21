//Gebruik
// remainingHeightPercentage( [ $('.header-balk-activiteit') , $('.footer-balk-activiteit') ] ) 
var remainingHeightPercentage = function( arr , num ){
	
	if(typeof arr === undefined) return;
	numType = ( num === undefined ) ? 'pixel' : num;

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
		else{
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
		//Knoei FIX
	var contentHeight = Math.round(remainingHeightPercentage( [ $('.ui-header') , $('.ui-footer')]));
		console.log( contentHeight );
		//$(".main").css({'height':contentHeight + 'px'});
		$("#map_canvas").css({'height':contentHeight + 'px'});
		//Knoei FIX

	if ($.mobile.activePage.attr('id') == 'pageActiviteit')
	{
		var contentHeight = Math.round(remainingHeightPercentage( [ $('.header-balk-activiteit') , $('.footer-balk-activiteit') ]));
		console.log( contentHeight );
		$(".main").css({'height':contentHeight + 'px'});
		$("#map_canvas").css({'height':contentHeight + 'px'});
	}
});


// Map vars - initialized and later populated
var map;
var point;
var marker;
var markersArray = [];

// Vars to point to location of images
var locationIcon = '../public/images/pointer_icon.png';
 
// Default location to be set if location can't be found
var utrecht = new google.maps.LatLng(52.033266, 5.429692); // utrechtse heuvelrug

//initialize map
function initialize() {
	// Map options
	var myOptions = {
		zoom: 16,
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	// Set original map
	map = new google.maps.Map(document.getElementById('map_canvas'),
	myOptions);
	
	// Locations for markings on the map - these normally should be obtained from a database
	point = new google.maps.LatLng(52.354425, 4.896241); // sarphatipark
	marker = createMarker('point',point,'<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')

	point = new google.maps.LatLng(52.358566, 4.869689); // vondelpark	
	marker = createMarker('point',point,'<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')
	
	// LOCATIES UTRECHTSE HEUVELRUG DEMO
	point = new google.maps.LatLng(52.03479225466794, 5.427267551422119);	
	marker = createMarker('point',point,'<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')
	
	point = new google.maps.LatLng(52.0348054550579, 5.429971218109131);
	marker = createMarker('point',point,'<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')
	
	point = new google.maps.LatLng(52.034171831943716, 5.432460308074951);
	marker = createMarker('point',point,'<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')
	
	point = new google.maps.LatLng(52.03318177785052, 5.4264092445373535);	
	marker = createMarker('point',point,'<div id="markerTip"><a href="#popupInfo" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')
	
	
	
	// Try HTML5 geolocation - All in this statement is only performed when geolocation is found
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			var pos = new google.maps.LatLng(position.coords.latitude, 
			position.coords.longitude);
			
			// Show current position on map - must stay in geolocation function
			curLocation = pos;
			locationMarker = createMarker('curLocation',curLocation,'empty argumenr')
			
			// Mousedown function on map - used to remove tooltips from markers
			google.maps.event.addListener(map, "mousedown", function (e) {
			//gotoLocation();
			markersArray[6].setMap(null);
				// If markerTip exists - remove it before adding it
				if ($("#markerTip").length > 0){
					$('#markerTip').remove(); 
				}
			});
			
			// Center the map on current location
			map.panTo(pos);
			
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
		//'Error: De geolocotie-service is mislukt.';
		map.panTo(utrecht);
	} else {
		//'Error: Je browser ondersteund geen geolocation.';
		map.panTo(utrecht);
	}

}

// Create all markers - and click functionality
function createMarker(markertype, latlng, html) {
console.log('marker?');
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
	markersArray.push(marker);
	
	// Marker mousedown - add and remove a tooltip
	google.maps.event.addListener(marker, 'mousedown', function() { console.log('mousedown');
		latLng = this.getPosition(); // returns LatLng object
		map.panTo(latLng); // setCenter takes a LatLng object
		
		// If it already exists - remove it before adding it
		if ($("#markerTip").length > 0){
			$('#markerTip').remove(); 
		}
		
		// Only add a tooltip if the clicked marker is not the current location
		if(markertype != 'curLocation'){
			// Add tooltip
			$('.main').append(contentString);
			$("#markerTip").css({'position':'absolute','left':Math.round($('.main').width()/2 - 100) + 'px','top':Math.round($('.main').height()/2 - 100) + 'px','z-index':'1000' });
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

// Goes to another location and adds markers 
function gotoLocation() {		
	marker = createMarker('curLocation',utrecht,'empty argument');
	//zoomInOut(map, 10, map.getZoom()); // call smoothZoom, parameters map, final zoomLevel, and starting zoom level
	map.panBy($(window).outerWidth()/2,0);
	setTimeout(function(){map.panTo(utrecht); map.panTo}, 300);
}



