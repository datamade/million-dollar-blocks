(function(){
    var lastClicked;
    var boundaries;
    var map = L.map('map').fitBounds([[36.970298, -87.495199],[42.5083380000001,-91.5130789999999]]);
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hnmob3j3/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map);
    var info = L.control({position: 'bottomleft'});
    info.onAdd = function(map){
        this._div = L.DomUtil.create('div', 'eitc-info');
        return this._div;
    }
    info.update = function(feature){
        console.log(feature)
        //if (typeof eature !== 'undefined'){
        //    var blob = '<h3>' + councilFeature.properties['COUNCIL_NU'] + '</h3>';
        //    blob += '<p><strong>Hardest Hit properties: </strong>' + councilFeature.properties['COUNT'] + '</p>';
        //    $(this._div).html(blob);
        //} else {
        //    $(this._div).empty();
        //    info.removeFrom(map);
        //}
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
            $('#info').html(featureInfo(feature.properties));
            map.fitBounds(e.target.getBounds());
            lastClicked = e.target;
        });
    }
    function featureInfo(properties){
        var blob = 'Boo!'
        //var blob = '<div><h3>' + properties['FULL_ADDRE'] + '</h3>';
        //blob += '<p><strong>PIN: </strong>' + properties['PIN'] + '</p>';
        //blob += '<p><strong>Deeded Owner: </strong>' + properties['DEEDED_OWN'] + '</p>';
        //blob += '<p><strong>Back Taxes: </strong>' + accounting.formatMoney(properties['BACK_TAXES']) + '</p>';
        //blob += '<p><strong>Property Status: </strong>' + properties['PROPERTY_S'] + '</p>';
        //blob += '<p><strong>Demolition Estimate: </strong>' + accounting.formatMoney(properties['CITY_ESTIM']) + '</p>';
        //blob += '<p><strong>Neighborhood: </strong>' + properties['NEIGHBORHO'] + '</p>';
        //blob += '<p><strong>Council District: </strong>' + properties[' COUNCIL_D'] + '</p>';
        //blob += '</div>';
        return blob
    }
})()
