(function(){
function getUpdatedCurrentLocation() {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    return reject("Geolocation is not supported by your browser");
                }

                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                            const data = await response.json();
                            let address = data.display_name || `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
                            const locationData = {
                                address: address,
                                coordinates: [latitude, longitude],
                                notes: state.startLocation?.notes || '' // preserve notes if possible
                            };
                            resolve(locationData);
                        } catch (error) {
                            // If reverse geocoding fails, just use coordinates
                            const locationData = {
                                address: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                                coordinates: [latitude, longitude],
                                notes: state.startLocation?.notes || ''
                            };
                            resolve(locationData);
                        }
                    },
                    (error) => {
                        let errorMessage = "Unable to retrieve your location";
                        switch(error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = "Location access denied. Please enable location services in your browser settings.";
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = "Location information unavailable.";
                                break;
                            case error.TIMEOUT:
                                errorMessage = "Location request timed out.";
                                break;
                        }
                        reject(errorMessage);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            });
        }
})();
