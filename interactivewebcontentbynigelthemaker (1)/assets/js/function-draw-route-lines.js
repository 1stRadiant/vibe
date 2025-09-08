(function(){
function drawRouteLines(points) {
            routeLines.forEach(line => {
                if (map.hasLayer(line)) {
                     map.removeLayer(line);
                }
            });
            routeLines = [];

            const coords = points
                .filter(p => p && p.coordinates)
                .map(p => p.coordinates)
                .filter(c => Array.isArray(c) && c.length === 2 && !isNaN(c[0]) && !isNaN(c[1]));

            if (coords.length < 2) return;

            try {
                const routePolyline = L.polyline(coords, {
                    color: '#2196F3',
                    weight: 4,
                    opacity: 0.8,
                }).addTo(map);
                routeLines.push(routePolyline);
                map.fitBounds(routePolyline.getBounds(), { padding: [60, 60] });
            } catch (e) {
                console.error("Error drawing polyline:", e, coords);
                alert("An error occurred while drawing the route on the map.");
                elements.routeSummary.style.display = 'none';
                state.routeCalculated = false;
            }
        }
})();
