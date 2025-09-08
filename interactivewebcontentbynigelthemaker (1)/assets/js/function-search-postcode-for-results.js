(function(){
async function searchPostcodeForResults() {
            const postcode = elements.postcodeSearchInput.value.trim();
            if (!postcode) {
                alert('Please enter a postcode.');
                return;
            }

            if (!state.apiKey) {
                alert('Please enter and save your Google Maps API key first.');
                return;
            }
            
            if (!geocoder) {
                alert("Google Geocoding Service is not ready. Please wait a moment or check your API key.");
                return;
            }

            elements.searchPostcodeBtn.textContent = 'Searching...';
            elements.searchPostcodeBtn.disabled = true;
            elements.addressResults.innerHTML = '';
            elements.addressResults.style.display = 'none';

            const request = {
                address: postcode,
                componentRestrictions: {
                    country: 'GB',
                    postalCode: postcode
                }
            };

            geocoder.geocode(request, (results, status) => {
                elements.searchPostcodeBtn.textContent = 'Find Addresses';
                elements.searchPostcodeBtn.disabled = false;

                if (status === google.maps.GeocoderStatus.OK && results) {
                    const resultsWithDetails = results.map(result => {
                        if (result.geometry && result.geometry.location) {
                            return {
                                address: result.formatted_address,
                                coordinates: [result.geometry.location.lat(), result.geometry.location.lng()]
                            };
                        }
                        return null;
                    }).filter(Boolean);
                    
                    // Filter out duplicate addresses to present a cleaner list
                    const uniqueResults = resultsWithDetails.filter((item, index, self) => 
                        index === self.findIndex((t) => (
                            t.address === item.address
                        ))
                    );

                    displayPostcodeResults(uniqueResults);

                } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                    displayPostcodeResults([]);
                } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
                    alert(`Google Maps API Error: Geocoding Request Denied. Please check if your API key is correct, has billing enabled, and has the Geocoding API enabled.`);
                    updateApiKeyStatus(false);
                } else {
                    console.error('Google Geocoder Error:', status);
                    alert(`An error occurred while searching for addresses: ${status}. Please check your API key and internet connection.`);
                }
            });
        }
})();
