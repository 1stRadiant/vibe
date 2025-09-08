(function(){
function switchTab(tabId) {
            elements.tabPanes.forEach(pane => {
                pane.classList.remove('active');
            });
            elements.menuItems.forEach(item => {
                if(item.dataset.tab === tabId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            document.getElementById(tabId).classList.add('active');
            
            // If switching to AI tab, remove notification
            if (tabId === 'ai-tab') {
                state.hasNewAiNotification = false;
                updateAiNotificationBadge();
                setTimeout(() => {
                    elements.aiChatBody.scrollTop = elements.aiChatBody.scrollHeight;
                }, 100);
            }
        }
})();
