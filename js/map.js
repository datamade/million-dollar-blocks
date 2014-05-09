(function(){
    var lastClicked;
    var boundaries;
    var marker;
    var map = L.map('map', {minZoom: 6})
        .fitBounds([[36.970298, -87.495199],[42.5083380000001,-91.5130789999999]]);
    var googleLayer = new L.Google('ROADMAP', {animate: false});
    map.addLayer(googleLayer);
    map.on('zoomstart', function(e){
        map.removeLayer(boundaries);
    })
    google.maps.event.addListener(googleLayer._google, 'idle', function(e){
        map.addLayer(boundaries);
    })
    //L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hn83a654/{z}/{x}/{y}.png', {
    //    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    //}).addTo(map);
    var info = L.control({position: 'bottomleft'});
    info.onAdd = function(map){
        this._div = L.DomUtil.create('div', 'info');
        return this._div;
    }
    info.update = function(feature){
        if (typeof feature !== 'undefined'){
            $(this._div).html(featureInfo(feature.properties));
        } else {
            $(this._div).empty();
            info.removeFrom(map);
        }
    }

    var map_colors = [
        '#e41a1c',
        '#377eb8',
        '#4daf4a',
        '#984ea3',
        '#ff7f00',
        '#ffff33'
    ]

    $.when($.getJSON('data/finished_files/merged_eitc.geojson')).then(
        function(shapes){
            
            boundaries = L.geoJson(shapes, {
                style: style,
                onEachFeature: boundaryClick
            }).addTo(map);

            var district = $.address.parameter('district');
            if (district && !address){
                boundaries.eachLayer(function(layer){
                    if(layer.feature.properties['ILHOUSEDIS'] == district){
                        layer.fire('click');
                    }
                })
            }
        }
    );

    $('#search_address').geocomplete()
        .bind('geocode:result', function(event, result){
            if (typeof marker !== 'undefined'){
                map.removeLayer(marker);
            }
            var lat = result.geometry.location.lat();
            var lng = result.geometry.location.lng();
            marker = L.marker([lat, lng]).addTo(map);
            map.setView([lat, lng], 17);
            var district = leafletPip.pointInLayer([lng, lat], boundaries);
            if (result.types.indexOf('street_address') >= 0){
                $.address.parameter('address', encodeURI(result.formatted_address));
            } else {
                $.address.parameter('address', encodeURI(result.name));
            }
            district[0].fire('click');
        });

    var address = convertToPlainString($.address.parameter('address'));
    if(address){
        $("#search_address").val(address);
        $('#search_address').geocomplete('find', address)
    }

    function style(feature){
        var style = {
            "color": "white",
            "fillColor": "#0570b0",
            "opacity": 1,
            "weight": 1,
            "fillOpacity": 0.6,
        }
        return style;
    }

    // get color depending on condition_title
    function getColor(d) {
        return map_colors[(d % map_colors.length)];
    }

    function boundaryClick(feature, layer){
        layer.on('click', function(e){
            if(typeof lastClicked !== 'undefined'){
                boundaries.resetStyle(lastClicked);
            }
            e.target.setStyle({'fillColor':"#762a83"});
            $('#district-info').html(featureInfo(feature.properties));
            map.fitBounds(e.target.getBounds());
            lastClicked = e.target;
            $.address.parameter('district', feature.properties['ILHOUSEDIS'])
        });

        layer.on('mouseover', function(e){
          layer.setStyle({weight: 5})
        });
        layer.on('mouseout', function(e){
          layer.setStyle({weight: 1})
        })
    }
    function featureInfo(properties){
        var blob = '<div>\
            <h3>District ' + parseInt(properties['ILHOUSEDIS']) + '</h3>\
            <table>\
              <tbody>\
                <tr>\
                    <td>Representative</td>\
                    <td>' + properties['HOUSEREP'] + ' (' + properties['PARTY'] + ')' + '</td>\
                </tr>\
                <tr>\
                    <td>State EITC returns (2012)</td>\
                    <td>' + properties['EITC'] + ' (' + Math.round(properties['PCTEITC'] * 100) + '%)</td>\
                </tr>\
                <tr>\
                    <td>EITC 10% (current)</td>\
                    <td>' + properties['AVGEITC10'] + '</td>\
                </tr>\
                <tr>\
                    <td>EITC 20% (expanded)</td>\
                    <td>' + properties['AVGEITC20'] + '</td>\
                </tr>\
                <tr>\
                    <td>ETIC multiplier</td>\
                    <td>' + accounting.formatMoney(properties['MULTEFFECT']) + 'M</td>\
                </tr>\
              </tbody>\
            </table>\
            </div>';
        return blob
    }
    function convertToPlainString(text) {
      if (text == undefined) return '';
      return decodeURIComponent(text);
    }
})()
