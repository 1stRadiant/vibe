(function(){
function clearRouteVisualization() {
            routeLines.forEach(line => {
                if (map.hasLayer(line)) {
                     map.removeLayer(line);
                }
            });
            routeLines = [];
            elements.routeSummary.style.display = 'none';
            elements.routeSequence.innerHTML = '';
            elements.routeDetails.textContent = '';
        }
})();
