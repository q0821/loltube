'use strict';
var tagsAPP = angular.module('tagsAPP', []);

tagsAPP.controller('tagsListCtrl', function($scope, $http) {
    $scope.orderby = "name";
    $scope.reverse = false;
    $scope.message = {};
    $scope.formData = {};
    $scope.selectedTagsIdList = [];
    $scope.selectedTagsNameList = [];
    $scope.formData.active = true;
    $scope.recycleState = false;

    $scope.fetchTags = function() {
        if ($scope.recycleState){
           var recycleurl = "/recycle";
        } else {
          var recycleurl = "";
        }
        $http.get('/api/tags'+recycleurl)
            .success(function(data) {
                $scope.tags = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        $scope.clearSelectState();
    }


    // when submitting the add form, send the text to the node API
    $scope.createTag = function() {
        $http.post('/api/tags', $scope.formData)
            .success(function(data) {
                $scope.formData = {
                    _id: data._id,
                    name: data.name,
                    lastModifier: data.lastModifier,
                    lastModified: data.lastModified
                };
                $scope.setmessage('success', 'Success', 'Add Tag : ' + data.name + ' success');
                $scope.tags.unshift($scope.formData);
                $scope.formData = {}; // clear the form so our user is ready to enter another

            })
            .error(function(data) {
                // console.log('Error: ' + data);
                $scope.setmessage('danger', 'Error', 'Add Tag Error : ' + data);

            });
    };

    $scope.copy = function() {
        angular.forEach($scope.selectedTagsNameList, function(value) {
          $scope.formData.name=value;
          $http.post('/api/tags', $scope.formData)
            .success(function(data) {
              $scope.formData = {
                  _id: data._id,
                  name: data.name,
                  lastModifier: data.lastModifier,
                  lastModified: data.lastModified
              };
              console.log('success', 'Success', 'Copy Tag : ' + data.name + ' success');
              $scope.setmessage('success', 'Success', 'Copy Tag : ' + data.name + ' success');
              $scope.tags.unshift($scope.formData);
              $scope.formData = {}; 
            })
            .error(function(data) {
                // console.log('Error: ' + data);
                $scope.setmessage('danger', 'Error', 'Copy Tag Error : ' + data);

            });
      });
      $scope.clearSelectState();
    }

    $scope.del =function(){
      if ($scope.recycleState){
        $scope.delete();
      } else {
        $scope.unactive();
      }

    }

    $scope.unactive = function() {
        var unactiveTag = $scope.selectedTagsIdList.join();
        $http.delete('/api/tags/unactive/' + unactiveTag)
            .success(function(data) {
                var unactiveTagName = $scope.selectedTagsNameList.join();
                $scope.setmessage('success', 'Success', 'Unactive Tag : ' + unactiveTagName + ' success');
                $scope.clearSelectState();
                $scope.fetchTags();
            })
            .error(function(data) {
                // console.log('Error: ' + data);
                $scope.setmessage('danger', 'Error', 'Unactive Tag Error : ' + data);
                $scope.fetchTags();
            });
    }

    $scope.recover = function() {
        var recoverTag = $scope.selectedTagsIdList.join();
        $http.put('/api/tags/recover/' + recoverTag)
            .success(function(data) {
                var recoverTagName = $scope.selectedTagsNameList.join();
                $scope.setmessage('success', 'Success', 'Recover Tag : ' + recoverTagName + ' success');
                $scope.clearSelectState();
                $scope.fetchTags();
            })
            .error(function(data) {
                // console.log('Error: ' + data);
                $scope.setmessage('danger', 'Error', 'Recover Tag Error : ' + data);
                $scope.fetchTags();
            });
    }

    $scope.delete = function() {
        var deleteTag = $scope.selectedTagsIdList.join();
        $http.delete('/api/tags/delete/' + deleteTag)
            .success(function(data) {
                var deleteTagName = $scope.selectedTagsNameList.join();
                $scope.setmessage('success', 'Success', 'Delete Tag : ' + deleteTagName + ' success');
                $scope.clearSelectState();
                $scope.fetchTags();
            })
            .error(function(data) {
                // console.log('Error: ' + data);
                $scope.setmessage('danger', 'Error', 'Delete Tag Error : ' + data);
                $scope.fetchTags();
            });
    }

    $scope.delTag = function() {
        console.log();
    };



    /*
     ** type:primary,success,info,warning,danger
     ** title: string
     ** content: plain text
     */
    $scope.setmessage = function(type, title, content) {
        $scope.message = {
            type: type,
            title: title,
            content: content
        };
    };

    $scope.selectAll = function() {
        $scope.selectedTagsIdList = [];
        $scope.selectedTagsNameList = [];
        if ($scope.selectAllState) {
            angular.forEach($scope.tags, function(value) {
                $scope.selectedTagsIdList.push(value._id);
                $scope.selectedTagsNameList.push(value.name);
            });
        }
    };

    $scope.toggleSelection = function(tagid, tagname) {
        var idx = $scope.selectedTagsIdList.indexOf(tagid);
        // is currently selected
        if (idx > -1) {
            $scope.selectedTagsIdList.splice(idx, 1);
            $scope.selectedTagsNameList.splice(idx, 1);

        }
        // is newly selected
        else {
            $scope.selectedTagsIdList.push(tagid);
            $scope.selectedTagsNameList.push(tagname);
        }
        console.log($scope.selectedTagsIdList);
        console.log($scope.selectedTagsNameList);
    };

    $scope.clearSelectState = function(){
        $scope.selectAllState = false;
        $scope.selectedTagsIdList=[];
        $scope.selectedTagsNameList=[];
    }
});
