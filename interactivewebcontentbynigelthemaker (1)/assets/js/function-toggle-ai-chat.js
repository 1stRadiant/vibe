(function(){
function toggleAiChat() {
            elements.aiChatContainer.classList.toggle('visible');
            if (elements.aiChatContainer.classList.contains('visible')) {
                // Clear notification when chat is opened
                state.hasNewAiNotification = false;
                updateAiNotificationBadge();
                // Scroll to bottom
                setTimeout(() => {
                    elements.aiChatBody.scrollTop = elements.aiChatBody.scrollHeight;
                }, 100);
            }
        }
})();
