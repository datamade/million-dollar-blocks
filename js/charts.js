$(function () {
    $('#top-mdb-chart').highcharts({
        chart: {
            type: 'column',
            backgroundColor: null,
            height: 200
        },
        title:{
            text: '',
            margin: 0
        },
        legend: {
            enabled: false
        },
        xAxis: {
            categories: [   'Austin',
                            'Humboldt Park',
                            'North Lawndale',
                            'West Englewood',
                            'Roseland'
                        ],
            title: {
                text: null
            },
            labels: {
                style: {
                    'font-family': '"Lato", sans-serif',
                    'color': '#E8B19C',
                    'font-size': '.85em'
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
            borderRadius: 0,
            formatter: function() {
                return '$'+commaSeparateNumber(this.y)
            }
        }, 
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    //format: '${y}',
                    formatter: function () {
                        var s = '$<strong>' + Math.round(this.y / 1000000) + '</strong>m'
                        return s
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
            data: [550234592, 292506638, 240683262, 197168151, 159211446]
        }]
    })
})

function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2')
    }
    return val
}