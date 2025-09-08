(function(){
function checkLocationPermission() {
            if (!navigator.permissions) {
                // Browser doesn't support Permissions API
                elements.locationStatus.textContent = "Location permission status unavailable";
                elements.locationStatus.className = "location-status location-error";
                elements.requestLocationBtn.style.display = 'inline-block';
                return;
            }

            navigator.permissions.query({name: 'geolocation'}).then(permissionStatus => {
                updatePermissionUI(permissionStatus.state);
                
                permissionStatus.onchange = () => {
                    updatePermissionUI(permissionStatus.state);
                };
            }).catch(error => {
                console.error("Error checking location permission:", error);
                elements.locationStatus.textContent = "Error checking location permission";
                elements.locationStatus.className = "location-status location-error";
                elements.requestLocationBtn.style.display = 'inline-block';
            });
        }
})();
