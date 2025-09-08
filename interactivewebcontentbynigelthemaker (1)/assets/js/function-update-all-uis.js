(function(){
function updateAllUIs() {
            updateDeliveryStopsUI();
            updateMapMarkers();
            if(state.routeCalculated) {
                // When re-rendering summary, ensure current stop is highlighted correctly
                updateRouteSummaryUI();
            }
        }
})();
