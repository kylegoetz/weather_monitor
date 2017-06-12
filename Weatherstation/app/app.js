(function(){
  var nutrition = angular.module('nutrition', [
  'ngRoute',
  'ui.bootstrap',
  'n3-line-chart',
  'ui-rangeSlider'
]);

var nutritionControllers = angular.module('nutritionControllers', []);

nutrition.config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/home', {
      templateUrl: 'app/controllers/home/home.html',
      controller: 'HomeCtrl'
    })
    .otherwise({
      redirectTo: '/home'
    });
}])

.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-succes',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
.constant('USER_ROLES',{
  all: '*',
  admin: 'admin',
  editor: 'editor',
  guest: 'guest'
});
})();
