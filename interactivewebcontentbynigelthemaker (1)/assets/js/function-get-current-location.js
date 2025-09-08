(function(){
function getCurrentLocation() {
            elements.locationStatus.textContent = "Getting your current location...";
            elements.locationStatus.className = "location-status location-loading";

            if (!navigator.geolocation) {
                elements.locationStatus.textContent = "Geolocation is not supported by your browser";
                elements.locationStatus.className = "location-status location-error";
                elements.requestLocationBtn.style.display = 'inline-block';
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Try to reverse geocode to get address
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        
                        let address = "Current Location";
                        if (data.display_name) {
                            address = data.display_name;
                        }

                        state.startLocation = {
                            address: address,
                            coordinates: [latitude, longitude],
                            notes: ''
                        };

                        elements.startLocationInput.value = address;
                        elements.locationStatus.textContent = "Using your current location for calculation";
                        elements.locationStatus.className = "location-status location-success";
                        elements.requestLocationBtn.style.display = 'none';
                        
                        updateMapMarkers();
                        updateCalculateRouteButton();
                        saveState();
                    } catch (error) {
                        // If reverse geocoding fails, just use coordinates
                        state.startLocation = {
                            address: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                            coordinates: [latitude, longitude],
                            notes: ''
                        };

                        elements.startLocationInput.value = state.startLocation.address;
                        elements.locationStatus.textContent = "Using your current coordinates";
                        elements.locationStatus.className = "location-status location-success";
                        elements.requestLocationBtn.style.display = 'none';
                        
                        updateMapMarkers();
                        updateCalculateRouteButton();
                        saveState();
                    }
                },
                (error) => {
                    let errorMessage = "Unable to retrieve your location";
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Location access denied. Please enable location services in your browser settings.";
                            elements.requestLocationBtn.style.display = 'inline-block';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "Location request timed out.";
                            elements.requestLocationBtn.style.display = 'inline-block';
                            break;
                    }
                    elements.locationStatus.textContent = errorMessage;
                    elements.locationStatus.className = "location-status location-error";
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }
})();
