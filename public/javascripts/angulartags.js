var tagsAPP = angular.module('tagsAPP', []);

tagsAPP.controller('tagsListCtrl', function ($scope, $http) {
    $scope.formData = {};
    $http.get('/api/tags')
        .success(function(data) {
            $scope.tags = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createTag = function() {
        $http.post('/api/tags', $scope.formData)
            .success(function(data) {
                $scope.formData._id  =data._id;
                $scope.formData.lastModifier  ='system';
                $scope.formData.lastModified = Date.now();
                $scope.tags.unshift($scope.formData);
                $scope.formData = {}; // clear the form so our user is ready to enter another
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };
    $scope.delTag = function() {
        console.log();
    };
    
});