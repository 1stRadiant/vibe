(function(){
async function handleLocationInput(inputElement, suggestionsElement, isStartLocation) {
            const query = inputElement.value.trim();
            suggestionsElement.innerHTML = '';
            suggestionsElement.style.display = 'none';

            if (isStartLocation) {
                if (state.startLocation && state.startLocation.address !== query) {
                    state.startLocation = null;
                }
            } else {
                 if (state.selectedDeliveryLocation && state.selectedDeliveryLocation.address !== query) {
                    state.selectedDeliveryLocation = null;
                    elements.addStopBtn.disabled = true;
                }
            }

            if (query.length < 3) return;

            if (!state.apiKey) {
                const noApiDiv = document.createElement('div');
                noApiDiv.className = 'suggestion-item no-results';
                noApiDiv.textContent = 'Please set Google Maps API key in Options.';
                suggestionsElement.appendChild(noApiDiv);
                suggestionsElement.style.display = 'block';
                return;
            }

            if (!autocompleteService) {
                console.error("Google Maps AutocompleteService not initialized.");
                const noApiDiv = document.createElement('div');
                noApiDiv.className = 'suggestion-item no-results';
                noApiDiv.textContent = 'Autocomplete service is not ready.';
                suggestionsElement.appendChild(noApiDiv);
                suggestionsElement.style.display = 'block';
                return;
            }
            
            autocompleteService.getPlacePredictions({ 
                input: query,
                componentRestrictions: { country: 'gb' }
            }, (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    displaySuggestions(predictions, inputElement, suggestionsElement, isStartLocation);
                } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    const noResultDiv = document.createElement('div');
                    noResultDiv.className = 'suggestion-item no-results';
                    noResultDiv.textContent = 'No results found.';
                    suggestionsElement.appendChild(noResultDiv);
                    suggestionsElement.style.display = 'block';
                } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                     alert(`Google Maps API Error: Autocomplete request denied. Please check your API key and ensure the Places API is enabled.`);
                } else {
                    console.error('Google Autocomplete Service Error:', status);
                }
            });
        }
})();
