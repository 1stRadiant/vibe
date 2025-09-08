(function(){
function requestNotificationPermission() {
            elements.notificationBanner.style.display = 'none';
            if (!('Notification' in window)) return;
            
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('paRoad Notifications', {
                        body: 'You will now receive updates on your next stop directly on your device.',
                        tag: 'paRoad-setup'
                    });
                }
            });
        }
})();
