var deferredPrompt;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function() {
      console.log('service worker registered');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired')
  event.preventDefault();
  deferredPrompt = event;
  return false;
})

// ajax and fetch using examples for reference
// var xhr = new XMLHttpRequest();
// xhr.open('GET', 'https://httpbin.org/ip');
// xhr.responseType = 'json';
// xhr.onload = function() {
//   console.log(xhr.response);
// };

// xhr.onerror = function() {
//   console.log('Error!');
// };

// xhr.send();

// fetch('https://httpbin.org/ip').then(function(response) {
//   console.log(response);
//   return response.json();
// }).then(function(body) {
//   console.log(body);
// }).catch(function(err) {
//   console.log(err);
// });

// fetch('https://httpbin.org/post', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//   },
//   mode: 'cors',
//   body: JSON.stringify({
//     message: 'Does this work?'
//   })
// }).then(function(response) {
//   console.log(response);
//   return response.json();
// }).then(function(body) {
//   console.log(body);
// }).catch(function(err) {
//   console.log(err);
// });
