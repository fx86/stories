$(document).ready(function(){
  var map = L.map('sex_ratio_india', {
        center: [23, 83],
        zoom: 4,
      });

  var mapbox_token = 'pk.eyJ1IjoiZng4NiIsImEiOiJjajhsdzhmOGMwczJ4MndtdXNkbm1jcGxrIn0.YsCl0mpdTQyMPd0URDwweA',
      mapbox_tile_url = 'https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=',
      osm_tile_url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  var tileLayer = L.tileLayer(mapbox_tile_url+mapbox_token, {
        maxZoom: 18
        });

  map.addLayer(tileLayer);
  var state_data = (function() {
        var df = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': "https://www.dropbox.com/s/h7lp9zgrflws5y3/nfhs4_sex_ratio.json?dl=1",
            'dataType': "json",
            'success': function (data) {
                df = data;
            }
        });
        return df;
    })();;

  var indi_state = new L.LayerGroup();
  function zoomToFeature(e) {
      var state =  e.target.feature.properties.ST_NM.toUpperCase();
      url = url.update({'State':state, 'level':'City', 'Metric_Low':null, 'Metric_High':null})
      window.location.href = url;
  }
  
  function resetHighlight(e) {
      var layer = e.target;
      layer.setStyle({
          weight: 2,
          color: 'transparent',
          dashArray: '',
          fillOpacity: 0.7
      });
      if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
      }
      info.update();
  }

  function highlightFeature_updateLegend(e) {
    var layer = e.target;
    info.update(layer.feature.properties);
    layer.setStyle({
        weight: 2,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    layer.on('mouseover', function (e) {
       this.openPopup();
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
  }

  function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature_updateLegend,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
  }
  
  $.getJSON('https://www.dropbox.com/s/aqiv0ftt2gh8upz/india.json?dl=1', function(topo){
      var geojson = topojson.feature(topo, topo.objects[Object.keys(topo.objects)[0]]);
      L.geoJson(geojson, {
          style: function(feature) {
            return {
              fillColor: getColor(state_data['st_total'][feature.properties.ST_NM]),
              opacity:1,
              weight: 2,
              color: 'transparent',
              dashArray: '3',
              fillOpacity: .65,
            }
          },
          onEachFeature: onEachFeature,
        }).addTo(indi_state);

    });

  map.addLayer(indi_state);

  // information
  var info = L.control();
  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
  };
  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
      this._div.innerHTML = '<h4>Sex ratio across 36 Indian states</h4>' +  (props ?
          '<b>' + props.ST_NM + '</b> : ' + state_data['st_total'][props.ST_NM] + 
          ' females per 1000 males': 'Hover over a state');
  };
  info.addTo(map);

  // draw a legend 
  var sex_ratio = [850, 900, 940, 970, 1000];
  function getColor(d) {
    return d > 1000  ? '#1a9641' :
           d > 970  ? '#a6d96a' :
           d > 940  ? '#ffffbf' :
           d > 900  ? '#fdae61' :
           d > 850  ? '#d7191c' :
                      '#d7191c';
  }
  var legend = L.control({position: 'topright'});
  legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
          labels = [];

      for (var i = 0; i < sex_ratio.length; i++) {
          div.innerHTML +=
              '<i style="background-color:' + getColor(sex_ratio[i] + 1) + ';"></i> ' +
              sex_ratio[i] + (sex_ratio[i + 1] ? '&ndash;' + sex_ratio[i + 1] + '<br>' : '+');
      }
      return div;
  };
  legend.addTo(map);


});