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
        if (typeof marker !== 'undefined'){
            map.removeLayer(marker);
        }
    })
    google.maps.event.addListener(googleLayer._google, 'idle', function(e){
        map.addLayer(boundaries);
        if (typeof marker !== 'undefined'){
            map.addLayer(marker);
        }
    })
    google.maps.event.addListenerOnce(googleLayer._google, 'idle', function(e){
        var district = $.address.parameter('district');
        if (district && !address){
            boundaries.eachLayer(function(layer){
                if(layer.feature.properties['ILHOUSEDIS'] == district){
                    layer.fire('click');
                }
            })
        }
    })
    var info = L.control({position: 'bottomleft'});
    info.onAdd = function(map){
        this._div = L.DomUtil.create('div', 'info');
        return this._div;
    }

    $.when($.getJSON('data/finished_files/merged_eitc.geojson')).then(
        function(shapes){

            boundaries = L.geoJson(shapes, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);

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

            $.address.parameter('address', encodeURI($('#search_address').val()));
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

    function onEachFeature(feature, layer){
        layer.on('click', function(e){
            if(typeof lastClicked !== 'undefined'){
                boundaries.resetStyle(lastClicked);
            }
            e.target.setStyle({'fillColor':"#90BE44"});
            $('#district-info').html(featureInfo(feature.properties));
            map.fitBounds(e.target.getBounds(), {padding: [50,50]});
            lastClicked = e.target;
            $.address.parameter('district', feature.properties['ILHOUSEDIS'])
        });

        layer.on('mouseover', function(e){
          layer.setStyle({weight: 5})
        });
        layer.on('mouseout', function(e){
          layer.setStyle({weight: 1})
        })

        var labelText = feature.properties['HOUSEREP'] + " (" + feature.properties['PARTY'] + ")<br />Illinois House District " + parseInt(feature.properties['ILHOUSEDIS']);
        layer.bindLabel(labelText);
    }
    function featureInfo(properties){
        var district = parseInt(properties['ILHOUSEDIS']);
        var blob = "<div>\
            <p><a href='index.html'>&laquo; back to State view</a></p>\
            <h3>" + properties['HOUSEREP'] + " (" + properties['PARTY'] + "), Illinois House District " + district + "</h3>\
            <table class='table'>\
              <tbody>\
                  <tr>\
                      <td>Households receiving EITC</td>\
                      <td>" + addCommas(properties['EITC']) + "</td>\
                  </tr>\
                  <tr>\
                      <td>Children in EITC households</td>\
                      <td>" + addCommas(properties['KIDEITC']) + "</td>\
                  </tr>\
              </tbody>\
            </table>\
            <h3>Local Impact</h3>\
            <table class='table'>\
              <thead>\
                  <tr>\
                      <th></th>\
                      <th>Now (10%)</th>\
                      <th>With expansion (20%)</th>\
                  </tr>\
              </thead>\
              <tbody>\
                  <tr>\
                      <td>Average boost to working families' income</td>\
                      <td>" + accounting.formatMoney(properties['AVGEITC10'], {precision: 0}) + "</td>\
                      <td>" + accounting.formatMoney(properties['AVGEITC20'], {precision: 0}) + "</td>\
                  </tr>\
                  <tr>\
                      <td>Annual boost to local economy</td>\
                      <td>" + accounting.formatMoney(properties['MULTEFFECT'], {precision: 2}) + "M</td>\
                      <td>" + accounting.formatMoney(properties['MULTEFF_01'], {precision: 2}) + "M</td>\
                  </tr>\
              </tbody>\
            </table>\
            <p><a class='btn btn-primary' href='docs/EITC Legislative Fact Sheets FINAL " + district + ".pdf'><i class='icon-download'></i> Download district profile</a>\
            <a class='btn btn-primary' href='http://salsa4.salsalabs.com/o/50920/p/dia/action3/common/public/?action_KEY=10927'><i class='icon-bullhorn'></i> Tell your lawmaker EITC works!</a></p>\
            </div>";
        return blob
    }
    function convertToPlainString(text) {
      if (text == undefined) return '';
      return decodeURIComponent(text);
    }

    function addCommas(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
          x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
      }
})()
