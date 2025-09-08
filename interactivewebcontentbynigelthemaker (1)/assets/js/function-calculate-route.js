(function(){
async function calculateRoute(isReload = false) {
            updateCalculateRouteButton();

            if (elements.calculateRouteBtn.disabled && !isReload) {
                alert("Cannot calculate route. Please add at least one stop.");
                return;
            }

            elements.calculateRouteBtn.textContent = 'Getting location...';
            elements.calculateRouteBtn.disabled = true;

            try {
                const currentLocation = await getUpdatedCurrentLocation();
                state.startLocation = currentLocation;
                elements.startLocationInput.value = currentLocation.address;
                elements.locationStatus.textContent = "Using your current location for calculation";
                elements.locationStatus.className = "location-status location-success";
            } catch (error) {
                alert(`Could not get current location: ${error}. Please ensure location services are enabled.`);
                elements.calculateRouteBtn.textContent = 'Calculate Route';
                updateCalculateRouteButton();
                return;
            }

            elements.calculateRouteBtn.textContent = 'Calculating...';

            // Separate completed stops from incomplete ones
            const completedStops = state.deliveryStops.filter(stop => stop.completed);
            let incompleteStops = state.deliveryStops.filter(stop => !stop.completed);

            if (incompleteStops.length === 0) {
                alert("All stops are marked as complete. There's no new route to calculate.");
                clearRouteVisualization();
                state.routeCalculated = false;
                elements.calculateRouteBtn.textContent = 'Calculate Route';
                updateCalculateRouteButton();
                return;
            }

            // --- NEW LOGIC FOR START/END STOPS ---
            let startStopForRoute = null;

            // If a start stop is selected, use it as the start location
            if (state.startStopOverride) {
                const startIdx = state.deliveryStops.findIndex(s => s.address === state.startStopOverride);
                if (startIdx > -1) {
                    startStopForRoute = state.deliveryStops[startIdx];
                    state.startLocation = startStopForRoute;
                    elements.startLocationInput.value = state.startLocation.address;
                    elements.locationStatus.textContent = `Starting route from: ${state.startLocation.address.split(',')[0]}`;
                    elements.locationStatus.className = "location-status location-success";
                }
            }

            // Only get current location if no start stop override is selected or found
            if (!startStopForRoute) {
                try {
                    const currentLocation = await getUpdatedCurrentLocation();
                    state.startLocation = currentLocation;
                    elements.startLocationInput.value = currentLocation.address;
                    elements.locationStatus.textContent = "Using your current location for calculation";
                    elements.locationStatus.className = "location-status location-success";
                } catch (error) {
                    alert(`Could not get current location: ${error}. Please ensure location services are enabled.`);
                    elements.calculateRouteBtn.textContent = 'Calculate Route';
                    updateCalculateRouteButton();
                    return;
                }
            }

            elements.calculateRouteBtn.textContent = 'Calculating...';

            // Handle start/end constraints
            let endStop = null;
            let stopsToOptimize = [...incompleteStops];

            if (state.endStopOverride) {
                const endIdx = stopsToOptimize.findIndex(s => s.address === state.endStopOverride);
                if (endIdx > -1) {
                    // It also shouldn't be the same as the start stop if one was chosen
                    if (!startStopForRoute || (startStopForRoute.address !== state.endStopOverride)) {
                        endStop = stopsToOptimize.splice(endIdx, 1)[0];
                    }
                }
            }
            
            const optimizationStartPoint = state.startLocation; // Always use state.startLocation as it's been set correctly
            
            // Optimize the route using the remaining incomplete stops.
            const reorderedIntermediateStops = optimizeRoute(stopsToOptimize, state.optimizationMethod, optimizationStartPoint);
            
            let reorderedIncompleteStops = [];
            reorderedIncompleteStops.push(...reorderedIntermediateStops);
            if (endStop) {
                reorderedIncompleteStops.push(endStop);
            }

            // Update state.deliveryStops with the new optimized order, keeping completed stops at the end.
            state.deliveryStops = [...reorderedIncompleteStops, ...completedStops];
            
            // Update the sidebar list to reflect the new order
            updateDeliveryStopsUI();

            // Prepare points for route summary and polyline.
            let routePointsForDisplay = [state.startLocation, ...reorderedIncompleteStops];
            
            // For round trip, add the start location at the end for display purposes
            if (state.optimizationMethod === 'roundtrip' && state.startLocation) {
                routePointsForDisplay.push({
                    ...state.startLocation,
                    address: `Return to: ${state.startLocation.address}`,
                    isReturn: true
                });
            }

            const totalDistance = calculateTotalDistance(routePointsForDisplay);
            
            let detailsText = `Optimized route (${state.optimizationMethod}) with ${reorderedIncompleteStops.length} stop${reorderedIncompleteStops.length === 1 ? '' : 's'}. `;
            detailsText += `Total approx distance: ${totalDistance.toFixed(1)} km.`;
            
            if (state.optimizationMethod === 'roundtrip') {
                detailsText += " (Round trip back to start)";
            }
            
            elements.routeDetails.textContent = detailsText;

            updateRouteSummaryUI(routePointsForDisplay); // Pass the full set of points for summary
            drawRouteLines(routePointsForDisplay);       // Pass the full set of points for polyline
            updateMapMarkers(); // Update map markers, which will use the reordered state.deliveryStops

            state.routeCalculated = true;
            state.currentStopIndex = 0; // Reset to first stop when calculating new route
            updateCurrentStopIndex(); // Set to first incomplete stop
            saveState();
            
            if (!isReload) {
                addAiMessage("Route calculated! Ask me for loading advice or reminders.");
            }
            elements.calculateRouteBtn.textContent = 'Calculate Route';
            updateCalculateRouteButton();
            updateViewLiveRouteButton();
        }
})();
