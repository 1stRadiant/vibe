(function(){
async function loadSavedState() {
            const savedState = localStorage.getItem('routePlannerState');
            if (savedState) {
                try {
                    const parsedState = JSON.parse(savedState);
                    if (parsedState.startLocation) {
                        state.startLocation = parsedState.startLocation;
                        if (!state.startLocation.notes) state.startLocation.notes = '';
                        elements.startLocationInput.value = state.startLocation.address;
                        elements.locationStatus.textContent = "Using saved start location";
                        elements.locationStatus.className = "location-status location-success";
                    }
                    if (parsedState.deliveryStops && parsedState.deliveryStops.length > 0) {
                        state.deliveryStops = parsedState.deliveryStops;
                        // Ensure all stops have notes property
                        state.deliveryStops.forEach(stop => {
                            if (!stop.notes) stop.notes = '';
                        });
                        updateDeliveryStopsUI();
                    }
                    if (parsedState.optimizationMethod) {
                        state.optimizationMethod = parsedState.optimizationMethod;
                    }
                    if (parsedState.routeCalculated) {
                        state.routeCalculated = parsedState.routeCalculated;
                        if (state.routeCalculated && state.startLocation && state.deliveryStops.length > 0) {
                             // Re-calculate to restore state and re-render UI correctly
                            const stopsBackup = [...state.deliveryStops];
                            calculateRoute(true);
                            state.deliveryStops = stopsBackup; // Restore original loaded order before re-optimizing
                        }
                    }
                    if (parsedState.currentStopIndex !== undefined) {
                        state.currentStopIndex = parsedState.currentStopIndex;
                    }
                    if (parsedState.startStopOverride) {
                        state.startStopOverride = parsedState.startStopOverride;
                    }
                    if (parsedState.endStopOverride) {
                        state.endStopOverride = parsedState.endStopOverride;
                    }
                    // After loading everything, update all UIs to reflect the state
                    updateAllUIs();
                    updateStopConstraintDropdowns();
                } catch (e) {
                    console.error('Failed to load saved state:', e);
                }
            }
            // Check if we should prompt for notification permissions
            checkNotificationPermission();
            updateViewLiveRouteButton();
        }
})();
