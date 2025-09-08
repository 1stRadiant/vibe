(function(){
function addAiMessage(text, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `ai-message ${isUser ? 'user' : 'assistant'}`;
            messageDiv.innerHTML = text.replace(/\n/g, '<br>');
            elements.aiChatBody.appendChild(messageDiv);
            
            // Scroll to bottom
            elements.aiChatBody.scrollTop = elements.aiChatBody.scrollHeight;
            
            // Show notification badge if AI tab is not visible
            const aiTabIsActive = document.getElementById('ai-tab').classList.contains('active');
            if (!isUser && !aiTabIsActive) {
                state.hasNewAiNotification = true;
                updateAiNotificationBadge();
            }
        }
})();
