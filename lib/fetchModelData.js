var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/

function fetchModel(url) {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) { // not done
        return;
      }
      
      if (xhr.status !== 200) { // failure
        reject({ status: xhr.status, statusText: xhr.statusText });
        return;
      }

      let response = JSON.parse(xhr.responseText);
      resolve({ data: response });
    };
    xhr.open("GET", url);
    xhr.send();
  });
}

export default fetchModel;
