(function(){
function updatePermissionUI(state) {
            if (state === 'granted') {
                elements.locationStatus.textContent = "Location permission granted";
                elements.locationStatus.className = "location-status location-success";
                elements.requestLocationBtn.style.display = 'none';
                getCurrentLocation();
            } else if (state === 'prompt') {
                elements.locationStatus.textContent = "Location permission not granted yet";
                elements.locationStatus.className = "location-status";
                elements.requestLocationBtn.style.display = 'inline-block';
            } else if (state === 'denied') {
                elements.locationStatus.textContent = "Location permission denied. Please enable it in browser settings.";
                elements.locationStatus.className = "location-status location-error";
                elements.requestLocationBtn.style.display = 'inline-block';
            }
        }
})();
