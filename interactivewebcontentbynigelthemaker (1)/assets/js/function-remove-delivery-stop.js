(function(){
function removeDeliveryStop(index) {
            state.deliveryStops.splice(index, 1);
            updateCurrentStopIndex(); // Recalculate current stop
            updateDeliveryStopsUI();
            updateStopConstraintDropdowns();
            updateCalculateRouteButton();
            if (state.routeCalculated) {
                clearRouteVisualization();
                state.routeCalculated = false;
                elements.calculateRouteBtn.textContent = 'Calculate Route';
            }
            updateViewLiveRouteButton();
            saveState();
        }
})();
