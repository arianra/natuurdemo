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

		//$( '.bevestig-div-locatie' ).append( '<a href="#" data-role="button" id="test-button">test</a>' )
		//$( '.bevestig-div-locatie' ).on( 'click' , '#test-button' ,function(){ GMap.runActivityPage() } )
	}
	else if ($.mobile.activePage.attr('id') == 'page-activiteit')
	{
		var contentHeight = Math.round(remainingHeightPercentage( [ $('.header-balk-activiteit') , $('.footer-balk-activiteit') , $('.titelblok-activiteit') ] ));
		$("#map-canvas-activiteit").css({'height':contentHeight + 'px'});
		
		GMap.init( 'map-canvas-activiteit' );
		GMap.runActivityPage();



	}
	else if ($.mobile.activePage.attr('id') == 'page-route')
	{
		var contentHeight = Math.round(remainingHeightPercentage( [ $('.header-balk-route') , $('.footer-balk-route')  , $('.titelblok-route') ] ));
		$("#map-canvas-route").css({'height':contentHeight + 'px'});
		GMap.init( 'map-canvas-route' );



	}

});

/*
*	GOOGLE MAPS FUNCTIONS
*/
var GMap = {
	containerID: 'map_canvas',
	defaultLocation: new google.maps.LatLng(52.2167, 5.1333),
	defaultOptions: {
		zoom: 12,
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	},
	markerTypes: [
	{ type:'current' , icon: 'images/pointer_icon.png' , popup: 'current' , title: 'Mijn locatie'},
	{ type:'found' , icon: 'images/dot_1.png' , popup: 'full' , title: 'Gevonden activiteiten'},
	{ type:'evenement' , icon: 'images/dot_2.png' , popup: 'detail' , title: 'Evenementen'},
	{ type:'aanbieding' , icon: 'images/dot_1.png' , popup: 'detail' , title: 'Aanbiedingen'},
	{ type:'melding' , icon: 'images/dot_2.png' , popup: 'detail' , title: 'Meldingen'}
	],
	allMarkers: [],
	activityMarkers: [],
	isGeoSet: false,
	geoRetryCount: 10,
	geoRetryCountTotal: 10,
	popupContent: {
		current: "<div class=\"popup-content popup-current\">"
			+	"<a href=\"#page-locatie\" data-transition=slide\" data-role=\"button\" class=\"popup-knop-change-location\">"
			+		"Change location"
			+	"</a>"
			+"</div>"
		,
		full: "\
			<div class=\"popup-content popup-full\">\
				<a href=\"#page-detail\" data-transition=\"slide\" data-role=\"button\" class=\"popup-knop-meer-info\">\
					Zie meer informatie\
				</a>\
			</div>\
			"
		, 
		detail:"\
			<div class=\"popup-content popup-detail\">\
				<a href=\"#page-detail\" data-transition=\"slide\" data-role=\"button\" class=\"popup-knop-meer-info\">\
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
		this.isGeoSet = false;
		this.geoRetryCount = this.geoRetryCountTotal;
		this.allMarkers = [];
	},
	runGeoPage: function( ) {

		this.initGeo( ['updateGeo','centerToPoint'] );

		this.centerToPoint( this.defaultLocation );
		this.updateGeo( this.defaultLocation );

		this.clickToPositionLocation( true , this.geoMarker.marker );

	},
	updateGeo: function( p ){
		if( this.isGeoSet ){
			this.geoMarker.marker.setPosition( p );
		}
		else {
			this.geoMarker = this.createGeoMarker( p );
		}

	},
	runActivityPage: function(){
		//fm staat voor fakemarkers
		
		var fm = {},
		rndLocations = [ 	{ latitude:52.046086 , longitude:5.388138 } ,
					{ latitude:52.05622 , longitude:5.36711 } ,
					{ latitude:52.031514 , longitude:5.401674 } , 
					{ latitude:52.053053 , longitude:5.341421 } ,
					{ latitude:52.033731 , longitude:5.36511 } ,
					{ latitude:52.043763 , longitude:5.377985 }  
				];

		$.each( rndLocations , function(i,e){
			e.latLng = new google.maps.LatLng(e.latitude, e.longitude)
		});

		fm.koffie = this.createMarker( '#marker-koffie-location' , this.markerTypes[3] , rndLocations[0].latLng , this.popupContent.detail );
		fm.lunch = this.createMarker( '#marker-lunch-location' , this.markerTypes[3] , rndLocations[1].latLng , this.popupContent.detail );
		fm.kinderboerderij = this.createMarker( '#marker-kinderboerderij-location' , this.markerTypes[2] , rndLocations[2].latLng , this.popupContent.detail );
		fm.speurtocht = this.createMarker( '#marker-speurtocht-location' , this.markerTypes[2] , rndLocations[3].latLng  , this.popupContent.detail );
		fm.wild = this.createMarker( '#marker-wild-location' , this.markerTypes[4] , rndLocations[4].latLng , this.popupContent.detail );
		fm.uitkijkpost = this.createMarker( '#marker-uitkijkpost-location' , this.markerTypes[1] , rndLocations[5].latLng  , this.popupContent.full);

		for( var e in fm ){

			this.activityMarkers.push ( fm[e] );
		}

		this.createInfoWindowListeners();

		this.centerToPoint( { latitude:52.046521 , longitude:5.366448 } )
		this.map.setZoom( 13 );

		if(!this.geoLocation){
			this.initGeo( ['updateGeo'] );
		}
		else {
			this.createGeoMarker( this.geoLocation )
		}
		
	},
	initGeo: function(c) {
		var self = this,
		callback,
		isArray = false;

		if( (arguments.length > 0)  ){
			if(typeof c === 'string'){
				callback = c;
			}
			else if(typeof c == 'object'){
				callback = c;
				isArray=true;
			}
			else if(typeof c === 'function'){
				console.log( "pass functions as strings in initGeo()" );
				return;
			}
			else{
				callback = 'updateGeo';
			}
		}

		if (navigator.geolocation) {
			
			navigator.geolocation.getCurrentPosition(function (position) {
				self.geoLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

				if( !isArray ){
					self[callback]( self.geoLocation );
				}
				else {
					$.each( callback , function(i,e){
						self[e]( self.geoLocation );
					});
				}
				self.geoRetryCount = self.geoRetryCountTotal;

			}, function (err) {

				console.log( "initGeo() -> getCurrentPosition() failed. retryCount: " + self.geoRetryCount + ". callback: " + callback );
				self.handleNoGeolocation(err);

				if( self.geoRetryCount > 0 ){
					self.geoRetryCount--;
					self.intiGeo(callback);
				}
				else {
					self.geoLocation = self.defaultLocation;
				}


			} , {timeout:12 , enableHighAccuracy: true});
		}
		 else {
			// Browser doesn't support Geolocation
			self.handleNoGeolocation(false);
		}
	},
	handleNoGeo: function(error) {
			if(error){
				switch(error.code){
					case error.TIMEOUT:
						alert ('Timeout');
						break;
					case error.POSITION_UNAVAILABLE:
						alert ('Position unavailable');
						break;
					case error.PERMISSION_DENIED:
						alert ('Permission denied');
						break;
					case error.UNKNOWN_ERROR:
						alert ('Unknown error');
						break;
				}
			}
			else{
				alert( 'Geo locatie wordt niet ondersteund.' );
			}
	},
	createGeoMarker: function( g ){
		var position =  ( g instanceof google.maps.LatLng ) ? g : new new google.maps.LatLng( g.latitude , g.longitude ),
		marker;
		marker = this.createMarker( '#marker-geo-location' , this.markerTypes[0] , position , this.popupContent.current );
		this.isGeoSet = true;
		return marker;
	},
	createInfoWindowListeners: function( m ) {
		var marker = ( arguments.length > 1 ) ? m : false,
		self = this;
		
		if( marker ){
			marker.clickListener = google.maps.event.addListener( marker.marker , 'click' , function(){ 
				marker.infoWindow.open(self.map,marker.marker)
				self.closeInfoWindow( marker , true );
			});
		}
		else{
			$.each( this.allMarkers , function(i,e){ 
				e.clickListener = google.maps.event.addListener( e.marker , 'click' , function(){ 
					e.infoWindow.open(self.map,e.marker);
					self.closeInfoWindow( e , true );
				});
			});
		}

		this.mapListener = google.maps.event.addListener( this.map , 'click' , function(){ 
			self.closeInfoWindow();
		});
	},
	closeInfoWindow: function( m, ex ) {
		var marker = ( typeof ex === 'undefined' ) ? false : m,
		exclude = ( typeof ex === 'undefined' ) ? false : !!ex; 

		if(marker){

			if(!exclude){
				marker.infoWindow.close();
			}
			else{
				$.each( this.allMarkers , function(i,e){
					if( e !== marker ){
						e.infoWindow.close();
					}
				});
			}
		}
		else{
			$.each( this.allMarkers , function(i,e){
				e.infoWindow.close();
			});
		}
	},
	removeMarker: function( m ){

		if( m instanceof google.maps.Marker){
   			 this.map.removeOverlay(m);
   			 this.isGeoSet = false;
        		}
        		else if( m.hasOwnProperty( 'marker' ) ){
        			this.map.removeOverlay( m.marker );
        			this.isGeoSet = false
        		}
        		else {
        			console.log( "couldnt remove marker" )
        		}

	},
	centerToDefault: function(){
		this.map.setCenter( this.defaultLocation );
	},
	centerToPoint: function( point ){
		if( arguments.length < 1 ) return;

		try{
			var point = ( point instanceof google.maps.LatLng ) ? point : new google.maps.LatLng( point.latitude , point.longitude );
			this.map.setCenter( point )
		}
		catch(err){
			console.log( err.message );
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
			point: ( point instanceof google.maps.LatLng ) ? point : new google.maps.LatLng(point.latitude, point.longitude),
			type: type,
			marker: new google.maps.Marker({
				map: this.map,
				animation: 'BOUNCE',
				position: point,
				map: self.map,
				clickable: true,
				icon: type['icon'],
				title: type['title']
			}),
			infoWindow: new google.maps.InfoWindow({
				content: content
			})
		};

		this.allMarkers.push( marker );

		return marker;
	},
	clickToPositionLocation: function( t , m ){
		var toggle = ( arguments.length < 1 ) ? true : t,
		marker = ( arguments[1] && (arguments[1] instanceof google.maps.Marker) ) ? m : undefined;
		self = this;
		if( m === undefined && toggle ){
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
	}


}
})(jQuery)
