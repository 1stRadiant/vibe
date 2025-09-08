(function(){
function displaySuggestions(predictions, inputElement, suggestionsElement, isStartLocation) {
            suggestionsElement.innerHTML = '';
            if (predictions.length === 0) {
                suggestionsElement.style.display = 'none';
                return;
            }

            predictions.forEach(prediction => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = prediction.description;
                div.addEventListener('click', () => {
                    inputElement.value = prediction.description;
                    suggestionsElement.style.display = 'none';
                    
                    if (!placesService) {
                        alert("Places service not ready. Cannot get location details.");
                        return;
                    }
                    
                    placesService.getDetails({
                        placeId: prediction.place_id,
                        fields: ['geometry', 'formatted_address', 'name']
                    }, (place, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                            const locationData = {
                                address: place.formatted_address,
                                coordinates: [place.geometry.location.lat(), place.geometry.location.lng()],
                                notes: ''
                            };

                            if (isStartLocation) {
                                state.startLocation = locationData;
                                elements.startLocationInput.value = locationData.address;
                                updateMapMarkers();
                                updateCalculateRouteButton();
                            } else {
                                state.selectedDeliveryLocation = locationData;
                                elements.deliveryLocationInput.value = locationData.address;
                                elements.addStopBtn.disabled = false;
                            }
                        } else {
                            console.error("Error getting place details:", status);
                            alert("Could not retrieve location details. Please try again.");
                        }
                    });
                });
                suggestionsElement.appendChild(div);
            });

            suggestionsElement.style.display = 'block';
        }
})();
