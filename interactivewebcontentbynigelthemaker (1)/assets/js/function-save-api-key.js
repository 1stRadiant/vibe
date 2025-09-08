(function(){
function saveApiKey() {
            const newApiKey = elements.apiKeyInput.value.trim();
            if (newApiKey) {
                state.apiKey = newApiKey;
                localStorage.setItem('googleMapsApiKey', newApiKey);
                updateApiKeyStatus(true);
                alert('API Key saved successfully!');
                if (!window.google || !window.google.maps) {
                    loadGoogleMapsSDK();
                } else {
                    // If SDK is loaded, re-initialize services with the new key.
                    initializeGoogleServices();
                }
            } else {
                alert('Please enter an API key.');
            }
        }
})();
