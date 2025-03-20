const mapColors = [
  '#fee5d9',
  '#fcae91',
  '#fb6a4a',
  '#de2d26',
  '#a50f15',
]

const mapOpacities = [
  0.3,
  0.9,
  0.9,
  0.9,
  0.9,
]

const geography_buckets = {
  'blocks':           { 'total': [0, 426732, 1314546, 3829048, 16512329],
                        'nonviolent': [0, 168647, 597267, 1899220, 6988883],
                        'violent': [0, 176069, 663269, 1889079, 5187690],
                        'drug': [0, 92846, 304011, 727010, 2003918] },
  'community-areas':  { 'total': [1238123, 40812087, 103827021, 159211446, 292506638],
                        'nonviolent': [719085, 6392911, 15046737, 28117076, 54310585],
                        'violent': [116435, 9832279, 26092813, 56782734, 105575382],
                        'drug': [40051, 11930226, 41372510, 91139090, 132620671] },
}

let hoveredPolygonId = null
let selectedCategory = 'total'

function getTooltip(props){
  return '<h4>'+ props['distitle'] + '<br />' + selectedCategory + 'cost: <span class="pull-right">$' + props[selectedCategory + '_cost'].toLocaleString() + '</span></h4>'
}

function getFillColor(layerSource, category){
  let colors = mapColors

  let buckets = geography_buckets[layerSource][category]
  let fillColor = ['interpolate', ['linear'], ['get', category + '_cost']]
  for (var i = 0; i < buckets.length; i++) {
    fillColor.push(buckets[i], colors[i])
  }
  return fillColor
}

function getLineColor(layerSource, category){
  let opacities = mapOpacities

  let buckets = geography_buckets[layerSource][category]
  let fillOpacity = ['step', ['get', category + '_cost']]
  fillOpacity.push(opacities[0])
  for (var i = 1; i < buckets.length; i++) {
    fillOpacity.push(buckets[i], opacities[i])
  }
  return fillOpacity
}

async function loadSourceFromGzip(url, map, name) {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const decompressedData = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' })
  const geojson = JSON.parse(decompressedData)

  map.addSource(name, {
    type: 'geojson',
    data: geojson
  })

  addLayer(map, name)
}

function addLayer(map, layerSource){
  let maxzoom = 20
  let minzoom = 11
  let linecolor = '#000'
  let linewidth = 0
  let lineopacity = 0
  if (layerSource == 'community-areas') {
    maxzoom = 11
    minzoom = 1
    linecolor = '#333'
    linewidth = 1
    lineopacity = 1
  }

  // polygon fill styles
  map.addLayer({
    'id': `${layerSource}-fills`,
    'type': 'fill',
    'source': layerSource, // reference the data source
    'maxzoom': maxzoom,
    'minzoom': minzoom,
    'paint': {
      'fill-color': getFillColor(layerSource, selectedCategory),
      'fill-opacity': getLineColor(layerSource, selectedCategory)      
    }
  })

  // polygon line styles
  map.addLayer({
    'id': `${layerSource}-outline`,
    'type': 'line',
    'source': layerSource, // reference the data source
    'maxzoom': maxzoom,
    'minzoom': minzoom,
    'paint': {
      'line-color': linecolor,
      'line-width': linewidth,
      'line-opacity': lineopacity,
    }
  })

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  })
  
  map.on('mousemove', `${layerSource}-fills`, (e) => {
    // populate tooltip
    map.getCanvas().style.cursor = 'pointer'
    const coordinates = e.lngLat
    popup.setLngLat(coordinates).setHTML(getTooltip(e.features[0].properties)).addTo(map)
  })
}


