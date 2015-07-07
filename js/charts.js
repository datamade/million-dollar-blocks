$(function () {
    $('#top-mdb-chart').highcharts({
        chart: {
            type: 'column',
            backgroundColor: null,
            height: 200
        },
        title: {
            text: '$10+ MILLION DOLLAR BLOCKS',
            y: 20,
            floating: true,
            style: {
                'font-family': '"Lato", sans-serif',
                'color': '#E8B19C',
                'font-size': '1.6em'
            }
        },
        subtitle: {
            text: 'city blocks with the highest incarceration spending, 2005-2009',
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
            categories: ['1', '2', '3', '4', '5'],
            title: {
                text: null
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
                    format: '${y}',
                    color: '#fff',
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
            data: [30541828, 16512329, 11599530, 11496630, 11060265, 10484710]
        }]
    });
});