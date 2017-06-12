nutritionControllers.controller('ViewRecipesCtrl', ['$scope','dbService', function($scope, dbService){
  $scope.title = "Recipe List";

  function loadRecipeList() {
    dbService.getRecipeList($scope.user)
      .then(function(data){
        applyRecipeData(data);
      });
  }

  function applyRecipeData(recipes) {
    $scope.recipes = recipes;
  }

  loadRecipeList();
}]);