function init(){
  // initiate maplibre map
  mapboxgl.accessToken = 'pk.eyJ1IjoiZGF0YW1hZGUiLCJhIjoiaXhhVGNrayJ9.0yaccougI3vSAnrKaB00vA';
  const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
      zoom: 11,
      center: [-87.6656, 41.8650]
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-left');
  map.scrollZoom.disable();

  map.on('load', () => {
    loadSourceFromGzip('/data/mil_dol_blocks_total_by_type_simple.geojson.gz', map, 'blocks')
    loadSourceFromGzip('/data/mil_dol_chicomm_total_by_type.geojson.gz', map, 'community-areas')
  })

  // info = L.control({position: 'bottomright'});
  // info.onAdd = function(map){
  //   this._div = L.DomUtil.create('div', 'info');
  //   this.update();
  //   this._div.innerHTML = '<h5><span class="glyphicon glyphicon-hand-up" aria-hidden="true"></span> <span class="desktop-only">hover over</span><span class="mobile-only">tap on</span> blocks to see spending</h5>';
  //   return this._div;
  // }
  // info.update = function(props){
  //   var info;
  //   if (typeof props !== 'undefined'){
  //     if (props['distitle'])
  //       info = '<h4>'+ props['distitle'] + "<br />" + type_name + ' cost: <span class="pull-right">' + accounting.formatMoney(props[data_column], '$', 0) + '</span></h4>';
  //     else
  //       info = '<h4>'+ type_name + ' cost: <span class="pull-right">' + accounting.formatMoney(props[data_column], '$', 0) + '</span></h4>';
  //     this._div.innerHTML = info;
  //   }
  // }
  // info.clear = function(){
  //   this._div.innerHTML = '<h5><span class="glyphicon glyphicon-hand-up" aria-hidden="true"></span> <span class="desktop-only">hover over</span><span class="mobile-only">tap on</span> blocks to see spending</h5>';
  // }
  // info.addTo(map);
  // var comm_layerUrl = 'https://datamade.cartodb.com/api/v2/viz/0b2275ec-e888-11e4-8bab-0e0c41326911/viz.json';
  // var parcel_layerUrl = 'https://datamade.cartodb.com/api/v2/viz/92350936-e898-11e4-8d70-0e4fddd5de28/viz.json';

  // var map_commarea_css = "\
  // #mil_dol_blocks_total{\
  //   polygon-opacity: 0.9;\
  //   line-color: #333;\
  //   [" + data_column + " >= " + jenks_values_commarea[4] + "] {polygon-fill: " + mapColors[3] + ";}\
  //   [" + data_column + " > " + jenks_values_commarea[3] + "] {polygon-fill: " + mapColors[3] + ";}\
  //   [" + data_column + " > " + jenks_values_commarea[2] + "] {polygon-fill: " + mapColors[2] + ";}\
  //   [" + data_column + " > " + jenks_values_commarea[1] + "] {polygon-fill: " + mapColors[1] + ";}\
  //   [" + data_column + " > " + jenks_values_commarea[0] + "] {polygon-fill: " + mapColors[0] + ";}\
  // }";

  // // change the query for the first layer
  // var comm_subLayerOptions = {
  //   sql: "SELECT * FROM mil_dol_chicomm_total_by_type",
  //   cartocss: map_commarea_css,
  //   interactivity: 'distitle,total_cost,drug_cost,nonviolent_cost,violent_cost'
  // }

  // var map_parcel_css = "\
  // #mil_dol_blocks_total{\
  //   line-color: #999; line-width: 0.2;\
  //   [" + data_column + " >= " + jenks_values_parcel[4] + "] {polygon-fill: " + mapColors[3] + "; polygon-opacity: 0.3;}\
  //   [" + data_column + " > " + jenks_values_parcel[3] + "] {polygon-fill: " + mapColors[3] + "; polygon-opacity: 0.9;}\
  //   [" + data_column + " > " + jenks_values_parcel[2] + "] {polygon-fill: " + mapColors[2] + "; polygon-opacity: 0.9;}\
  //   [" + data_column + " > " + jenks_values_parcel[1] + "] {polygon-fill: " + mapColors[1] + "; polygon-opacity: 0.9;}\
  //   [" + data_column + " > " + jenks_values_parcel[0] + "] {polygon-fill: " + mapColors[0] + "; polygon-opacity: 0.9; line-color: " + mapColors[0] + "; line-width: 2;}\
  // }";

  // var parcel_subLayerOptions = {
  //   sql: "SELECT * FROM mil_dol_blocks_total_by_type",
  //   cartocss: map_parcel_css,
  //   interactivity: 'geoid10,total_cost,drug_cost,nonviolent_cost,violent_cost'
  // }

  // if (typeof comm_layer === 'undefined'){
  //   comm_layer = cartodb.createLayer(map, comm_layerUrl, { https: true })
  //   .addTo(map)
  //   .done(function(layer) {
  //     comm_sublayer = layer.getSubLayer(0);
  //     comm_sublayer.set(comm_subLayerOptions);
  //     comm_sublayer.setInteraction(true);
  //     comm_sublayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex){
  //         $('#cartodb-map div').css('cursor','pointer');
  //         info.update(data);
  //     })
  //     comm_sublayer.on('featureOut', function(e, latlng, pos, data, subLayerIndex){
  //         $('#cartodb-map div').css('cursor','inherit');
  //         info.clear();
  //     })
  //     comm_sublayer.on('featureClick', function(e, latlng, pos, data, subLayerIndex){
  //         $('#cartodb-map div').css('cursor','pointer');
  //         info.update(data);
  //     })
  //     comm_sublayer.on('featureClick', function(e, pos, latlng, data){
  //         map.setZoomAround(latlng, 13);
  //     })
  //   }).on('error', function() {
  //     //log the error
  //   });
  // }

  // if (typeof parcel_layer === 'undefined'){
  //   parcel_layer = cartodb.createLayer(map, parcel_layerUrl, { https: true })
  //   .addTo(map)
  //   .done(function(layer) {
  //     parcel_sublayer = layer.getSubLayer(0);
  //     parcel_sublayer.set(parcel_subLayerOptions);
  //     parcel_sublayer.setInteraction(true);
  //     parcel_sublayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex){
  //         $('#cartodb-map div').css('cursor','pointer');
  //         info.update(data);
  //     })
  //     parcel_sublayer.on('featureOut', function(e, latlng, pos, data, subLayerIndex){
  //         $('#cartodb-map div').css('cursor','inherit');
  //         info.clear();
  //     })
  //     parcel_sublayer.on('featureClick', function(e, latlng, pos, data, subLayerIndex){
  //         $('#cartodb-map div').css('cursor','pointer');
  //         info.update(data);
  //     })
  //     parcel_sublayer.on('featureClick', function(e, pos, latlng, data){
  //         // console.log(e)
  //         // console.log(data);
  //     })

  //     map.on('zoomend', function(e){
  //       hash = new L.Hash(map);
  //       toggleLayers();
  //     });
  //     map.on('moveend', function(e){
  //       hash = new L.Hash(map);
  //     });
  //     toggleLayers();
  //   }).on('error', function() {
  //     //log the error
  //   });
  // }

  // if (typeof comm_sublayer !== 'undefined')
  //   comm_sublayer.setCartoCSS(map_commarea_css);

  // if (typeof parcel_sublayer !== 'undefined')
  //   parcel_sublayer.setCartoCSS(map_parcel_css);
}

// if (typeof hash !== 'undefined')
//   hash = new L.Hash(map);

function toggleLayers(){
  // console.log('toggleLayers')
  if (typeof parcel_sublayer !== 'undefined' && comm_sublayer !== 'undefined'){
    if (map.getZoom() >= 12 ){
        comm_sublayer.hide();
        parcel_sublayer.show();
    } else {
        comm_sublayer.show();
        parcel_sublayer.hide();
    }
  }
}

$(window).resize(function () {
  var h = $(window).height(),
  offsetTop = 60; // Calculate the top offset
  $('#map').css('height', (h - offsetTop));
  $('#content').css('height', (h - offsetTop));
}).resize();

$(function() {
  init('total');

  $('.button').click(function() {
    $('.button').removeClass('selected');
    $(this).addClass('selected');
    init($(this).attr('id'));
  });
});
