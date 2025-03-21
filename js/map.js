const mapColors = [
  '#000000',
  '#fee5d9',
  '#fcae91',
  '#fb6a4a',
  '#de2d26',
  '#a50f15',
]

const mapOpacities = [
  0.1,
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
let selectedCategory = 'drug'

function getTooltip(props){
  return '<h4>'+ props['distitle'] + '<br />' + selectedCategory + 'cost: <span class="pull-right">$' + props[selectedCategory + '_cost'].toLocaleString() + '</span></h4>'
}

function getFillColor(layerSource, category){
  let colors = mapColors

  let buckets = geography_buckets[layerSource][category]
  let fillColor = ['step', ['get', category + '_cost']]
  fillColor.push(colors[0])
  for (var i = 1; i < buckets.length; i++) {
    fillColor.push(buckets[i-1], colors[i])
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
  mapboxgl.accessToken = 'pk.eyJ1IjoiZGF0YW1hZGUiLCJhIjoiaXhhVGNrayJ9.0yaccougI3vSAnrKaB00vA'
  const map = new mapboxgl.Map({
      container: 'map',
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
      zoom: 11,
      center: [-87.6656, 41.8650]
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-left')
  map.scrollZoom.disable()

  map.on('load', () => {
    loadSourceFromGzip('/data/mil_dol_blocks_total_by_type_simple.geojson.gz', map, 'blocks')
    loadSourceFromGzip('/data/mil_dol_chicomm_total_by_type.geojson.gz', map, 'community-areas')
  })
}

$(window).resize(function () {
  var h = $(window).height(),
  offsetTop = 60; // Calculate the top offset
  $('#map').css('height', (h - offsetTop))
  $('#content').css('height', (h - offsetTop))
}).resize();

$(function() {
  init(selectedCategory)

  $('.button').click(function() {
    $('.button').removeClass('selected')
    $(this).addClass('selected')
    init($(this).attr('id'))
  })
})
