(function(){
function getRouteInfoForAI() {
            return {
                startLocation: state.startLocation?.address || 'Not specified',
                stopCount: state.deliveryStops.length,
                optimizationMethod: state.optimizationMethod,
                totalDistance: calculateTotalDistance([state.startLocation, ...state.deliveryStops]).toFixed(1),
                stopsList: state.deliveryStops.map((stop, index) => 
                    `${index + 1}. ${stop.address}${stop.notes ? ` (Notes: ${stop.notes})` : ''}`
                ).join('\n')
            };
        }
})();
