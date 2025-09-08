(function(){
function updateCurrentStopIndex() {
            const firstIncompleteIndex = state.deliveryStops.findIndex(stop => !stop.completed);
            state.currentStopIndex = firstIncompleteIndex !== -1 ? firstIncompleteIndex : state.deliveryStops.length;
        }
})();
