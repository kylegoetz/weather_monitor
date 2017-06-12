nutritionControllers.controller('ViewIngredientCtrl', ['$scope', 'dbService', 'id', function($scope, dbService, id) {

  $scope.title = 'View Ingredient';
  $scope._ = _;
  $scope.log = console.log;
  window.scope = $scope;
  $scope.selectedWeight = 0;
  //$scope.weights = [];

  function loadNutritionData() {
    dbService.getNutrientList()
      .then(function(nutrients){
        applyNutritionData(nutrients);
      });
  }

  function loadIngredient(id) {
    dbService.getIngredient(id)
      .then(function(ingredient) {
        applyIngredient(ingredient);
      });
  }

  function applyNutritionData(nutrients) {
    $scope.nutrients = nutrients;
  }

  function applyIngredient(ingredient) {
    $scope.ingredient = ingredient;
    $scope.weights = ingredient.weights;
    $scope.selectedWeight = "0";
    //$scope.hGmPortions = $scope.weights[parseInt($scope.selectedWeight)]['100gmPortions'];
    $scope.hGmPortions = $scope.weights[parseInt($scope.selectedWeight)]['conversion_factor'];
    $scope.nutrients = ingredient.nutrient_data;
  }

  $scope.weightChange = function() {
    $scope.hGmPortions = $scope.weights[parseInt($scope.selectedWeight)]['conversion_factor'];
  };

  //loadNutritionData();
  loadIngredient(id);

  $scope.$watch('selectedWeight', function(newVal, oldVal) {
    if(newVal !== undefined && newVal !== null) {
      console.log($scope.selectedWeight, newVal, oldVal);
      $scope.hGmPortions = $scope.weights[parseInt($scope.selectedWeight)]['conversion_factor'];
    }
  });

}]);
