var Util = {};
Util.bind = function(scope, fn, arguments) {
  return function() {
      fn.apply(scope, arguments);
  };
};

/*
* Preloads a given amount of image URLs.
* Uses given array reference to store.
* @param
*      urlArr: Array of image URLs to preload
*      imageArrayRef: Array reference to store to
*/
Util.preloadImages = function(urlArr, imageArrayRef) {
  var prelImgsLength = imageArrayRef.length;
  for (i = 0; i < urlArr.length; i++) {
      imageArrayRef[prelImgsLength+i] = document.createElement("img");
      imageArrayRef[prelImgsLength+i].src = urlArr[i];
  }
};

Util.regEscape = function(s, arr) {
  var result = s, o;

    for( var i=0, l=arr.length; i<l; i++ ) {
      o = arr[i];
      if( o.regEx && o.value ) {
        result = result.replace(o.regEx, o.value);
      }
    }

    return result;
};
