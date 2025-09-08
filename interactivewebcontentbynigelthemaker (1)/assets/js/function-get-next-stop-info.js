(function(){
async function getNextStopInfo() {
            if (!state.routeCalculated || state.deliveryStops.length === 0) {
                return "Please calculate a route with at least one stop first.";
            }

            if (state.currentStopIndex >= state.deliveryStops.length) {
                return "You've completed all stops on this route!";
            }

            const nextStop = state.deliveryStops[state.currentStopIndex];
            const prompt = `
                You are a delivery route assistant. Provide detailed information about the driver's next stop:
                
                Next Stop Details:
                - Address: ${nextStop.address}
                - Notes: ${nextStop.notes || 'None'}
                - Position in Route: ${state.currentStopIndex + 1} of ${state.deliveryStops.length}
                
                ${state.aiTrainingData ? `Additional Training Data: ${state.aiTrainingData}` : ''}
                
                Provide:
                1. A summary of the stop (location, any identifiable landmarks)
                2. Any special instructions from the notes
                3. Parking or access considerations
                4. A friendly heads-up or tip for this delivery.
                
                Format your response in a clear, friendly manner with section headings.
            `;

            return await callWebsimAI(prompt);
        }
})();
