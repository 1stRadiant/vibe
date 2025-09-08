(function(){
function toggleStopCompletion(index) {
            state.deliveryStops[index].completed = !state.deliveryStops[index].completed;
            updateCurrentStopIndex(); // Recalculate current stop
            updateDeliveryStopsUI();
            if (state.routeCalculated) {
                updateRouteSummaryUI();
                updateMapMarkers(); // Update markers to reflect completion and current status
            }
            saveState();
        }
})();
