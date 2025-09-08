(function(){
function updateCalculateRouteButton() {
            const stopsExist = state.deliveryStops.length > 0;
            elements.calculateRouteBtn.disabled = !stopsExist;
            elements.recalculateRouteLiveBtn.disabled = !stopsExist;
        }
})();
