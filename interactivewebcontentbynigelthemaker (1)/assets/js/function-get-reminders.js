(function(){
async function getReminders() {
            if (!state.routeCalculated || state.deliveryStops.length === 0) {
                return "Please calculate a route with at least one stop first.";
            }

            const routeInfo = getRouteInfoForAI();
            const currentStop = state.currentStopIndex < state.deliveryStops.length 
                ? state.deliveryStops[state.currentStopIndex] 
                : null;

            const prompt = `
                A delivery driver has stops to complete: 
                ${state.deliveryStops.map((stop, index) => `${index + 1}. ${stop.address}`).join('\n')}
                
                Current Stop: ${currentStop ? `${state.currentStopIndex + 1}. ${currentStop.address}` : 'Not specified'}
                Route Optimization Method: ${state.optimizationMethod}
                Total Distance: ${calculateTotalDistance([state.startLocation, ...state.deliveryStops]).toFixed(1)} km
                
                Provide reminders about:
                1. Any special instructions in the notes for current or upcoming stops
                2. If the driver is about to leave an area (based on place names like Easton, Colliweston, etc.)
                3. Any time-sensitive deliveries
                4. Other important considerations
                
                Format your response as a clear list of reminders with emoji icons for important items.
            `;

            return await callWebsimAI(prompt);
        }
})();
