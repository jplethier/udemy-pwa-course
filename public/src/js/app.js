
var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayNotification(title, options) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(swreg) {
      swreg.showNotification(title, options)
    })
  }
}

function askForNotificationPermission() {
  Notification.requestPermission(function(result) {
    if (result === 'granted') {
      var options = {
        body: 'You successfully subscribed to our notification service!',
        icon: '/src/images/icons/app-icon-96x96.png',
        image: '/src/images/sf-boat.jpg',
        dir: 'ltr',
        lang: 'en-US',
        vibrate: [100, 50, 200],
        badge: '/src/images/icons/app-icon-96x96.png',
        tag: 'confirm-notification', // works like notification id
        renotify: false,
        actions: [
          {
            action: 'confirm', // action id
            title: 'Okay',
            icon: '/src/images/icons/app-icon-96x96.png'
          },
          {
            action: 'cancel', // action id
            title: 'Cancel',
            icon: '/src/images/icons/app-icon-96x96.png'
          }
        ]
      }
      displayNotification('Successfully subscribed', options);
    }
  })
}

if ('Notification' in window) {
  for (var i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission)
  }
}
