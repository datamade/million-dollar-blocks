$(function () {
    $('#top-mdb-chart').highcharts({
        chart: {
            type: 'column',
            backgroundColor: null,
            height: 200
        },
        title: {
            text: 'Community Areas with the Highest Spending',
            y: 20,
            floating: true,
            style: {
                'font-family': '"Lato", sans-serif',
                'color': '#E8B19C',
                'font-size': '1.6em'
            }
        },
        subtitle: {
            text: 'Millions Committed to Incarceration, 2005-2009',
            y: 40,
            floating: true,
            style: {
                'font-family': '"Lato", sans-serif',
                'color': '#E8B19C',
                'font-size': '1.2em'
            }
        },
        legend: {
            enabled: false
        },
        xAxis: {
            categories: [   'Austin',
                            'Humboldt Park',
                            'North Lawndale',
                            'West Englewood',
                            'Roseland',
                            'East Garfield Park'
                        ],
            title: {
                text: null
            },
            labels: {
                style: {
                    'font-family': '"Lato", sans-serif',
                    'color': '#E8B19C'
                }
            },
            lineWidth: 0,
            tickWidth: 0
        },
        yAxis: {
            min: 0,
            title: {
                text: ''            },
            labels: {
                enabled: false
            },
            gridLineWidth: 0,
            endOnTick: true
        },
        tooltip: {
            valuePrefix: '$',
            borderWidth: 0,
            borderRadius: 0
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    //format: '${y}',
                    formatter: function () {
                        var s = '$<strong>' + Math.round(this.y / 1000000) + '</strong> mil';

                        return s;
                    },
                    color: '#E8B19C',
                    inside: true,
                    verticalAlign: 'top',
                    style:{
                        'font-family': '"Lato", sans-serif'
                    }
                },
                borderWidth: 0,
                groupPadding: 0
            },
            series: {
                color: '#A50F15'
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Spending',
            data: [550234592, 292506638, 240683262, 197168151, 159211446, 158354002]
        }]
    });
});