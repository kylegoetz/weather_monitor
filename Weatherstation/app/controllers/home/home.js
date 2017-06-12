angular.module('nutrition').controller('HomeCtrl',['$scope', '$rootScope', 'dbService', function($scope, $rootScope, dbService){
  $rootScope.user = 'kylegoetz';
  $scope.entries = [];

  $scope.datacolumns = [{'id':'temperature', 'type':'spline', 'name':'Temperatures'}];
  $scope.datapoints = [];
  //$scope.temperatures = temperatures;
  $scope.datax = {'id':'time'};

  //getData();
  getWindData();
  getRainData();
  getTemperatureData();
  getAnnualTemperatureData();

  $scope.options = {
    axes: {
      x: {
        type: 'date'
      }
    },
    series: [
      {
        y: 'y',
        label: 'Temp (F)'
      }
    ]
  };

  $scope.rainOptions = {
    axes: { x: { type: 'date' } },
    series: [{y:'y', label:'Rainfall', type:'column'}]
  };

  $scope.windOptions = {};
  $scope.windStrengthOptions = {
    title: {
      text: 'Wind Strength'
    }
  };

  function mapTempDataForLineChart(item) {
    return {
      x: item.time,
      y: item.temperature
    };
  }

  //Note: 2.85" of rain corresponds to Rain reading of 51, 0" of rain corresponds to Rain reading of 22
  //How many times did it reset? 2 times
  //what is the top? X
  // (X-22) + X + 51) = 285
  // 2X + 51 - 22 = 285
  // 2X = 285 - 51 + 22
  // 2X = 234 + 22
  // 2X = 256
  // X = 128

  // (X-22) + 2X + 9 = 371
  // 3X - 13 = 371
  // 3X = 384
  // X = 128

  function getData() {
    dbService.getWeatherData()
      .then(function(entries){
        applyEntries(entries);
      });
  }

  function getRainData() {
    dbService.getRainData()
      .then(function(data){
        applyRainData(data);
      });
  }

  function getWindData() {
    var start = new Date();
    start.setDate(start.getDate()-1);
    var directions = [
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
    ];

    dbService.getWindData(start/1000|0).then(function(entries){
      var entriesGroupedByDirection = _.groupBy(entries, function(entry){  return entry.direction;  });
      var directionTotals = _.map(entriesGroupedByDirection, function(entries, index){
        var count = entries.length;
        console.log('Count',count);
        var averageWindSpeed = _.reduce(entries, function(memo, entry){
          return memo + entry.speed;
        }, 0)/entries.length;
        console.log('Avg speed',averageWindSpeed);
        var red = Math.round(150 - averageWindSpeed * 2.56).toString(16);
        return {
          x: _.indexOf(directions, index),
          y: count,
          name: (averageWindSpeed).toString(),
          color: '#' + red + red + 'ff'
        };
      });
      $scope.windData = _.union(_.map(_.reject(directions, function(direction){
        return _.findWhere(directionTotals, {x:_.indexOf(directions, direction)});
      }), function(direction){
        return {
          x: _.indexOf(directions, direction),
          y: 0,
          name: '0',
          color: '#fff'
        };
      }), directionTotals);
      $scope.otherWindData = _.map($scope.windData, function(entry){
        return {
          x: entry.x,
          y: parseFloat(entry.name),
          name: (entry.y).toString(),
          color: entry.color
        };
      });
  });
}

  function getTemperatureData() {
  dbService.getTemperatureData()
    .then(function(entries){
        $scope.tempData = _.map(entries, mapTempDataForLineChart);
    });
  }

  function getAnnualTemperatureData() {
    var yearAgo = new Date();
    yearAgo.setMonth(yearAgo.getMonth() - 12);
    yearAgo.setHours(0,0,0);
    dbService.getTemperatureData(yearAgo/1000|0)
      .then(function(entries){

        var groupedByMonth = _.groupBy(entries, function(entry){
          return entry.time.getMonth();
        });

        var data = _.map(groupedByMonth, function(monthCollection){
          var temps = _.pluck(monthCollection, 'temperature');
          return [
            _.min(temps),
            _.max(temps)
          ];
        });

        $scope.highLowData = _.map(_.extend(_.reduce(_.map(_.reject([0,1,2,3,4,5,6,7,8,9,10,11], function(item){
          return ~_.indexOf(_.map(Object.keys(groupedByMonth), function(item){ return parseInt(item); }), item);
        }), function(item){
          var rv = {};
          rv[item] = [];
          return rv;
        }), function(memo, item){
          console.log(Object.keys(item)[0]);
          memo[Object.keys(item)[0]] = item[Object.keys(item)[0]];
          return memo;
        }, {}), groupedByMonth), function(items){
          if(  items.length === 0  ) return [0,0];
          var temps = _.pluck(items, 'temperature');
          return [
            _.min(temps),
            _.max(temps)
          ];
        });

        //format it to be [[low, high], [low, high], ...] in order of Jan-Dec
      });
  }

  function applyTemperatures(temperatures) {
    var to = [];
    _.each(temperatures, function(t){
        to.push(t);
    });
    $scope.datapoints = to;
  }

  function applyRainData(data) {
    //$scope.rainData = data;
    rainData = _.map(data, function(item, index){
      var change;
      if(  index  ) {
        change = (item.rc - data[index-1].rc + 128) % 128;
      }
      return {
        x: new Date(item.time),
        y: (!index) ? 0 : change
      };
    });
    $scope.rainData = rainData;
  }

  function applyEntries(entries) {
    $scope.entries = entries;

    var rainEntries = _.pluck(entries, 'rain');
    rainEntries = _.map(rainEntries, function(entry){
        return {
            rain: entry.rain,
            time: new Date(entry.time*1000)
        };
    });
    var THRESHOLD = 10000;
    var rain_partitions = [];

    function sliceAt(arr, testFcn) {
        var partitions = [];
        for(i=0; i<arr.length; ++i) {
            new_partition = [];
            new_partition.push(arr[i]);
            for(j=i+1; j<arr.length; ++j) {
                if(  !testFcn(arr[i], arr[j])  ) {
                    i=j-1;
                    break;
                }
                new_partition.push(arr[j]);
                i=j;
            }
            partitions.push(new_partition);
        }
        return partitions;
    }
    rainEntries = sliceAt(rainEntries, function(one,two){
        return one.rain !== two.rain;
    }); //now they are partitioned so it's some rain, some rain, some rain
    //now join if partition[i][-1].time - partition[i+1}[-1].time < THRESHOLD
    //TODO there is an algorithm weakness where if you have [9,9,9,9,9,9,9,9,9,9,9,9,9,.........,9] and then [some brief rain] it will union them
    var joined_partitions = [];
    for(i=0; i<rainEntries.length; ++i) {
        running_union = rainEntries[i];
        for(j=i+1; j<rainEntries.length; ++j) {
            //if running_union, entries j are close
            if(  Math.abs(rainEntries[j][rainEntries[j].length-1].time - running_union[running_union.length-1].time) < THRESHOLD  ) {
                running_union = _.union(running_union, rainEntries[j]);
            } else { //if running_union, entries j are NOT close
                //reset I
                //i = j-1;
                //push running union to joined partitions
                break;
            }
            i = j-1;
        }
        joined_partitions.push(running_union);
    }
    while(  i < rainEntries.length  ) {
        if(  Math.abs(rainEntries[i][rainEntries[i].length-1] - rainEntries[i+1][rainEntries[i+1].length-1]) < THRESHOLD  ) {
            //join
            _.union(running_union, rainEntries[i+1]);
        } else {
            ++i;
        }
    }
  }
}]);
