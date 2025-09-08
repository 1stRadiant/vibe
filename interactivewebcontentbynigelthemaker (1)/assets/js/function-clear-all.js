(function(){
function clearAll() {
            state.startLocation = null;
            state.deliveryStops = [];
            state.selectedDeliveryLocation = null;
            state.routeCalculated = false;
            state.optimizationMethod = 'distance';
            state.mapVisible = false;
            state.currentStopIndex = 0;
            state.startStopOverride = null;
            state.endStopOverride = null;
            elements.optimizeDistance.checked = true;

            elements.startLocationInput.value = '';
            elements.deliveryLocationInput.value = '';
            elements.stopNotesInput.value = '';
            elements.postcodeSearchInput.value = '';
            elements.stopList.innerHTML = '';
            elements.stopCount.textContent = '0';
            elements.addressResults.style.display = 'none';
            elements.startSuggestions.style.display = 'none';
            elements.deliverySuggestions.style.display = 'none';
            elements.toggleMapBtn.textContent = 'Show Map';
            elements.toggleMapBtn.classList.remove('visible');
            elements.mapContainer.classList.remove('visible');
            elements.locationStatus.textContent = "Location not set";
            elements.locationStatus.className = "location-status";
            elements.requestLocationBtn.style.display = 'inline-block';

            elements.addStopBtn.disabled = true;

            clearRouteVisualization();
            markers.forEach(marker => {
                if (map.hasLayer(marker)) {
                     map.removeLayer(marker);
                }
            });
            markers = [];
            updateCurrentStopIndex();
            updateMapMarkers(); // Clear markers from map view

            map.setView([54.5, -4], 6);
            updateCalculateRouteButton();
            updateViewLiveRouteButton();
            
            // Notify AI assistant
            addAiMessage("All data cleared. Ready to plan a new route!");
        }
})();
