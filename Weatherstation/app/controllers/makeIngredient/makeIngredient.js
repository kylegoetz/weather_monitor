nutritionControllers.controller('MakeIngredientCtrl', ['$scope', 'dbService', function($scope, dbService){
  $scope.title = 'Make Ingredient';
  $scope.nutrients = false;
  $scope.ingredient = {
    name: undefined,
    gm: undefined,
    price: undefined,
    magnitude: undefined,
    unit: undefined
  };
  $scope.save = save;

  function loadNutritionData() {
    dbService.getNutrientList()
      .then(function(nutrients){
        applyNutritionData(nutrients);
      });
  }

  function applyNutritionData(nutrients) {
    _.each(nutrients, function(n) {
      n.inputUnit = undefined;
      n.inputMagnitude = undefined;
    });
    $scope.nutrients = nutrients;
  }

  function save() {
    var toSave = _.filter($scope.nutrients, function(nutrient){
      return angular.isDefined(nutrient['amount']) && nutrient['amount'] > 0;
    });
    dbService.saveIngredient($scope.ingredient, _.map(toSave, function(nutrient){
      return {
        'id': nutrient.id,
        'amount': nutrient.amount,
        'unit': nutrient.unitOrPercent || nutrient.units
      };
    }));
  }

  loadNutritionData();

}]);
