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

	if($.mobile.activePage.attr('id') == 'page-locatie')
	{
		var contentHeight = Math.round(remainingHeightPercentage( [ $('.header-balk-locatie') , $('.titelblok-locatie') , $('.bevestig-div-locatie') ] ));
		$("#map-canvas-locatie").css({'height':contentHeight + 'px'});
		GMap.init( 'map-canvas-locatie' );
				GMap.runGeoPage();
		//GMap.clickToPositionLocation( true );

		$( '.header-knop-zoek' ).on( 'click' , function(){ GMap.init('map-canvas-locatie'); } )
	}
	else if ($.mobile.activePage.attr('id') == 'page-activiteit')
	{
		var contentHeight = Math.round(remainingHeightPercentage( [ $('.header-balk-activiteit') , $('.footer-balk-activiteit') , $('.titelblok-activiteit') ] ));
		$("#map-canvas-activiteit").css({'height':contentHeight + 'px'});
		GMap.init( 'map-canvas-activiteit' );
		$( '.header-knop-zoek' ).on( 'click' , function(){ GMap.init('map-canvas-activiteit'); } )
	}
	else if ($.mobile.activePage.attr('id') == 'page-route')
	{
		var contentHeight = Math.round(remainingHeightPercentage( [ $('.header-balk-route') , $('.footer-balk-route')  , $('.titelblok-route') ] ));
		$("#map-canvas-route").css({'height':contentHeight + 'px'});
		GMap.init( 'map-canvas-route' );

		$( '.header-knop-zoek' ).on( 'click' , function(){ GMap.init('map-canvas-route'); } )

	}

});

$( document ).on('click' , '[ data-role="navbar" ] a' ,function(){  


//		if( !$(event.target).parent().parent().hasClass( 'ui-btn-active' ) )  $(event.target).parent().parent().addClass( 'ui-btn-active' );


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
	allMarkers: [],
	markerTypes: [
	{ type:'current' , icon: 'images/pointer_icon.png' , popup: 'current' },
	{ type:'found' , icon: 'images/pointer_icon.png' , popup: 'full' },
	{ type:'evenement' , icon: 'images/pointer_icon.png' , popup: 'detail' },
	{ type:'aanbieding' , icon: 'images/pointer_icon.png' , popup: 'detail' },
	{ type:'melding' , icon: 'images/pointer_icon.png' , popup: 'detail' }
	],
	popupContent: {
		current: "<div class=\"popup-content\">"
			+	"<a href=\"#page-locatie\" data-transition=slide\" data-role=\"button\">"
			+		"Change location"
			+	"</a>"
			+"</div>"
		,
		full: "\
			<div class=\"popup-content\">\
				<a href=\"#page-detail\" data-transition=\"slide\" data-role=\"button\">\
					Zie meer informatie\
				</a>\
			</div>\
			"
		, 
		detail:"\
			<div class=\"popup-content\">\
				<a href=\"#page-detail\" data-transition=\"slide\" data-role=\"button\">\
					Zie meer informatie\
				</a>\
			</div>\
			"
	},

	init: function(mapID){
		this.clear();
		this.containerID = ( typeof mapID === 'string') ? mapID : 'map_canvas' ;
		this.setup();
	},
	setup: function(){
		this.map = new google.maps.Map(document.getElementById(this.containerID),
		this.defaultOptions);

		this.centerToDefault();

		//bug in Google Maps. Laadt anders niet op iOS.
		google.maps.event.trigger(this.map, 'resize');
		this.map.setZoom( this.map.getZoom() );
	},
	clear: function(cont){
		var container = ( (arguments.length > 0) && ( typeof cont === 'string' ) ) ? cont : this.containerID ;
		$('#' + container).find("*").remove();
	},
	runGeoPage: function( ) {
		var pos;
	try{
		pos = this.initGeo();
	}
	catch(err){
		console.log(err);
	}

	if( pos.hasOwnProperty('coords') ){
		this.geoLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		this.geoMarker = this.createMarker( '#marker-geo-location' , this.markerTypes[0] , this.geoLocation , this.popupContent.current );

		this.centerToPoint( this.geoLocation );
	}
	else{
		this.geoMarker = this.createMarker( '#marker-geo-location' , this.markerTypes[0] , this.defaultLocation , this.popupContent.current );
		this.centerToDefault();
	}

		this.clickToPositionLocation( true , this.geoMarker.marker )

	},
	initGeo: function() {
		var self = this;
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				return position;
			}, function () {
				self.handleNoGeolocation(true);
			});
		} else {
			// Browser doesn't support Geolocation
			self.handleNoGeolocation(false);
		}
		return false;
	},
	handleNoGeo: function(error) {
		if(error){
			console.log('Error: De geolocotie-service is mislukt.');
		}
		else{
			console.log ('Error: Je browser ondersteund geen geolocation.');
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
	createMarker: function( selector , type , point , content ) {
		var selector = selector,
		type = type,
		point = point,
		content = content,
		self = this,
		marker = {
			selector: selector,
			content: content,
			point: ( point instanceof google.maps.LatLng ) ? point : new google.maps.LatLng(point[0], point[1]),
			type: type,
			marker: new google.maps.Marker({
				map: this.map,
				animation: 'BOUNCE',
				position: point,
				map: self.map,
				clickable: true,
				icon: type['icon']
			})
		};
		self.allMarkers.push( marker );


		
		return marker;
		// Initialize marker mouse down listener && map mouse down listener
		//self.markerMouseDown(type, html);
		//self.markerDrag(type, html);
		//self.mapMouseDown(type, html);
	},
	clickToPositionLocation: function( t , m ){
		var toggle = ( arguments.length < 1 ) ? true : t,
		marker = ( arguments[1] && (arguments[1] instanceof google.maps.Marker) ) ? m : undefined;
		self = this;
		if( m == undefined && toggle ){
			console.log( "no marker available" );
			return;
		}
		if( toggle ){
			this.mapClickListener = google.maps.event.addListener( this.map , 'click' , function( ltlng ){
				marker.setPosition( ltlng.latLng );
			} );
		}
		else{
			if( !this.mapClickListener ) return;
			google.maps.event.removeListener( this.mapClickListener );
		}
	}, /*
	markerMouseDown: function (type, html){
		var self = this;
		this.markerClick = google.maps.event.addListener(marker.marker, 'mousedown', function() { 
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
		
		this.drag = google.maps.event.addListener(marker.marker, "mouseout", function() {
			// If a markerTip exists - remove it before adding it
			self.removeMarker();
		});
	},
	mapMouseDown: function (){
		var self = this;
		this.mapClick = google.maps.event.addListener(this.map, 'mousedown', function(event) {
			// If a markerTip exists - remove it before adding it
			self.removeMarker();
		});
	}, */
	removeMarker: function(){
		if ($("#markerTip").length > 0){
				$('#markerTip').remove(); 
		}
	}

}

})(jQuery)
