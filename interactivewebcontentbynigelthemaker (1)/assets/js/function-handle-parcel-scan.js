(function(){
async function handleParcelScan(message = '') {
            let parcelId = '';
            if (typeof message === 'string' && message.toLowerCase().includes('scan')) {
                 parcelId = message.replace(/scan/i, '').trim();
            } else {
                 parcelId = elements.parcelScanInput.value.trim();
            }
                
            if (!parcelId) {
                return "Please scan or enter a parcel ID first.";
            }
            
            const prompt = `
                A delivery driver has scanned a parcel with ID: ${parcelId}. 
                Based on the following route information, advise where in the van this parcel should be placed:
                
                Route Details:
                - Start Location: ${state.startLocation.address}
                - Number of Stops: ${state.deliveryStops.length}
                - Optimization Method: ${state.optimizationMethod}
                - Total Distance: ${calculateTotalDistance([state.startLocation, ...state.deliveryStops]).toFixed(1)} km
                - Stops: ${state.deliveryStops.map(stop => stop.address).join('\n')}
                
                ${state.aiTrainingData ? `Additional Training Data: ${state.aiTrainingData}` : ''}
                
                If you can't determine the exact stop for this parcel, suggest a general placement strategy based on typical delivery patterns for this route.
                Format your response with clear bullet points and use van loading terminology (e.g., "near the side door", "behind driver seat").
            `;

            elements.parcelScanInput.value = '';
            const response = await callWebsimAI(prompt);
            addAiMessage(`**Parcel ID: ${parcelId}**\n\n${response}`);
        }
})();
