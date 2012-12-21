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
	if ($.mobile.activePage.attr('id') == 'pageActiviteit')
	{
		var contentHeight = Math.round(remainingHeightPercentage( [ $('.header-balk-activiteit') , $('.footer-balk-activiteit') , $('.titelblok-activiteit') ] ));
		$(".main").css({'height':contentHeight + 'px'});
		$("#map_canvas").css({'height':contentHeight + 'px'});
		GMap.init();
	}
});

$( 'header-knop-zoek' ).on( 'click' , function(){ this.preventDefault() GMap.initGeo() } )

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

	init: function(){
		this.setup();
	},
	setup: function(){
		this.map = new google.maps.Map(document.getElementById(this.containerID),
		this.defaultOptions);

		this.map.setCenter( this.defaultLocation );
	},
	initGeo: function() {

		point = new google.maps.LatLng(52.354425, 4.896241); 
		this.map.setCenter( point );

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
			point: new google.maps.LatLng(point[0], point[1]),
			type: type,
			marker: new google.maps.Marker({
			position: point,
			map: self.map,
			icon: type['icon'],
			mouseDownListener: mdListener
			})
		};

		self.markers.push( marker );
	}

}

})(jQuery)
