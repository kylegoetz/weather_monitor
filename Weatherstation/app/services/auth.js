nutrition.factory('AuthService', function($http, Session) {
  var authService = {};
  authService.login = function(credentials) {
    return $http.post('/login', credentials)
      .then(function(response){
        Session.create(response.data.id,
          response.data.user.id,
          response.data.user.role);
        return response.data.user;
      });
  };

  authService.isAuthenticated = function() {
    return !!Service.userId;
  };

  authService.isAuthorized = function(authorizedRoles) {
    if(  !angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
  };

  return authService;
})
.service('Session',function(){
  this.create = function(sessionId, userId, userRole) {
    this.id = sessionId;
    this.userId = userId;
    this.userRole = userRole;
  };
  this.destroy = function() {
    this.id = null;
    this.userId = null;
    this.userRole = null;
  };
  return this;
});
