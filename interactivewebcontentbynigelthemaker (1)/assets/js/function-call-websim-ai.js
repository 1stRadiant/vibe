(function(){
async function callWebsimAI(prompt) {
            try {
                const completion = await websim.chat.completions.create({
                    messages: [
                        { role: "assistant", content: prompt }
                    ]
                });
                return completion.content || "No response from AI.";
            } catch (error) {
                console.error('Error calling websim AI:', error);
                const errorMessage = "Sorry, I encountered an error. Please try again later. The built-in AI may be temporarily unavailable.";
                addAiMessage(errorMessage); // Also show error in chat
                return errorMessage;
            }
        }
})();
