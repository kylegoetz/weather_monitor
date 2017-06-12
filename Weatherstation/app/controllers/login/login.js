nutritionControllers.controller('LoginCtrl', ['$rootScope','$scope','$modalInstance',function($rootScope, $scope, $modalInstance){
  $scope.credentials = {
    username: '',
    password: ''
  };

  $scope.evaluate(credentials) { //We pass credentials to make it easier to unit test

  }

  $scope.login = function() {
    $modalInstance.close($scope.credentials)
  };
}]);
