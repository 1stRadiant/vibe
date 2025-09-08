(function(){
function toggleMapVisibility() {
            state.mapVisible = !state.mapVisible;
            localStorage.setItem('mapVisible', state.mapVisible.toString());
            
            if (state.mapVisible) {
                elements.mapContainer.classList.add('visible');
                elements.toggleMapBtn.textContent = 'Hide Map';
                elements.toggleMapBtn.classList.add('visible');
                // Trigger map resize to ensure proper rendering
                setTimeout(() => {
                    map.invalidateSize();
                    if (state.routeCalculated && state.startLocation && state.deliveryStops.length > 0) {
                         // Re-calculate to restore state and re-render UI correctly
                        const stopsBackup = [...state.deliveryStops];
                        calculateRoute(true);
                        state.deliveryStops = stopsBackup; // Restore original loaded order before re-optimizing
                    } else if (state.startLocation) {
                        map.setView(state.startLocation.coordinates, 15);
                    } else if (state.deliveryStops.length > 0) {
                        const bounds = L.latLngBounds(state.deliveryStops.map(stop => stop.coordinates));
                        map.fitBounds(bounds, { padding: [50, 50] });
                    }
                }, 300);
            } else {
                elements.mapContainer.classList.remove('visible');
                elements.toggleMapBtn.textContent = 'Show Map';
                elements.toggleMapBtn.classList.remove('visible');
            }
        }
})();
