(function($){

//Gebruik
// remainingHeightPercentage( [ $('.header-balk-activiteit') , $('.footer-balk-activiteit') , $('.titelblok-activiteit') ] ) 
var remainingHeightPercentage = function (arr, num) {

    if (typeof arr === undefined) return;
    numType = (num === undefined) ? 'pixel' : num;

    var windowTotal = $(window).outerHeight(),
        excluded = 0,
        included;

    if (typeof arr != "array") {
        $.each(arr, function (i, e) {
            excluded += e.outerHeight();
        });
    } else {
        excluded = arr.outerHeight();
    }

    try {
        if (numType == 'percentage') {
            included = 100 - (excluded / windowTotal * 100);
        } else if (numType == 'pixel') {
            included = windowTotal - excluded;
        } else {
        	throw console.log( "not in pixels or percentages" )
        }
    } catch (err) {
        console.log(err.message);
    }
    return included;
}

$(document).bind('pagechange' , function(){
	if ($.mobile.activePage.attr('id') == 'page-activiteit')
	{
		var contentHeight = Math.round(remainingHeightPercentage( [ $('.header-balk-activiteit') , $('.footer-balk-activiteit') , $('.titelblok-activiteit') ] ));
		$(".main").css({'height':contentHeight + 'px'});
		$("#map_canvas").css({'height':contentHeight + 'px'});

		GMap.init('map_canvas');
		//$(".header-knop-zoek").click(GMap.init('map_canvas'));
	}else if ($.mobile.activePage.attr('id') == 'page-locatie')
	{
		var contentHeight = Math.round(remainingHeightPercentage( [ $('.header-balk-locatie') , $('.footer-balk-locatie') , $('.titelblok-locatie') ] ));
		$(".main").css({'height':contentHeight + 'px'});
		$("#map-canvas-locatie").css({'height':contentHeight + 'px'});

		GMap.init('map-canvas-locatie');
		//$("#locatie-bevestig-knop").click(GMap.init('map-canvas-locatie'));
	}
});

/*
*	GOOGLE MAPS FUNCTIONS
*/
var GMap = {
	containerID: 'map_canvas',
	defaultLocation: new google.maps.LatLng(52.2167, 5.1333),
	defaultOptions: {
		zoom: 16,
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	},
	markers: [],
	markerTypes: [
	{ type:'current' , icon: 'images/pointer_icon.png' },
	{ type:'found' , icon: 'images/pointer_icon.png' },
	{ type:'evenement' , icon: 'images/pointer_icon.png' },
	{ type:'aanbieding' , icon: 'images/pointer_icon.png' },
	{ type:'melding' , icon: 'images/pointer_icon.png' }
	],

	init: function(mapID){
		this.clear();
		this.containerID = ( typeof mapID === 'string') ? mapID : 'map_canvas' ;
		this.setup();
	},
	setup: function(){
		this.map = new google.maps.Map(document.getElementById(this.containerID),
		this.defaultOptions);

		this.centerToDefault();

		google.maps.event.trigger(this.map, 'resize');
		this.map.setZoom( this.map.getZoom() );
		
		point = new google.maps.LatLng(52.2167, 5.1333);	
		marker = this.createMarker('#current','current',point,'<div id="markerTip"><a href="#page-detail" data-transition="slide" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c"  class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-hover-c ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Tooltip</span></span></a></div>')
	
	},
	clear: function(){
		$('#' + this.containerID).find("*").remove();
	},
	initGeo: function() {
		var self = this;
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				
				self.geoLocation = new google.maps.LatLng(position.coords.latitude, 
				position.coords.longitude);

				self.createMarker( '#marker-geo-location' , self.markerTypes[0] , this.geoLocation , '<p>Ik aanvaard geen halve maatpakken</p>' )
				self.centerToPoint( this.geoLocation );
				
			}, function () {
				self.handleNoGeolocation(true);
			});
		} else {
			// Browser doesn't support Geolocation
			self.handleNoGeolocation(false);
		}
	},
	handleNoGeo: function(error) {
		if(error){
			//'Error: De geolocotie-service is mislukt.';
			this.centerToDefault();
		}
		else{
			//'Error: Je browser ondersteund geen geolocation.';
		}
	},
	centerToDefault: function(){
		this.map.setCenter( this.defaultLocation );
	},
	centerToPoint: function( point ){
		if( arguments.length < 1 )return;

		try{
			var point = ( point instanceof google.maps.LatLng ) ? point : new new google.maps.LatLng( point[0] , point[1] );
			this.map.setCenter( point )
		}
		catch(err){
			console.log( err );
		}

	},
	createMarker: function( selector , type , point , html ) {
		var mdListener,
		selector = selector,
		type = type,
		point = point,
		html = html,
		self = this;

		marker = {
			selector: selector,
			content: html,
			point: ( point instanceof google.maps.LatLng ) ? point : new google.maps.LatLng(point[0], point[1]),
			type: type,
			marker: new google.maps.Marker({
				position: point,
				map: self.map,
				clickable: true
				//icon: type['icon'],
				//mouseDownListener: mdListener
			})
		};
		self.markers.push( marker );
		
		// Initialize marker mouse down listener && map mouse down listener
		self.markerMouseDown(type, html);
		self.markerDrag(type, html);
		self.mapMouseDown(type, html);
	},
	markerMouseDown: function (type, html){
		self = this;
		markerClick: google.maps.event.addListener(marker.marker, 'mousedown', function() { 
			latLng = this.getPosition(); // returns LatLng object
			this.map.panTo(latLng); // setCenter takes a LatLng object
			
			var contentString = html;
		
			// If it already exists - remove it before adding it
			self.removeMarker();
			
			// Only add a tooltip if the clicked marker is not the current location
			if(type != 'currentz'){
				$('#mapContainer').append(contentString);// Add tooltip
				$("#markerTip").css({'position':'absolute','left':Math.round($('#mapContainer').width()/2 - 50) + 'px','top':Math.round($('#mapContainer').height()/2 - 100) + 'px','z-index':'1001' });
			}
				
		});
	},
	markerDrag: function (type, html){ // Only works well on touch devices
		drag: google.maps.event.addListener(marker.marker, "mouseout", function() {
			// If a markerTip exists - remove it before adding it
			//self.removeMarker();
		});
	},
	mapMouseDown: function (){
		mapClick: google.maps.event.addListener(this.map, 'mousedown', function(event) {
			// If a markerTip exists - remove it before adding it
			self.removeMarker();
		});
	},
	removeMarker: function(){
		if ($("#markerTip").length > 0){
				$('#markerTip').remove(); 
		}
	}

}

})(jQuery)
