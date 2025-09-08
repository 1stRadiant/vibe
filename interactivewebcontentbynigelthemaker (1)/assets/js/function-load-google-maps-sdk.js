(function(){
function loadGoogleMapsSDK() {
            if (window.google && window.google.maps) {
                console.log("Google Maps SDK already loaded.");
                initializeGoogleServices();
                return;
            }
            if (document.getElementById('google-maps-sdk').src) {
                console.log("Google Maps SDK is already loading.");
                return;
            }

            const script = document.getElementById('google-maps-sdk');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${state.apiKey}&libraries=places&callback=initializeGoogleServices`;
        }
})();
