(function(){
function updateAiNotificationBadge() {
            const aiTabButton = document.querySelector('.tab-button[data-tab="ai-tab"]');
            if (!aiTabButton) return;
        
            if (state.hasNewAiNotification) {
                if (!aiTabButton.querySelector('.tab-notification-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'tab-notification-badge';
                    aiTabButton.appendChild(badge);
                }
                aiTabButton.classList.add('has-notification');
            } else {
                aiTabButton.classList.remove('has-notification');
            }
        }
})();
