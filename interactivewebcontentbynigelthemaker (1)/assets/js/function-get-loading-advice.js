(function(){
async function getLoadingAdvice() {
            if (!state.routeCalculated || state.deliveryStops.length === 0) {
                return "Please calculate a route with at least one stop first.";
            }

            const routeInfo = getRouteInfoForAI();
            const prompt = `
                You are a delivery route optimization assistant. Help the driver load their van optimally based on the following route information:
                
                Route Details:
                - Start Location: ${routeInfo.startLocation}
                - Number of Stops: ${routeInfo.stopCount}
                - Optimization Method: ${routeInfo.optimizationMethod}
                - Total Distance: ${routeInfo.totalDistance} km
                - Stops: ${routeInfo.stopsList}
                
                ${state.aiTrainingData ? `Additional Training Data: ${state.aiTrainingData}` : ''}
                
                Provide specific advice on how to load the van, indicating which parcels should go where based on the delivery order. 
                Consider that items for earlier stops should be more accessible. 
                Group items by area when possible (e.g., "Easton items go together").
                Provide your response in clear, bullet-point format.
            `;

            return await callWebsimAI(prompt);
        }
})();
