(function(){
  angular.module('nutrition').directive('windRoseChart', WindRoseChart);

  WindRoseChart.$inject = [];

  function WindRoseChart() {
    return {
      //template: template,
      scope: {
        data: '=',
        options: '='
      },
      link: link
    };

    function link(scope, element, attrs) {
      var options = {
        title: {
          text: (scope.options.title && scope.options.title.text) ? scope.options.title.text : 'Wind Freq.'
        },
        chart: {
          polar: true,
          type: 'column',
          width: 300
        },
        legend: {
          enabled: false
        },
        xAxis: {
          categories: [
            'N',
            'NNW',
            'NW',
            'WNW',
            'W',
            'WSW',
            'SW',
            'SSW',
            'S',
            'SSE',
            'SE',
            'ESE',
            'E',
            'ENE',
            'NE',
            'NNE'
          ]
        },
        yAxis: {
          min: 0,
        },
        pane: {
          startAngle: -11
        },
        plotOptions: {
          column: {
            pointPadding: 0
          }
        }
      };

      $(element).highcharts(options);

      scope.$watch('data', function(newVal, oldVal) {
        if(  newVal === oldVal  ) return;
        var chart = $(element).highcharts();
        chart.destroy();
        $(element).highcharts($.extend(true, {series:[{data:newVal, name: 'Wind'}]}, options));
      });
      scope.$on('$destroy', function(){
        $(element).highcharts().destroy();
      });
    }
  }
})();
