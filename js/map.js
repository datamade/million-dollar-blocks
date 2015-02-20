(function(){
    var lastClicked;
    var blocksLayer;
    var map = L.map('map', {
        center: [41.83887416186901, -87.87139892578125],
        zoom: 9,
        scrollWheelZoom: false
    })
    // var googleLayer = new L.Google('ROADMAP', {animate: false});
    // map.addLayer(googleLayer);
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hn83a654/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map);
    var info = L.control({position: 'bottomleft'});
    info.onAdd = function(map){
        this._div = L.DomUtil.create('div', 'info');
        return this._div;
    }

    var fields = 'geoid10,total_cost,cartodb_id'

    var layerOpts = {
        user_name: 'datamade',
        type: 'cartodb',
        cartodb_logo: false,
        sublayers: [
            {
                sql: "select * from mil_dol_blocks_total",
                cartocss: '#mil_dol_blocks_total{polygon-fill:#000;line-color:#000;line-width:1;}',
                interactivity: fields
            }
        ]
    }

    cartodb.createLayer(map, layerOpts)
      .addTo(map)
      .done(function(layer){
          console.log(layer)
          blocksLayer = layer.getSubLayer(0);
          blocksLayer.setInteraction(true);
          blocksLayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
            $('#map div').css('cursor','pointer');
            // LargeLots.info.update(data);
          });
          blocksLayer.on('featureOut', function(e, latlng, pos, data, subLayerIndex) {
            $('#map div').css('cursor','inherit');
            //LargeLots.info.clear();
          });
          blocksLayer.on('featureClick', function(e, pos, latlng, data){
            //LargeLots.getOneParcel(data['display_pin']);
            console.log(data);
          });
      }).error(function(e){console.log(e)});

    //$('#search_address').geocomplete()
    //    .bind('geocode:result', function(event, result){
    //        if (typeof marker !== 'undefined'){
    //            map.removeLayer(marker);
    //        }
    //        var lat = result.geometry.location.lat();
    //        var lng = result.geometry.location.lng();
    //        marker = L.marker([lat, lng]).addTo(map);
    //        map.setView([lat, lng], 17);
    //        var district = leafletPip.pointInLayer([lng, lat], boundaries);

    //        $.address.parameter('address', encodeURI($('#search_address').val()));
    //        district[0].fire('click');
    //    });

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
                      <td>" + accounting.formatMoney(properties['KIDAVGEITC'], {precision: 0}) + "</td>\
                      <td>" + accounting.formatMoney(properties['KIDAVGE_01'], {precision: 0}) + "</td>\
                  </tr>\
                  <tr>\
                      <td>Annual boost to local economy</td>\
                      <td>" + accounting.formatMoney(properties['MULTEFFECT'], {precision: 2}) + "M</td>\
                      <td>" + accounting.formatMoney(properties['MULTEFF_01'], {precision: 2}) + "M</td>\
                  </tr>\
              </tbody>\
            </table>\
            <div class='col-lg-6'>\
              <p><a target='_blank' class='btn btn-primary' href='docs/EITC Legislative Fact Sheets FINAL " + district + ".pdf'><i class='icon-download'></i> Download district profile</a></p>\
              <p><a target='_blank' href='docs/EITC Legislative Fact Sheets FINAL " + district + ".pdf'><img class='img-responsive img-rounded' src='images/eitc_factsheet.png' alt='EITC Factsheet' /></a></p>\
            </div>\
            <div class='col-lg-6'>\
              <a class='btn btn-primary' target='_blank' href='http://salsa4.salsalabs.com/o/50920/p/dia/action3/common/public/?action_KEY=10927'><i class='icon-bullhorn'></i> Tell your lawmaker EITC Works!</a>\
            </div>\
            <div class='clearfix'></div>\
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
