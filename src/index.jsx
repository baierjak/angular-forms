import angular from 'angular';
import './styles/global.scss';

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBmo759gne_KNceR4nHlQiRXySofOoTZ5I",
    authDomain: "dochazka-d9e85.firebaseapp.com",
    databaseURL: "https://dochazka-d9e85.firebaseio.com",
    storageBucket: "dochazka-d9e85.appspot.com",
    messagingSenderId: "860931572904"
};
firebase.initializeApp(config);

firebase.database().ref('/data').set({
    tomas: "50hod",
    tereza: "30hod"
});

var starCountRef = firebase.database().ref('/data');
starCountRef.on('value', function(snapshot) {
    console.log(snapshot.val());
    //updateStarCount(postElement, snapshot.val());
});


export const helouFunc = () => {
  console.log("hej");
}
helouFunc();


angular.module ('app', []);
angular.module('app').controller('formCtrl', function ($scope, $http, $parse) {
    $scope.master = {};
    

    $scope.update = function(user) {
        $scope.master = angular.copy(user);
    };

    $scope.reset = function(form) {
        if (form) {
            form.$setPristine();
            form.$setUntouched();
        }
        $scope.user = angular.copy($scope.master);
    };

    $scope.agreeChanged = function() {
        console.log($scope.user.agree);
    };

    $scope.submit = function(){
          var serverResponse = pretendThisIsOnTheServerAndCalledViaAjax();

          for (var fieldName in serverResponse) {
              var message = serverResponse[fieldName];
              
              var serverMessage = $parse('myForm.'+fieldName+'.$error.serverMessage');

              if (message == 'VALID') {
                  $scope.myForm.$setValidity(fieldName, true, $scope.myForm);
                  serverMessage.assign($scope, undefined);
              }
              else {
                  $scope.myForm.$setValidity(fieldName, false, $scope.myForm);
                  serverMessage.assign($scope, serverResponse[fieldName]);
              }
          }
      };

      var pretendThisIsOnTheServerAndCalledViaAjax = function(){
          var fieldState = {firstName: 'VALID', lastName: 'VALID'};
          var allowedNames = ['Bob', 'Jill', 'Murray', 'Sally'];

          if (allowedNames.indexOf($scope.firstName) == -1) fieldState.firstName = 'Allowed values are: ' + allowedNames.join(',');
          if ($scope.lastName == $scope.firstName) fieldState.lastName = 'Your last name must be different from your first name';

          return fieldState;
      };

    $scope.reset();
});
