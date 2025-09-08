(function(){
function saveState() {
            const stateToSave = {
                startLocation: state.startLocation,
                deliveryStops: state.deliveryStops,
                optimizationMethod: state.optimizationMethod,
                routeCalculated: state.routeCalculated,
                currentStopIndex: state.currentStopIndex,
                startStopOverride: state.startStopOverride,
                endStopOverride: state.endStopOverride
            };
            localStorage.setItem('routePlannerState', JSON.stringify(stateToSave));
        }
})();
