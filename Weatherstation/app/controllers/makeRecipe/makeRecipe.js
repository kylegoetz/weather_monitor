(function(){
    nutritionControllers
        .controller('MakeRecipeCtrl', MakeRecipeCtrl);

    MakeRecipeCtrl.$inject = ['$scope', 'dbService'];

    function MakeRecipeCtrl($scope, dbService){
      activate();

      ///////////////////

      function activate() {
        $scope.title = 'New Recipe';
        $scope.results = [];
        $scope.updateResults = updateResults;

        loadNutritionData();
      }

      function loadNutritionData() {
        dbService.getNutrientList()
          .then(function(nutrients){
            applyNutritionData(nutrients.nutrients);
          });
      }

      function applyNutritionData(nutrients) {
        $scope.nutrients = nutrients;
      }

      function updateResults(typed) {
        dbService.searchIngredients(1, typed)
          .then(function(ingredientResults){
            dbService.searchRecipes(1, typed)
              .then(function(recipeResults){
                $scope.results = _.union(recipeResults, ingredientResults);
              });
          });

      }
   }
})();
