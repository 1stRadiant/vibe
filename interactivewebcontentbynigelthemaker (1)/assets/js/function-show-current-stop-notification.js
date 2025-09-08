(function(){
async function showCurrentStopNotification(stop) {
            if (!('Notification' in window) || Notification.permission !== 'granted') {
                return;
            }

            const title = `Next Stop: ${stop.address.split(',')[0]}`;
            const options = {
                body: stop.address,
                tag: 'current-stop-notification', // Replaces any existing notification with the same tag
                renotify: true, // Notifies user even if a notification with same tag exists
                requireInteraction: true, // Makes notification persistent on some platforms (e.g., desktop)
            };
            
            try {
                // Ensure service worker is ready before showing notification
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.showNotification(title, options);
                } else {
                     new Notification(title, options); // Fallback for when SW not available
                }
            } catch (err) {
                console.error('Notification error:', err);
                new Notification(title, options); // Fallback to basic notification
            }
        }
})();
