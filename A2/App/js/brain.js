function login(){
	var un = document.getElementById("username").value;
	localStorage.setItem("username", un);
	if(localStorage.getItem(un)===null){
		localStorage.setItem(un, JSON.stringify([]));
	}
}

function setCenter(location,access_token,map){
	var country = location.replaceAll(" ","+");

	let url = "https://api.mapbox.com/geocoding/v5/mapbox.places/"+country+".json?access_token="+access_token;
  	let req = new XMLHttpRequest();
  	req.open('GET', url, true);
  	req.onload = function() {
		var dataObj = JSON.parse(req.response);
		
		map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v11',
			center: dataObj.features[0].center, // starting position
			zoom: 3
		});
		getAllAirports(access_token,map,dataObj.features[0].properties.short_code);
  	}
  	req.send();
}

function getAllAirports(access_token,map,tag){
	let url = "https://api.mapbox.com/geocoding/v5/mapbox.places/airport.json?access_token="+access_token+"&limit=10&country="+tag;
	let req = new XMLHttpRequest();
	req.open('GET', url, true);
	req.onload = function() {
  		var dataObj = JSON.parse(req.response);
		if(dataObj.features.length>0){
			markAllAirports(dataObj,map);
		}else{
			refreshDropDown();
		}
	}
	req.send();
}

function markAllAirports(loca,map){
	refreshDropDown();
	
    var dropStart= document.getElementById("start");
    var dropEnd = document.getElementById("end");
	for(var i=0;i<loca.features.length;i++){
		var temploca = loca.features[i];
		const marker = new mapboxgl.Marker() // initialize a new marker
			.setLngLat(temploca.center) // Marker [lng, lat] coordinates
			.addTo(map);
			marker.id = temploca.geometry.coordinates[0]+","+temploca.geometry.coordinates[1];
		for(var d=0;d<2;d++){
			var opt = document.createElement('option');
			opt.text = temploca.place_name.split(',')[0];
			opt.value = marker.id+"|"+temploca.place_name.split(',')[0];
			if(d===0){
				dropStart.append(opt);continue;
			}dropEnd.append(opt);
		}
	}
}

function getRoute(start,end,map) {
	// make a directions request using cycling profile
	// an arbitrary start will always be the same
	// only the end or destination will change
	const url = "https://api.mapbox.com/directions/v5/mapbox/cycling/"+start+";"+end+"?geometries=geojson&access_token=pk.eyJ1IjoiYW5jaGVsb2FkcmlhbiIsImEiOiJjbDM0b2JibXUydmZqM2lwZjN2bWt0bXdmIn0._8vWl-iZML98QWAjsCSvYA";

	map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/streets-v11',
		center: start.split(','), // starting position
		zoom: 6
	});

	let req = new XMLHttpRequest();
	req.open('GET', url, true);
	req.onload = function() {
		var dataObj = JSON.parse(req.response);
		var data = dataObj.routes[0];
		const route = data.geometry.coordinates;

		const geojson = {
			type: 'Feature',
			properties: {},
			geometry: {
			  type: 'LineString',
			  coordinates: route
			}
		  };
		
		  map.addLayer({
			id: 'route',
			type: 'line',
			source: {
			  type: 'geojson',
			  data: geojson
			},
			layout: {
			  'line-join': 'round',
			  'line-cap': 'round'
			},
			paint: {
			  'line-color': '#000000',
			  'line-width': 5
			}
		  });
	}

	req.send();
	

  }
 function refreshDropDown() {
    var dropStart= document.getElementById("start");
    var dropEnd = document.getElementById("end");
	removeChilds(dropEnd);
	removeChilds(dropStart);
	for(var d=0;d<2;d++){
		var opt = document.createElement('option');
		opt.text = "Choose End Location";
		opt.value = "";
		if(d===0){
			opt.text = "Choose Start Location";dropStart.append(opt);continue;
		}dropEnd.append(opt);
	}
 }
  
  const removeChilds = (parent) => {
    	while (parent.lastChild!==null) {
        parent.removeChild(parent.lastChild);
	}
};
