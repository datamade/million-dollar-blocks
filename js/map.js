(function(){
    var lastClicked;
    var boundaries;
    var marker;
    var map = L.map('map')
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
        '#006d2c',
        '#31a354',
        '#74c476',
        '#a1d99b',
        '#c7e9c0'
    ]

    var jenks_cutoffs = []
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = jenks_cutoffs,
            labels = [],
            from, to;

        for (var i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];
            labels.push(
                '<i style="background-color:' + getColor(from + 0.01) + '"></i> ' +
                from + (to ? '&ndash;' + to + "%" : "%" + '+'));
        }

        div.innerHTML = "<div><strong>EITC percent</strong><br>" + labels.join('<br>') + '</div>';
        return div;
    };
    $.when($.getJSON('data/finished_files/merged_eitc.geojson')).then(
        function(shapes){
            var all_values = []
            $.each(shapes.features, function(k, v){
                all_values.push(v.properties['PCTEITC'] * 100);
            });
            jenks_cutoffs = jenks(all_values, 4);
            jenks_cutoffs[0] = 0; // ensure the bottom value is 0
            jenks_cutoffs.pop(); // last item is the max value, so dont use it

            boundaries = L.geoJson(shapes, {
                style: style,
                onEachFeature: boundaryClick
            }).addTo(map);
            legend.addTo(map);
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
        });

    function style(feature){
        var style = {
            "color": "white",
            "fillColor": getColor(feature.properties['PCTEITC'] * 100),
            "opacity": 0.4,
            "weight": 1,
            "fillOpacity": 0.6,
        }
        return style;
    }

    // get color depending on condition_title
    function getColor(d) {
        return  d >= jenks_cutoffs[3] ? map_colors[0] :
                d >= jenks_cutoffs[2] ? map_colors[1] :
                d >= jenks_cutoffs[1] ? map_colors[2] :
                d >= jenks_cutoffs[0] ? map_colors[3] :
                                        map_colors[4];
    }

    function boundaryClick(feature, layer){
        layer.on('click', function(e){
            if(typeof lastClicked !== 'undefined'){
                boundaries.resetStyle(lastClicked);
            }
            e.target.setStyle({'fillColor':"#762a83"});
            //info.update(feature);
            $('#district-info').html(featureInfo(feature.properties));
            map.fitBounds(e.target.getBounds());
            lastClicked = e.target;
        });
        //layer.on('mouseover', function(e){
        //    info.addTo(map);
        //    info.update(feature);
        //});
        //layer.on('mouseout', function(e){
        //    info.update();
        //})
    }
    function featureInfo(properties){
        var blob = '<div>\
            <h3>District ' + parseInt(properties['ILHOUSEDIS']) + '</h3>\
            <table>\
              <tbody>\
                <tr>\
                    <td>Representative</td>\
                    <td>' + properties['HOUSEREP'] + '</td>\
                </tr>\
                <tr>\
                    <td>EITC returns</td>\
                    <td>' + properties['EITC'] + ' (' + Math.round(properties['PCTEITC'] * 100) + '%)</td>\
                </tr>\
                <tr>\
                    <td>Party</td>\
                    <td>' + properties['PARTY'] + '</td>\
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
})()
