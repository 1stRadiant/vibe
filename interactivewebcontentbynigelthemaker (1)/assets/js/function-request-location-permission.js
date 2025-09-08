(function(){
function requestLocationPermission() {
            elements.locationStatus.textContent = "Requesting location permission...";
            elements.locationStatus.className = "location-status location-loading";

            // This will trigger the browser's permission prompt
            getCurrentLocation();
        }
})();
