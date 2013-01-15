var NSD = NSD || {};

(function($) {
	var GMap, remainingHeightPercentage;

	//
	// DEBUG
	//
	$(document).on('keypress', '*', function(e) {
		e.stopImmediatePropagation();
		if(e.keyCode === 97) {
			console.log( "ok" );
			$( "#popup-donate" ).popup( "open", {transition: 'flow'} );
		} 
	});

	//
	// FUNCTIONS
	//
	remainingHeightPercentage = function(arr, num) {

		if(typeof arr === 'undefined') return;
		numType = (typeof num === 'undefined') ? 'pixel' : num;

		var windowTotal = $(window).outerHeight(),
			excluded = 0,
			included;

		if(typeof arr !== "array") {
			$.each(arr, function(i, e) {
				excluded += e.outerHeight();
			});
		} else {
			excluded = arr.outerHeight();
		}

		try {
			if(numType === 'percentage') {
				included = 100 - (excluded / windowTotal * 100);
			} else if(numType === 'pixel') {
				included = windowTotal - excluded;
			} else {
				throw console.log("not in pixels or percentages");
			}
		} catch(err) {
			console.log(err.message);
		}
		return included;
	};

	NSD.setActiveNavButton = function(s, n) {
		var navbar = (typeof n === "undefined") ? 'div[data-role="navbar"]' : n,
			selector = s;
		$(navbar).find('.ui-btn-active').removeClass('ui-btn-active ui-state-persist');
		$(navbar).find(selector).addClass('ui-btn-active ui-state-persist');
	};

	NSD.gotoActiviteitMarker = function(s) {
		var marker = GMap.getMarkerBySelector(s);
		GMap.centerToPoint(marker.point);
		GMap.map.setZoom(14);
		GMap.triggerInfoWindow(marker);
	};

	NSD.Queue = function() {
		this.queueArray = [];
	};

	NSD.Queue.prototype.addToQueue = function(func, args) {
		this.queueArray.push(this.wrapCall(func, args));
	};

	NSD.Queue.prototype.removeFromQueue = function(i, a) {
		var index = (typeof i === 'number') ? i : 0,
		all = (typeof a === 'undefined') ? false : !!a;

		if(!all) {
			this.queueArray.splice(index, 1);
		} else {
			this.queueArray.splice(index, this.queueArray.length);
		}
	};
	NSD.Queue.prototype.wrapCall = function(f, a) {
		var func = f,
		args = a;
		return function() {
			func.apply(this, args);
		};
	};
	NSD.Queue.prototype.runQueue = function() {
		var self = this,
		i = this.queueArray.length;

		if(i === 0) return;

		while(i-- > 0) {
			this.queueArray[0]();
			this.removeFromQueue();
		}
	};

	NSD.pageQueues = {
		detail: new NSD.Queue()
	}


	NSD.HTMLFab = {

		tag: function(tag, content, attributes) {
			return {
				tag: tag,
				content: content,
				attributes: attributes
			};
		},
		render: function(element) {
			var parts = [];

			if(typeof element === "undefined") return;

			function renderAttributes(attributes) {
				var result = [];

				for(var name in attributes) {
					result.push(" " + name + "=\"" + attributes[name] + "\"");
				}

				return result.join("");
			};

			function renderElement(element) {
				var self = this;

				if(typeof element === 'string') {
					parts.push(element);
				} else if(!element.content || element.content.length == 0 || typeof element.content === undefined) {
					parts.push("<" + element.tag + renderAttributes(element.attributes) + "/>")
				} else {
					parts.push("<" + element.tag + renderAttributes(element.attributes) + ">");

					$.each(element.content, function(i, e) {
						renderElement(e);
					});

					parts.push("</" + element.tag + ">");
				}

			};

			renderElement(element);
			return parts.join("");
		}


	};

	NSD.updateDetailPage = function(s){
		var marker = GMap.getMarkerBySelector("#"+s),
		titleTag = NSD.HTMLFab.render( NSD.HTMLFab.tag( "h3" , marker.title  ) ),
		subTag = NSD.HTMLFab.render( NSD.HTMLFab.tag( "h4" , marker.sub  ) ),
		imageTag = NSD.HTMLFab.render( NSD.HTMLFab.tag( "image" , "" , {src: marker.image} ) ),
		tekstTag = NSD.HTMLFab.render( NSD.HTMLFab.tag( "p", marker.text ) );

		

		$('.content-detail-titel').html("");
		$( "<div/>" , { html: titleTag + subTag } ).appendTo( '.content-detail-titel' );

		$('.content-detail-image').html("");
		$( "<div/>" , { html: imageTag } ).appendTo( '.content-detail-image' );

		$('.content-detail-tekst').html("");
		$( "<div/>" , { html: tekstTag } ).appendTo( '.content-detail-tekst' );

		$( '#page-detail .main' ).fadeIn( 'fast' ) ;
	};


	//
	// EVENTS
	//
	$(document).on('pageinit', '#page-activiteit', function(e, d) {

		$('.footer-balk-activiteit , .footer-balk-op-route').on('click', '.activiteit-marker , .route-direction', function(e) {
			NSD.setActiveNavButton($(e.currentTarget));
			if($(e.currentTarget).hasClass('route-direction')) {
				GMap.setDirectionsFromGeo({
					latitude: 52.043763,
					longitude: 5.377985
				});
			} else {}
		});
		$('#map-canvas-activiteit').on('click', '.popup-knop-stippel-route', function(e) {
			var markerSelector = $(e.currentTarget).parentsUntil('#page-activiteit', '.popup-content').attr('id');
			GMap.setDirectionsFromGeo(GMap.getMarkerBySelector('#' + markerSelector).point);
		});

		$('#map-canvas-activiteit').on('click', '.popup-knop-meer-info', function(e) {
			var markerSelector = $(e.currentTarget).parentsUntil('#page-activiteit', '.popup-content').attr('id');
			$( '#page-detail .main' ).hide( false ) ;
			NSD.pageQueues.detail.addToQueue( NSD.updateDetailPage , [markerSelector] )
		});

	});
	$(document).on('pageinit', '#page-op-route', function(e, d) {

		$('.lijst-op-route').on('click', '.list-a-op-route, .list-b-op-route, .list-c-op-route, .list-d-op-route, .list-e-op-route', function(e) {
			var selector;
			switch($(e.currentTarget).attr('class').split(' ')[0]) {
			case 'list-a-op-route':
				selector = '#marker-uitkijkpost-location';
				break;
			case 'list-b-op-route':
				selector = '#marker-lunch-location';
				break;
			case 'list-c-op-route':
				selector = '#marker-kinderboerderij-location';
				break;
			case 'list-d-op-route':
				selector = '#marker-speurtocht-location';
				break;
			case 'list-e-op-route':
				selector = '#marker-wild-location';
				break;
			default:
				selector = '#marker-uitkijkpost-location';
				break;
			};

			NSD.opRouteSelector = selector;
			NSD.isSetOpRoute = true;
			//NSD.gotoActiviteitMarker(selector);
		});

	});


	$(document).bind('pagechange', function(e, d) {

		if($.mobile.activePage.attr('id') === 'page-locatie') {
			var contentHeight = Math.round(remainingHeightPercentage([$('.header-balk-locatie'), $('.titelblok-locatie'), $('.bevestig-div-locatie')]));
			$("#map-canvas-locatie").css({
				'height': contentHeight + 'px'
			});

			GMap.init('map-canvas-locatie');
			GMap.runGeoPage();
		} else if($.mobile.activePage.attr('id') === 'page-activiteit') {
			if(NSD.prevPageID === 'page-detail') {
				NSD.prevPageID = 'page-activiteit';
			} else if(NSD.prevPageID === 'page-op-route') {

				if(NSD.isSetOpRoute) {
					NSD.gotoActiviteitMarker(NSD.opRouteSelector);
				}

				NSD.isSetOpRoute = false;
				NSD.prevPageID = 'page-activiteit';
			} else {
				var contentHeight = Math.round(remainingHeightPercentage([$('.header-balk-activiteit'), $('.footer-balk-activiteit'), $('.titelblok-activiteit')]));
				$("#map-canvas-activiteit").css({
					'height': contentHeight + 'px'
				});
				GMap.init('map-canvas-activiteit');
				GMap.runActivityPage();
			}

		} else if($.mobile.activePage.attr('id') === 'page-op-route') {

			NSD.setActiveNavButton('.lijst-activiteit-op-route');

		} else if($.mobile.activePage.attr('id') === 'page-detail') {
			NSD.pageQueues.detail.runQueue();
		}

	});

	$(document).bind('pagebeforeshow', function(e, d) {
		NSD.prevPageID = d.prevPage.attr('id');
	});

	//
	// GOOGLE MAPS FUNCTIONS
	//
	GMap = {
		containerID: 'map_canvas',
		defaultLocation: new google.maps.LatLng(52.2167, 5.1333),
		defaultOptions: {
			zoom: 12,
			disableDefaultUI: false,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		},
		markerTypes: [{
			type: 'current',
			icon: 'images/pointer_icon.png',
			popup: 'current',
			title: 'Mijn locatie'
		}, {
			type: 'found',
			icon: 'images/dot_4.png',
			popup: 'full',
			title: 'Gevonden activiteiten'
		}, {
			type: 'evenement',
			icon: 'images/dot_2.png',
			popup: 'detail',
			title: 'Evenementen'
		}, {
			type: 'aanbieding',
			icon: 'images/dot_3.png',
			popup: 'detail',
			title: 'Aanbiedingen'
		}, {
			type: 'melding',
			icon: 'images/dot_1.png',
			popup: 'detail',
			title: 'Meldingen'
		}],
		allMarkers: [],
		activityMarkers: [],
		isGeoSet: false,
		geoRetryCount: 5,
		geoRetryCountTotal: 5,
		init: function(mapID) {
			this.clear();
			this.containerID = (typeof mapID === 'string') ? mapID : 'map_canvas';
			this.setup();
		},
		setup: function() {
			this.map = new google.maps.Map(document.getElementById(this.containerID), this.defaultOptions);

			this.centerToDefault();

			//bug in Google Maps. Laadt anders niet op iOS.
			google.maps.event.trigger(this.map, 'resize');
			this.map.setZoom(this.map.getZoom());
		},
		clear: function(cont) {
			var container = ((arguments.length > 0) && (typeof cont === 'string')) ? cont : this.containerID;
			$('#' + container).find("*").remove();
			this.isGeoSet = false;
			this.geoRetryCount = this.geoRetryCountTotal;
			this.allMarkers = [];
			this.removeDirections();
		},
		runGeoPage: function() {

			this.initGeo(['updateGeo', 'centerToPoint']);

			var location = (typeof this.geoLocation === 'undefined') ? this.defaultLocation : this.geoLocation;
			this.centerToPoint(location);
			this.updateGeo(location);

			this.clickToPositionLocation(true, this.geoMarker.marker);

		},
		updateGeo: function(p) {
			if(this.isGeoSet) {
				this.geoMarker.marker.setPosition(p);
			} else {
				this.geoMarker = this.createGeoMarker(p);
			}

		},
		runActivityPage: function() {
			//fm staat voor fakemarkers
			var fm = {},
				rndLocations = [{
					latitude: 52.046086,
					longitude: 5.388138
				}, {
					latitude: 52.05622,
					longitude: 5.36711
				}, {
					latitude: 52.031514,
					longitude: 5.401674
				}, {
					latitude: 52.053053,
					longitude: 5.341421
				}, {
					latitude: 52.033731,
					longitude: 5.36511
				}, {
					latitude: 52.043763,
					longitude: 5.377985
				}];

			$.each(rndLocations, function(i, e) {
				e.latLng = new google.maps.LatLng(e.latitude, e.longitude);
			});

			fm.uitkijkpost = this.createMarker('#marker-uitkijkpost-location', this.markerTypes[1], rndLocations[5].latLng, this.createPopupContent('detail', 'marker-uitkijkpost-location'), {
				thumb: 'images/thumb_post.png',
				title: 'Kootwijk uitkijktoren Kootwijker Zandverstuiving',
				sub: 'Bron: Staatbosbeheer',
				image: 'images/full_post.png',
				text: 'Zandverstuivingen ontstonden in het verleden doordat de heidevelden werden overbegraasd en te veel werden afgeplagd. De heideplaggen werden gebruikt in de potstal en als bemesting van het bouwland. Als er te veel werd geplagd kon de hei zich niet meer herstellen. Een andere schadelijke activiteiten was het maken van soms honderden meters brede karrensporen.\nDe wind zorgde er dan voor dat het stuifzand zich steeds verder verspreidde waardoor de zandverstuiving steeds groter werd. In een grote zandverstuiving kunnen door de wind duinen ontstaan. Langs de rand van een zandverstuiving ligt meestal een hoge zandwal, waar het zand zich op verzamelt. Soms werden hele dorpen bedreigd door het oprukkende zand. Zo kon een enkele storm vanuit de zandverstuiving een oogst door een dunne zandlaag op de kwetsbare plantjes vernietigen'
			});
			fm.lunch = this.createMarker('#marker-lunch-location', this.markerTypes[3], rndLocations[1].latLng, this.createPopupContent('full', 'marker-lunch-location'), {
				thumb: 'images/thumb_kerk.png',
				title: 'Pannenkoekenrestaurant de Veldkamp',
				sub: 'Bron: Natuurmonumenten',
				image: 'images/full_kerk.png',
				text: 'Sfeervol en eigentijds ingericht pannenkoekenrestaurant, gelegen in Epe op de Veluwe. Ambachtelijk gebakken pannenkoeken met schitterende open keuken.'
			});
			fm.kinderboerderij = this.createMarker('#marker-kinderboerderij-location', this.markerTypes[2], rndLocations[2].latLng, this.createPopupContent('full', 'marker-kinderboerderij-location'), {
				thumb: 'images/thumb_huis.png',
				title: 'Beleef het burlen van edelherten per fiets en te voet',
				sub: 'Bron: Epenaren.nl',
				image: 'images/full_huis.png',
				text: 'Het edelhert is de grootste wildsoort die in Nederland voorkomt. Op heldere koude avonden en ochtenden is het oergeluid van de herten te horen, het zogenaamde burlen. Het VVV laat ons weten dat er weer diverse excursies worden georganiseerd om dit fenomeen te beleven. \n\nVanaf begin september tot half oktober zijn de edelherten op vrijersvoeten. Als de mannetjes de vrouwtjes het hof maken en hun concurrenten hardhandig bevechten, gaat dat met een enorm lawaai gepaard. Burlen heet die oerschreeuw van het edelhert, een geluid dat natuurliefhebbers keer op keer de rillingen bezorgt. Ook breken er soms gevechten uit waarbij men de herten met de geweien tegen elkaar kan horen slaan. \n\nOm naar deze geluiden te luisteren worden er verschillende tochten door het Kroondomein georganiseerd in samenwerking met natuurrondleidingen G.B. Rekers en natuurgids Jan Niebeek.'
			});
			fm.speurtocht = this.createMarker('#marker-speurtocht-location', this.markerTypes[2], rndLocations[3].latLng, this.createPopupContent('full', 'marker-speurtocht-location'), {
				thumb: 'images/thumb_hert3.png',
				title: 'Bezoekerscentrum Veluwezoom (speurtocht)',
				sub: 'Bron: Natuurmonumenten',
				image: 'images/full_hert3.png',
				text: 'Bezoekerscentrum Veluwezoom is een prima begin- of eindpunt van een dagje Nationaal Park Veluwezoom. Het ligt bij Rheden, ten oosten van Arnhem. Neem ook een kijkje bij de VVV-post en de brasserie in dit fraaie boerderijencomplex.\nBekijk de mooie expositie, de leuke winkel en de gezellige tekenhoek in Bezoekerscentrum Veluwezoom. In de kinderkuil kunnen kinderen verkleed als wild zwijn spelen en lekker lui op hun rug naar informatieve filmpjes kijken.'
			});
			fm.wild = this.createMarker('#marker-wild-location', this.markerTypes[4], rndLocations[4].latLng, this.createPopupContent('full', 'marker-wild-location'), {
				thumb: 'images/thumb_hert2.png',
				title: 'Jachthuis Sint Hubertus in De Hoge Veluwe',
				sub: 'Bron: Stichting Nationaal park Hoge Veluwe',
				image: 'images/full_hert2.png',
				text: 'Het monumentale gebouw \'Jachthuis Sint Hubertus\' is gebouwd naar een ontwerp van de architect H.P. Berlage. Bij de vormgeving zijn de motieven uit de legende van St. Hubertus gebruikt. Het jachthuis en de tuinen rondom de vijver zijn het hele jaar open voor bezoekers.'
			});
			for(var e in fm) {

				var con = $(fm[e].content);
				con.find('.ui-block-a').prepend(NSD.HTMLFab.render(NSD.HTMLFab.tag('img', [], {
					src: fm[e].thumb
				})));
				con.find('.ui-block-b').prepend(NSD.HTMLFab.render(NSD.HTMLFab.tag('p', [fm[e].sub])));
				con.find('.ui-block-b').prepend(NSD.HTMLFab.render(NSD.HTMLFab.tag('h3', [fm[e].title])));
				fm[e].content = $("<div>").append(con).html();
				fm[e].infoWindow.setContent($("<div>").append(con).html());

				this.activityMarkers.push(fm[e]);
			}
			this.centerToPoint({
				latitude: 52.046521,
				longitude: 5.366448
			})
			this.map.setZoom(9);

			if(!this.geoLocation) {
				this.initGeo(['updateGeo']);
			} else {
				this.createGeoMarker(this.geoLocation)
			}

			this.createInfoWindowListeners();

		},
		createPopupContent: function(t, s) {
			var type = t,
				selector = s,
				output;

			switch(type) {
			case 'full':
				output = $('#popup-infowindow-full');
				break;
			case 'detail':
				output = $('#popup-infowindow-detail');
				break;
			case 'current':
				output = $('#popup-infowindow-current');
				break;
			}

			$(output).find('.popup-content').attr('id', selector);

			return output.html();
		},
		initGeo: function(c) {
			var self = this,
				callback, isArray = false;

			if((arguments.length > 0)) {
				if(typeof c === 'string') {
					callback = c;
				} else if(typeof c == 'object') {
					callback = c;
					isArray = true;
				} else if(typeof c === 'function') {
					console.log("pass functions as strings in initGeo()");
					return;
				} else {
					callback = 'updateGeo';
				}
			}

			this.geoLocation = this.defaultLocation;

			if(navigator.geolocation) {

				navigator.geolocation.getCurrentPosition(function(position) {
					self.geoLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					self.defaultLocation = self.geoLocation;

					if(!isArray) {
						self[callback](self.geoLocation);
					} else {
						$.each(callback, function(i, e) {
							self[e](self.geoLocation);
						});
					}
					self.geoRetryCount = self.geoRetryCountTotal;

				}, function(err) {

					console.log("initGeo() -> getCurrentPosition() failed. retryCount: " + self.geoRetryCount + ". callback: " + callback);
					self.handleNoGeo(err);

					if(self.geoRetryCount > 0) {
						self.geoRetryCount--;
						self.initGeo(callback);
					}


				}, {
					timeout: 60000,
					enableHighAccuracy: true
				});
			} else {
				// Browser doesn't support Geolocation
				self.handleNoGeolocation(false);
			}
		},
		handleNoGeo: function(error) {
			if(error) {
				switch(error.code) {
				case error.TIMEOUT:
					alert('Geo location could not be found: service timed out.');
					break;
				case error.POSITION_UNAVAILABLE:
					alert('Geo location could not be found: service returned \"Position unavailable\"');
					break;
				case error.PERMISSION_DENIED:
					alert('Geo location could not be found: permission has been denied, try enabling Location Services/GPS in your settings.');
					break;
				case error.UNKNOWN_ERROR:
					alert('Geo location could not be found: unknown error, sorry!');
					break;
				}
			} else {
				alert('Geo locatie wordt niet ondersteund.');
			}
		},
		initDirections: function() {
			this.removeDirections();
			this.directionRenderer = new google.maps.DirectionsRenderer();
			this.directionRenderer.setOptions({
				suppressMarkers: true,
				draggable: true
			});
			this.directionRenderer.setMap(this.map);

			this.directionService = new google.maps.DirectionsService();
		},
		removeDirections: function() {
			if((typeof this.directionRenderer === 'undefined') || (typeof this.directionService === 'undefined')) return;
			this.directionRenderer.setMap(null);
			delete this.directionRenderer;
			delete this.directionService;
		},
		calculateDirections: function(s, e) {
			if(arguments.length < 1) return;
			if((typeof this.directionRenderer === 'undefined') || (typeof this.directionService === 'undefined')) return;

			var start = (typeof s === 'undefined') ? self.geoLocation : s,
				end = e,
				request = {
					origin: start,
					destination: end,
					travelMode: google.maps.TravelMode.DRIVING
				},
				self = this;

			this.directionService.route(request, function(response, status) {
				if(status == google.maps.DirectionsStatus.OK) {
					self.directionRenderer.setDirections(response);
				};
			});

		},
		setDirectionsFromGeo: function(l) {
			var latlong = (l instanceof google.maps.LatLng) ? l : new google.maps.LatLng(l.latitude, l.longitude);
			this.initDirections();
			this.calculateDirections(this.geoLocation, latlong);
		},
		setDirections: function(s, e) {
			var start = (s instanceof google.maps.LatLng) ? s : new google.maps.LatLng(s.latitude, s.longitude);
			var end = (e instanceof google.maps.LatLng) ? e : new google.maps.LatLng(e.latitude, e.longitude);
			this.initDirections();
			this.calculateDirections(start, end);
		},
		createGeoMarker: function(g) {
			var position = (g instanceof google.maps.LatLng) ? g : new google.maps.LatLng(g.latitude, g.longitude),
				marker;
			marker = this.createMarker('#marker-geo-location', this.markerTypes[0], position, this.createPopupContent('current', 'marker-geo-location'));
			this.isGeoSet = true;
			return marker;
		},
		createInfoWindowListeners: function(m) {
			var marker = (arguments.length > 1) ? m : false,
				self = this;

			if(marker) {
				marker.clickListener = google.maps.event.addListener(marker.marker, 'click', function() {
					marker.infoWindow.open(self.map, marker.marker)
					self.closeInfoWindow(marker, true);
				});
			} else {
				$.each(this.allMarkers, function(i, e) {
					e.clickListener = google.maps.event.addListener(e.marker, 'click', function() {
						e.infoWindow.open(self.map, e.marker);
						self.closeInfoWindow(e, true);
					});
				});
			}

			this.mapListener = google.maps.event.addListener(this.map, 'click', function() {
				self.closeInfoWindow();
			});
		},
		triggerInfoWindow: function(m) {
			var marker = (m instanceof google.maps.Marker) ? m : m.marker;
			google.maps.event.trigger(marker, 'click');
		},
		getMarkerBySelector: function(s) {
			var selector = s,
				marker;

			for(var m in this.allMarkers) {
				if(this.allMarkers[m].selector === selector) {
					marker = this.allMarkers[m];
				}
			}

			return marker;
		},
		closeInfoWindow: function(m, ex) {
			var marker = (typeof ex === 'undefined') ? false : m,
				exclude = (typeof ex === 'undefined') ? false : !! ex;

			if(marker) {

				if(!exclude) {
					marker.infoWindow.close();
				} else {
					$.each(this.allMarkers, function(i, e) {
						if(e !== marker) {
							e.infoWindow.close();
						}
					});
				}
			} else {
				$.each(this.allMarkers, function(i, e) {
					e.infoWindow.close();
				});
			}
		},
		removeMarker: function(m) {

			if(m instanceof google.maps.Marker) {
				this.map.removeOverlay(m);
				this.isGeoSet = false;
			} else if(m.hasOwnProperty('marker')) {
				this.map.removeOverlay(m.marker);
				this.isGeoSet = false
			} else {
				console.log("couldnt remove marker")
			}

		},
		centerToDefault: function() {
			this.map.setCenter(this.defaultLocation);
		},
		centerToPoint: function(point) {
			try {
				var point = (point instanceof google.maps.LatLng) ? point : new google.maps.LatLng(point.latitude, point.longitude);
				this.map.setCenter(point)
			} catch(err) {
				console.log(err.message);
			}

		},
		createMarker: function(selector, type, point, content, detail, info) {
			var selector = selector,
				type = type,
				point = point,
				content = content,
				self = this,
				detail = detail,
				info = (typeof info === 'undefined') ? true : !! info;
			marker = {
				selector: selector,
				content: content,
				point: (point instanceof google.maps.LatLng) ? point : new google.maps.LatLng(point.latitude, point.longitude),
				type: type,
				marker: new google.maps.Marker({
					animation: 'BOUNCE',
					position: point,
					map: self.map,
					clickable: true,
					icon: type['icon'],
					title: type['title']
				}),
			};

			if(info) {
				marker.infoWindow = new google.maps.InfoWindow({
					content: content
				})
			}

			if(typeof detail !== 'undefined') {
				marker.thumb = detail.thumb;
				marker.title = detail.title;
				marker.image = detail.image;
				marker.text = detail.text;
				marker.sub = detail.sub;
			}

			this.allMarkers.push(marker);

			return marker;
		},
		createInfoWindow: function(m) {
			m.infoWindow = new google.maps.InfoWindow({
				content: m.content
			})
		},
		clickToPositionLocation: function(t, m) {
			var toggle = (typeof t === 'undefined') ? false : !! t,
				marker = (!(typeof m === "undefined") && (m instanceof google.maps.Marker)) ? m : undefined;
			self = this;
			if(m === undefined && toggle) {
				console.log("Error: no marker available");
				return;
			}
			if(toggle) {
				this.mapClickListener = google.maps.event.addListener(this.map, 'click', function(ltlng) {
					marker.setPosition(ltlng.latLng);
					self.geoLocation = ltlng.latLng;
				});
			} else {
				if(typeof this.mapClickListener === 'undefined') return;
				google.maps.event.removeListener(this.mapClickListener);
			}
		}


	}
})(jQuery)