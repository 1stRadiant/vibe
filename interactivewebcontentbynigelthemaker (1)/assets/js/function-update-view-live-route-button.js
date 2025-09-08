(function(){
function updateViewLiveRouteButton() {
            if (elements.viewLiveRouteBtn) {
                elements.viewLiveRouteBtn.disabled = !state.routeCalculated;
            }
        }
})();
