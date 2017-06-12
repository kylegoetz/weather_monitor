nutritionControllers.controller('ViewRecipeCtrl', ['$scope', '$modal', 'dbService', '$routeParams', function($scope, $modal, dbService, $routeParams){
  $scope.title = 'Recipe';
  $scope.unit = '';
  $scope.magnitude = 0;
  $scope.id = $routeParams.id;

  $scope.viewIngredient = function(id) {
    $modal.open({
      templateUrl: '/app/controllers/viewIngredient/viewIngredient.html',
      controller: 'ViewIngredientCtrl',
      size: 'lg',
      resolve: {
        id: function() {
          return id;
        }
      }
    });
  };

  function loadRecipe() {
    dbService.getRecipe($scope.user, $scope.id)
      .then(function(recipe){
        applyRecipeData(recipe);
      });
  }

  function applyRecipeData(recipe) {
    $scope.recipe = recipe;
    $scope.title = recipe.name;
    $scope.unit = recipe.unit;
    $scope.magnitude = recipe.amount;
    $scope.ingredients = recipe.ingredients;
  }

  loadRecipe();
}]);
