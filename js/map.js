(function(){
    var lastClicked;
    var boundaries;
    var map = L.map('map').fitBounds([[36.970298, -87.495199],[42.5083380000001,-91.5130789999999]]);
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hn83a654/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map);
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
        '#c7e9c0',
        '#a1d99b',
        '#74c476',
        '#31a354',
        '#006d2c'
    ]

    var jenks_cutoffs = []
    $.when($.getJSON('data/finished_files/merged_eitc.geojson')).then(
        function(shapes){
            boundaries = L.geoJson(shapes, {
                style: style,
                onEachFeature: boundaryClick
            }).addTo(map);

            var all_values = []
            boundaries.eachLayer(function(s){
                all_values.push(s.feature.properties['PCTEITC'] * 100);
            });
            jenks_cutoffs = jenks(all_values, 4);
            jenks_cutoffs[0] = 0; // ensure the bottom value is 0
            jenks_cutoffs.pop(); // last item is the max value, so dont use it
            console.log(jenks_cutoffs);

            //set the color style here!!
        }
    );
    function style(feature){
        var style = {
            "color": getColor(feature.properties['PCTEITC'] * 100),
            "opacity": 0.5,
            "weight": 1,
            "fillOpacity": 0.3,
        }
        return style;
    }

    // get color depending on condition_title
    function getColor(d) {
        console.log(d)
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
            info.update(feature);
            map.fitBounds(e.target.getBounds());
            lastClicked = e.target;
        });
        layer.on('mouseover', function(e){
            info.addTo(map);
            info.update(feature);
        });
        layer.on('mouseout', function(e){
            info.update();
        })
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
