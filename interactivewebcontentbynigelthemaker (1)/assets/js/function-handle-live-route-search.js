(function(){
function handleLiveRouteSearch() {
            const query = elements.searchLiveRouteInput.value.toLowerCase().trim();
            const items = elements.routeSequence.querySelectorAll('li');

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }
})();
