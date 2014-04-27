var app = angular.module("Thumbnail", []);

app.factory('cordovaReady', function($q) {
    var deferred = $q.defer();
    return {
        ready: function() {
                    document.addEventListener(
                        "deviceready",
                        function () {
                            deferred.resolve();
                        },
                        false
                    );
                    return deferred.promise;
                }
    }
});



app.run(['$rootScope', '$location', 'cordovaReady', function($scope, $location, cordovaReady) {
    
    $scope.captureImage = function() {
        
        $scope.mediaCollection = {};
        // $scope.$apply();
        alert('before cap: ' + JSON.stringify($scope.mediaCollection));
        
        function captureSuccess(mediaFiles) {

            alert(JSON.stringify(mediaFiles)); // this shows full mediaFiles are being captured

            var timestamp = new Date().getTime();
            var bundleID = 'Bundle_' + timestamp;
              
            var mediaCollection = {};
            mediaCollection.timestamp = timestamp;
            mediaCollection.bundleID = bundleID;
            mediaCollection.tagged = false;
              
            mediaCollection.filePaths = [];
            mediaCollection.thumbPaths = [];
              
            for (var i in mediaFiles) {
                mediaCollection.filePaths.push(mediaFiles[i].fullPath);
            }

            $scope.mediaCollection = mediaCollection;

            // writeBundle(mediaCollection);  // this all works fine when the backend server code is active

            console.log($scope.mediaCollection, $scope);


            function gotFS(fileSystem) {
                    for (var a in mediaFiles) {
                      alert('file fullpath: ' + mediaFiles[a].fullPath);
                      alert('filesystem URL: ' + fileSystem.root.toURL());
                      window.resolveLocalFileSystemURL(mediaFiles[a].fullPath, function(fileEntry) {
                        fileEntry.file(function(fileObj) {
                            alert(JSON.stringify(fileObj));
                            newimageURI = fileObj.localURL;
                            alert(newimageURI);
                            // if this was retrieving a file I would be calling "gotFileEntry" here instead of an anonymous function
                        },
                        function(error) {
                          alert('get fileEntry error: ' + error.message);  
                        });
                      },
                      function(error) {
                        alert('resolve error: ' + error.message);  // this is called with "undefined" as message
                      });

                      // would be redundant if resolveLocal worked
                      fileSystem.root.getFile(mediaFiles[a].fullPath, {create: false}, gotFileEntry, fail);
                    };              
            }

            function gotFileEntry(fileEntry) {
                    alert('got fileentry');
                    fileEntry.file(gotFile, fail);
            }

            function gotFile(file){
                    alert('got file');
                    resizeFile(file);
            }
               
            function readDataUrl(file) {
                  var reader = new FileReader();
                  reader.onloadend = function(evt) {
                      console.log("Read as data URL");
                      console.log(evt.target.result);
                  };
                  reader.readAsDataURL(file);
            }

            function fail(error) {
                alert(error.code + ': ' + error.message);
            }

            // some code adapted from Stack Overflow... never fires so untested as of yet
            function resizeFile(file) {
                    alert('resize initiated');
                    var reader = new FileReader();
                    reader.onloadend = function(evt) {         
                      alert('read data: ' + evt.target.result);
                      var tempImg = new Image();
                      tempImg.src = file;
                      tempImg.onload = function() {
                          var MAX_WIDTH = 250;
                          var MAX_HEIGHT = 250;
                          var tempW = tempImg.width;
                          var tempH = tempImg.height;
                          if (tempW > tempH) {
                              if (tempW > MAX_WIDTH) {
                                 tempH *= MAX_WIDTH / tempW;
                                 tempW = MAX_WIDTH;
                              }
                          } else {
                              if (tempH > MAX_HEIGHT) {
                                 tempW *= MAX_HEIGHT / tempH;
                                 tempH = MAX_HEIGHT;
                              }
                          }
                   
                          var canvas = document.createElement('canvas');
                          canvas.width = tempW;
                          canvas.height = tempH;
                          var ctx = canvas.getContext("2d");
                          ctx.drawImage(this, 0, 0, tempW, tempH);
                          var dataURL = canvas.toDataURL("image/jpeg");
                   
                          alert('image: ' + JSON.stringify(dataURL));
                      }
                    }
                    reader.readAsDataURL(file);
            }

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
              
            
        };

        // Called if something bad happens.
        //
        function captureError(error) {
            var msg = 'Error ' + error.code + ': ' + error.message;
            alert(msg);
            // $scope.$apply();
        };

        // Launch device camera application,
        // allowing user to capture up to 10 images
        console.log('launching camera from RUN...');
        navigator.device.capture.captureImage(captureSuccess, captureError, {limit: 10});
    }


    // If there is a user logged in, --fire camera-- and go to tag template
    // substituted a true here for the login check

    if (true) {
        // fire camera here, make sure cordova is ready first.
          // alert('found user');
        var promise = cordovaReady.ready();
        promise.then(function() {
          // alert('about to capture');
          console.log('firing capture');
          $scope.captureImage();
          // navigator.splashscreen.hide();
        });
        $scope.$apply();
        $location.url("/#main"); 
    };

}]);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/main', {
        templateUrl: '#main',
        jqmOptions: {transition: 'slide'}
    });

});



app.controller('TemplateController', function($scope, $history, $location) {

    console.log('setting up controller');

    $scope.openCamera = function() {
        // $scope.mediaCollection = {};
        // $scope.$apply();
        // alert(JSON.stringify($scope.mediaCollection));
        $scope.captureImage();

        // ROUTE TO MAIN PAGE
        $location.url("/main");    
    };

});


app.filter('empty', function () {
  return function (collection) {
    // console.log(color, $.Color(color).lightness(.05).toHexString(.05));
    // var rgba = $.Color(color).alpha(.05);

    return (typeof collection.filePaths == "undefined");
  }
})
