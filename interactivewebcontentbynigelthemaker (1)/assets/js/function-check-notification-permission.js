(function(){
function checkNotificationPermission() {
            if (!('Notification' in window)) {
                console.log("This browser does not support desktop notification");
                return;
            }

            if (Notification.permission === 'default') {
                elements.notificationBanner.style.display = 'block';
            } else {
                elements.notificationBanner.style.display = 'none';
            }
        }
})();
