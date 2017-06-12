//(function(){
    angular
        .module('nutrition')
        .directive('d3LineChart', d3LineChart);
    d3LineChart.$inject = [];
    function d3LineChart() {
        return {
            //restrict: 'A',
            template: '',
            scope: {
                data: '=d3Data'
            },
            link: link
        };
    }

    ////

    function link(scope, element, attrs) {
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var parseDate = d3.time.format("%d-%b-%y");

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.close); });

        //var svg = d3.select("body").append("svg")
        //var svg = d3.select(element).append('svg')
        var svg = element.append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        scope.$watch('data', function(newVal, oldVal){
            if(  angular.isDefined(newVal)  ) {
                console.log('data changed:',newVal,oldVal)
                _.each(newVal, function(datum){
                    datum.time = parseDate(new Date(datum.time*1000));
                });
                x.domain(d3.extent(newVal, function(d) { return d.time; }));
                y.domain(d3.extent(newVal, function(d) { return d.rc; }));
            }
        });
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Price ($)");

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
    }
//})();