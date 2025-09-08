(function(){
function initializeGoogleServices() {
            if (window.google && window.google.maps && window.google.maps.places) {
                autocompleteService = new google.maps.places.AutocompleteService();
                // We need a map instance to initialize PlacesService, but we can use a dummy div.
                const dummyDiv = document.createElement('div');
                placesService = new google.maps.places.PlacesService(dummyDiv);
                geocoder = new google.maps.Geocoder();
                console.log("Google Maps services initialized.");
            } else {
                console.error("Google Maps SDK failed to load correctly.");
                alert("Could not initialize Google Maps services. Address search may not work.");
            }
        }
})();
