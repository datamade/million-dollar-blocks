(function(){
    var lastClicked;
    var boundaries;
    var map = L.map('map').fitBounds([[36.970298, -87.495199],[42.5083380000001,-91.5130789999999]]);
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hnmob3j3/{z}/{x}/{y}.png', {
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
    $.when($.getJSON('data/finished_files/merged_eitc.geojson')).then(
        function(shapes){
            boundaries = L.geoJson(shapes, {
                style: style,
                onEachFeature: boundaryClick
            }).addTo(map);
        }
    );
    function style(feature){
        var style = {
            "color": "#000",
            "opacity": 0.5,
            "weight": 1,
            "fillOpacity": 0.3,
        }
        //if (feature.properties['COUNT'] < 90){
        //    style['fillColor'] = "#a6dba0"
        //}
        //if (feature.properties['COUNT'] > 90 && feature.properties['COUNT'] < 200){
        //    style['fillColor'] = "#5aae61";
        //}
        //if (feature.properties['COUNT'] > 200){
        //    style['fillColor'] = "#1b7837";
        //}
        return style;
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
        var blob = '<div><h3>District ' + parseInt(properties['ILHOUSEDIS']) + '</h3>';
        blob += '<p><strong>Representative: </strong>' + properties['HOUSEREP'] + ' (' + properties['PARTY'] + ')</p>';
        blob += '<p><strong>EITC Returns: </strong>' + properties['EITC'] + ' (' + Math.round(properties['PCTEITC'] * 100) + '%)</p>';
        //blob += '<p><strong>: </strong>' + accounting.formatMoney(properties['BACK_TAXES']) + '</p>';
        //blob += '<p><strong>Property Status: </strong>' + properties['PROPERTY_S'] + '</p>';
        //blob += '<p><strong>Demolition Estimate: </strong>' + accounting.formatMoney(properties['CITY_ESTIM']) + '</p>';
        //blob += '<p><strong>Neighborhood: </strong>' + properties['NEIGHBORHO'] + '</p>';
        //blob += '<p><strong>Council District: </strong>' + properties[' COUNCIL_D'] + '</p>';
        blob += '</div>';
        return blob
    }
})()
