angular.module('nutrition').service('dbService', ['$http', '$q', function($http, $q){
  return({
    getWeatherData: getWeatherData,
    getRainData: getRainData,
    getTemperatureData: getTemperatureData,
    getWindData: getWindData
  });

  function getWeatherData() {
    var request = $http({
        method: 'get',
        url: 'api/v1.0/weather_entry',
        responseType: 'json',
    });
    return(  request.then(handleSuccess, handleError)  );
  }

  function getRainData() {
    var request = $http({
        method: 'get',
        url: 'api/v1.0/rain',
        responseType: 'json'
    });
    return(  request.then(handleSuccess, handleError)  );
  }

  function getWindData(start, end) {
    var request = $http({
      method: 'get',
      url: 'api/v1.0/wind' + (start?'/'+(start).toString():''),
      responseType: 'json'
    });
    return request.then(handleWindSuccess, handleError);
  }

  function handleWindSuccess(response) {
    return _.map(response.data, function(item){
      return {
        time: new Date(item.time*1000),
        direction: item.direction,
        speed: item.speed
      };
    });
  }

  function getTemperatureMinMaxData(start, end) {
    if(  !start  ) {
      start = new Date();
      start.setMonth(start.getMonth()-12);
      start = (start/1000)|0;
    }
    var request = $http({
      method: 'get',
      url: 'api/v1.0/temperature_range/' + start + (end ? '/'+end:''),
      responseType: 'json'
    });
    return(  request.then(handleTempMinMaxSuccess, handleError)  );
  }
  function handleTempMinMaxSuccess(response) {
    return _.map(response.data, function(item){
      return {
        time: new Date(item.time),
        temperature: item.temperature
      };
    });
  }

  function getTemperatureData(start, end) {
    if(  !start  ) {
      start = new Date();
      start.setMonth(start.getMonth()-1);
      start = (start/1000)|0;
    }
    var request = $http({
        method: 'get',
        url: 'api/v1.0/temperature/' + start + (end ? '/'+end:''),
        responseType: 'json'
    });
    return(  request.then(handleTemperatureSuccess, handleError)  );
  }

  function handleTemperatureSuccess(response){
    return _.map(response.data, dateify);

    function dateify(item) {
      return {
        time: new Date(item.time),
        temperature: item.temperature
      };
    }
  }

  function handleSuccess(response) {
    return(  response.data  );
  }

  function handleError(response) {
    /*
     * The response should be returned in a normalized format. However,
     * if the request was not handled by the server (or what not handles
     * properly - ex. server error), then we may have to normalize it on
     * our end, as best we can.
     */
    if(  !angular.isObject(response.data) || !response.data.message  ) {
      return(  $q.reject('An unknown error occurred')  );
    }
    return(  $q.reject(response.data.message)  );
  }

}]);
