var map;
var base_layer;
var comm_layer;
var comm_sublayer;
var parcel_layer;
var parcel_sublayer;
var info;
var mapColors = [
  '#a50f15',
  '#de2d26',
  '#fb6a4a',
  '#fcae91',
  '#fee5d9'
];

var commAreaTotal = [ 292506638.00, 159211446.00, 103827021.00, 40812087.00, 1238123.00 ];
var commAreaNonviolent = [ 54310585.00, 28117076.00, 15046737.00, 6392911.00, 719085.00 ];
var commAreaViolent = [ 105575382.00, 56782734.00, 26092813.00, 9832279.00, 116435.00 ];
var commAreaDrug = [ 132620671.00, 91139090.00, 41372510.00, 11930226.00, 40051.00 ];

var parcelTotal = [ 16512329.00, 3829048.00, 1314546.00, 426732.00, 14.00 ];
var parcelNonviolent = [ 6988883.00, 1899220.00, 597267.00, 168647.00, 1.00 ];
var parcelViolent = [ 5187690.00, 1889079.00, 663269.00, 176069.00, 1.00 ];
var parcelDrug = [ 2003918.00, 727010.00, 304011.00, 92846.00, 1.00 ];

function init(type){
  // initiate leaflet map
  if (map === undefined){
    map = new L.Map('cartodb-map', {
      center: [41.8650, -87.6656],
      zoom: 12,
      scrollWheelZoom: false
    });
  }

  var jenks_values_commarea = commAreaTotal;
  var jenks_values_parcel = parcelTotal;
  var data_column = 'total_cost';
  var type_name = 'Total';

  if (type == 'nonviolent'){
    data_column = 'nonviolent_cost';
    type_name = 'Nonviolent';
    jenks_values_commarea = commAreaNonviolent;
    jenks_values_parcel = parcelNonviolent;
  }
  else if (type == 'violent'){
    data_column = 'violent_cost';
    type_name = 'Violent';
    jenks_values_commarea = commAreaViolent;
    jenks_values_parcel = parcelViolent;
  }
  else if (type == 'drug'){
    data_column = 'drug_cost';
    type_name = 'Drug-related';
    jenks_values_commarea = commAreaDrug;
    jenks_values_parcel = parcelDrug;
  }

  var hash = new L.Hash(map);

  if (typeof base_layer === 'undefined'){
    base_layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution: '<a href="http://mapbox.com/about/maps" target="_blank">Mapbox</a>'
    }).addTo(map);
  }

  if (typeof info !== 'undefined'){
    info.removeFrom(map);
  }

  info = L.control({position: 'bottomright'});
  info.onAdd = function(map){
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    this._div.innerHTML = '<h5><span class="glyphicon glyphicon-hand-up" aria-hidden="true"></span> <span class="desktop-only">hover over</span><span class="mobile-only">tap on</span> blocks to see spending</h5>';
    return this._div;
  }
  info.update = function(props){
    var info;
    if (typeof props !== 'undefined'){
      if (props['distitle'])
        info = '<h4>'+ props['distitle'] + "<br />" + type_name + ' cost: <span class="pull-right">' + accounting.formatMoney(props[data_column], '$', 0) + '</span></h4>';
      else
        info = '<h4>'+ type_name + ' cost: <span class="pull-right">' + accounting.formatMoney(props[data_column], '$', 0) + '</span></h4>';
      this._div.innerHTML = info;
    }
  }
  info.clear = function(){
    this._div.innerHTML = '<h5><span class="glyphicon glyphicon-hand-up" aria-hidden="true"></span> <span class="desktop-only">hover over</span><span class="mobile-only">tap on</span> blocks to see spending</h5>';
  }
  info.addTo(map);
  var comm_layerUrl = 'https://datamade.cartodb.com/api/v2/viz/0b2275ec-e888-11e4-8bab-0e0c41326911/viz.json';
  var parcel_layerUrl = 'https://datamade.cartodb.com/api/v2/viz/92350936-e898-11e4-8d70-0e4fddd5de28/viz.json';

  var map_commarea_css = "\
  #mil_dol_blocks_total{\
    polygon-opacity: 0.9;\
    line-color: #333;\
    [" + data_column + " >= " + jenks_values_commarea[4] + "] {polygon-fill: " + mapColors[3] + ";}\
    [" + data_column + " > " + jenks_values_commarea[3] + "] {polygon-fill: " + mapColors[3] + ";}\
    [" + data_column + " > " + jenks_values_commarea[2] + "] {polygon-fill: " + mapColors[2] + ";}\
    [" + data_column + " > " + jenks_values_commarea[1] + "] {polygon-fill: " + mapColors[1] + ";}\
    [" + data_column + " > " + jenks_values_commarea[0] + "] {polygon-fill: " + mapColors[0] + ";}\
  }";

  // change the query for the first layer
  var comm_subLayerOptions = {
    sql: "SELECT * FROM mil_dol_chicomm_total_by_type",
    cartocss: map_commarea_css,
    interactivity: 'distitle,total_cost,drug_cost,nonviolent_cost,violent_cost'
  }

  var map_parcel_css = "\
  #mil_dol_blocks_total{\
    line-color: #999; line-width: 0.2;\
    [" + data_column + " >= " + jenks_values_parcel[4] + "] {polygon-fill: " + mapColors[3] + "; polygon-opacity: 0.3;}\
    [" + data_column + " > " + jenks_values_parcel[3] + "] {polygon-fill: " + mapColors[3] + "; polygon-opacity: 0.9;}\
    [" + data_column + " > " + jenks_values_parcel[2] + "] {polygon-fill: " + mapColors[2] + "; polygon-opacity: 0.9;}\
    [" + data_column + " > " + jenks_values_parcel[1] + "] {polygon-fill: " + mapColors[1] + "; polygon-opacity: 0.9;}\
    [" + data_column + " > " + jenks_values_parcel[0] + "] {polygon-fill: " + mapColors[0] + "; polygon-opacity: 0.9; line-color: " + mapColors[0] + "; line-width: 2;}\
  }";

  var parcel_subLayerOptions = {
    sql: "SELECT * FROM mil_dol_blocks_total_by_type",
    cartocss: map_parcel_css,
    interactivity: 'geoid10,total_cost,drug_cost,nonviolent_cost,violent_cost'
  }

  var layerOpts = {
    user_name: 'datamade',
    type: 'cartodb',
    cartodb_logo: false,
  }

  if (typeof comm_layer === 'undefined'){
    comm_layer = cartodb.createLayer(map, comm_layerUrl)
    .addTo(map)
    .done(function(layer) {
      comm_sublayer = layer.getSubLayer(0);
      comm_sublayer.set(comm_subLayerOptions);
      comm_sublayer.setInteraction(true);
      comm_sublayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex){
          $('#cartodb-map div').css('cursor','pointer');
          info.update(data);
      })
      comm_sublayer.on('featureOut', function(e, latlng, pos, data, subLayerIndex){
          $('#cartodb-map div').css('cursor','inherit');
          info.clear();
      })
      comm_sublayer.on('featureClick', function(e, pos, latlng, data){
          map.setZoomAround(latlng, 13);
      })
    }).on('error', function() {
      //log the error
    });
  }

  if (typeof parcel_layer === 'undefined'){
    parcel_layer = cartodb.createLayer(map, parcel_layerUrl)
    .addTo(map)
    .done(function(layer) {
      parcel_sublayer = layer.getSubLayer(0);
      parcel_sublayer.set(parcel_subLayerOptions);
      parcel_sublayer.setInteraction(true);
      parcel_sublayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex){
          $('#cartodb-map div').css('cursor','pointer');
          info.update(data);
      })
      parcel_sublayer.on('featureOut', function(e, latlng, pos, data, subLayerIndex){
          $('#cartodb-map div').css('cursor','inherit');
          info.clear();
      })
      parcel_sublayer.on('featureClick', function(e, pos, latlng, data){
          // console.log(e)
          // console.log(data);
      })

      map.on('zoomend', function(e){
        toggleLayers();
      });
      toggleLayers();
    }).on('error', function() {
      //log the error
    });
  }

  if (typeof comm_sublayer !== 'undefined')
    comm_sublayer.setCartoCSS(map_commarea_css);

  if (typeof parcel_sublayer !== 'undefined')
    parcel_sublayer.setCartoCSS(map_parcel_css);
}

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
  $('#cartodb-map').css('height', (h - offsetTop));
  $('#content').css('height', (h - offsetTop));
}).resize();

$(function() {
  init('drug');

  $('.button').click(function() {
    $('.button').removeClass('selected');
    $(this).addClass('selected');
    init($(this).attr('id'));
  });
});
