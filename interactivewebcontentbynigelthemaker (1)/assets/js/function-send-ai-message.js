(function(){
async function sendAiMessage() {
            const message = elements.aiChatInput.value.trim();
            if (!message) return;

            // Add user message to chat
            addAiMessage(message, true);
            elements.aiChatInput.value = '';

            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'ai-message assistant';
            typingIndicator.textContent = 'Thinking...';
            elements.aiChatBody.appendChild(typingIndicator);
            elements.aiChatBody.scrollTop = elements.aiChatBody.scrollHeight;

            try {
                let response;
                
                if (message.toLowerCase().includes('load') || message.toLowerCase().includes('van')) {
                    response = await getLoadingAdvice();
                } else if (message.toLowerCase().includes('remind') || message.toLowerCase().includes('note')) {
                    response = await getReminders();
                } else if (message.toLowerCase().includes('next') || message.toLowerCase().includes('stop')) {
                    response = await getNextStopInfo();
                } else if (message.toLowerCase().includes('scan') || message.toLowerCase().includes('parcel')) {
                    response = await handleParcelScan(message);
                } else {
                    // Default generic response
                    const routeInfo = getRouteInfoForAI();
                    const prompt = `
                        You are a delivery route assistant. The user asked: "${message}"
                        
                        Current Route Details:
                        - Start Location: ${routeInfo.startLocation}
                        - Number of Stops: ${routeInfo.stopCount}
                        - Optimization Method: ${routeInfo.optimizationMethod}
                        - Total Distance: ${routeInfo.totalDistance} km
                        - Stops: ${routeInfo.stopsList}
                        
                        ${state.aiTrainingData ? `Additional Training Data: ${state.aiTrainingData}` : ''}
                        
                        Provide a helpful response to the user's question, considering the current route information.
                        Be concise but informative, and use bullet points when appropriate.
                    `;
                    
                    response = await callWebsimAI(prompt);
                }

                // Remove typing indicator
                elements.aiChatBody.removeChild(typingIndicator);
                
                // Add AI response
                addAiMessage(response || "I couldn't generate a response. Please try again.");
            } catch (error) {
                console.error('Error generating AI response:', error);
                elements.aiChatBody.removeChild(typingIndicator);
                addAiMessage("Sorry, I encountered an error. Please try again later.");
            }
        }
})();
