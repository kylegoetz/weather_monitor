(function(){
  angular.module('nutrition').directive('temperatureChart', TempChart);

  function TempChart() {
    return {
      scope: {
        data: '=',
        options: '='
      },
      link: function(scope, element, attrs) {
        var options = {
          chart: {
            type: 'columnrange',
            inverted: true
          },
          title: {
            text: 'Temperature variation by month'
          },
          subtitle: {
            text: 'Observed at home'
          },
          xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          },
          yAxis: {
            title: {
              text: 'Temperature (F)'
            }
          },
          tooltip: {
            valueSuffix: 'F'
          },
          plotOptions: {
            columnrange: {
              dataLabels: {
                enabled: true,
                formatter: function() { return this.y + 'F'; }
              }
            }
          },
          legend: {
            enabled: false
          }
        };
        $(element).highcharts(options);
        scope.$watch('data', function(newVal, oldVal){
          if(  newVal === oldVal  ) return;
          var chart = $(element).highcharts();
          chart.destroy();
          $(element).highcharts($.extend(true, {series:[{data:newVal, name: 'Temperatures'}]}, options));
        });
      }
    };
  }
})();
