const mapColors = [
  '#000000',
  '#fee5d9',
  '#fcae91',
  '#fb6a4a',
  '#de2d26',
  '#a50f15',
]

const mapOpacities = [
  0.2,
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

let map = null
let infoWindowControl = null
const infoWindowDefaultContent = '<h5><span class="glyphicon glyphicon-hand-up" aria-hidden="true"></span> <span class="desktop-only">hover over</span><span class="mobile-only">tap on</span> blocks to see spending</h5>'
let selectedCategory = 'drug'

class InfoWindowControl {
  onAdd(map) {
    this.map = map
    this.container = document.createElement('div')
    this.container.id = 'info'
    return this.container
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }

  updateContent(content) {
    this.container.innerHTML = content;
  }
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

function updateShading(layerSource, category) {
  map.setPaintProperty(layerSource + '-fills', 'fill-color', getFillColor(layerSource, category))
  map.setPaintProperty(layerSource + '-fills', 'fill-opacity', getLineColor(layerSource, category))
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

  map.on('mousemove', `${layerSource}-fills`, (e) => {
    map.getCanvas().style.cursor = 'pointer'
    const props = e.features[0].properties

    let categoryName = 'Total'
    if (selectedCategory == 'drug')
      categoryName = 'Drug-related'

    if (props['distitle']) {
      info = '<h4>'+ props['distitle'] + "<br />" + categoryName + ' cost: <span class="pull-right">$' + props[selectedCategory + '_cost'].toLocaleString() + '</span></h4>'
    }
    else {
      info = '<h4>'+ categoryName + ' cost: <span class="pull-right">$' + props[selectedCategory + '_cost'].toLocaleString() + '</span></h4>'
    }

    infoWindowControl.updateContent(info)
  })

  map.on('mouseleave', `${layerSource}-fills`, () => {
    infoWindowControl.updateContent(infoWindowDefaultContent)
  })
}

function init(){
  // initiate maplibre map
  map = new maplibregl.Map({
      container: 'map',
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      projection: 'globe',
      zoom: 11,
      center: [-87.6656, 41.8650]
  })

  map.addControl(new maplibregl.NavigationControl(), 'top-left')
  map.scrollZoom.disable()

  infoWindowControl = new InfoWindowControl()
  map.addControl(infoWindowControl, 'bottom-right')
  infoWindowControl.updateContent(infoWindowDefaultContent)

  map.on('load', () => {
    loadSourceFromGzip('/data/mil_dol_blocks_total_by_type_simple.geojson.gz', map, 'blocks')
    loadSourceFromGzip('/data/mil_dol_chicomm_total_by_type.geojson.gz', map, 'community-areas')
  })
}

$(window).resize(function () {
  var h = $(window).height(),
  offsetTop = 60 // Calculate the top offset
  $('#map').css('height', (h - offsetTop))
  $('#content').css('height', (h - offsetTop))
}).resize()

$(function() {
  init(selectedCategory)

  $('.button').click(function() {
    $('.button').removeClass('selected')
    $(this).addClass('selected')
    selectedCategory = $(this).attr('id')
    updateShading('blocks', selectedCategory)
    updateShading('community-areas', selectedCategory)
  })
})
