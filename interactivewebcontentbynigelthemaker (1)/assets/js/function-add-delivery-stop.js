(function(){
function addDeliveryStop() {
            if (!state.selectedDeliveryLocation) {
                alert('Please select a valid delivery address from the suggestions or postcode search results first.');
                return;
            }

            // Use the address from the input field for display, but coordinates from the selected location.
            const newAddressText = elements.deliveryLocationInput.value.trim();
            const newCoordinates = state.selectedDeliveryLocation.coordinates;

            // Check for duplicates by comparing coordinates (more robust than address string)
            if (state.deliveryStops.some(stop => 
                stop.coordinates[0] === newCoordinates[0] && 
                stop.coordinates[1] === newCoordinates[1])) {
                
                alert('This location is already in the list of stops.');
                elements.deliveryLocationInput.value = '';
                elements.stopNotesInput.value = ''; // Clear notes as well
                state.selectedDeliveryLocation = null;
                elements.addStopBtn.disabled = true;
                elements.deliverySuggestions.style.display = 'none';
                return;
            }

            state.deliveryStops.push({
                address: newAddressText, // Use the user's potentially refined address text
                coordinates: newCoordinates, // Use the validated coordinates
                notes: elements.stopNotesInput.value.trim(),
                completed: false
            });

            elements.deliveryLocationInput.value = '';
            elements.stopNotesInput.value = '';
            state.selectedDeliveryLocation = null;
            elements.addStopBtn.disabled = true;
            elements.deliverySuggestions.style.display = 'none';

            updateDeliveryStopsUI();
            updateStopConstraintDropdowns();
            updateCalculateRouteButton();
            saveState();
        }
})();
