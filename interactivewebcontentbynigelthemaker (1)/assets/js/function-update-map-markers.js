(function(){
function updateMapMarkers() {
            markers.forEach(marker => {
                if (map.hasLayer(marker)) {
                    map.removeLayer(marker);
                }
            });
            markers = [];
            let allPoints = [];

            // Start location marker
            if (state.startLocation && state.startLocation.coordinates) {
                const startIconHtml = `<div class="numbered-marker start-marker ${state.startLocation.completed ? 'completed-marker' : ''}">S</div>`;
                const startDivIcon = L.divIcon({
                    html: startIconHtml,
                    className: '', // Classes are in the HTML string
                    iconSize: [28, 28],
                    iconAnchor: [14, 28] // Anchor at bottom-center
                });
                const startMarker = L.marker(state.startLocation.coordinates, { icon: startDivIcon })
                    .addTo(map)
                    .bindPopup(`<b>Start Location</b><br>${state.startLocation.address}${state.startLocation.notes ? `<br><br>Notes: ${state.startLocation.notes}` : ''}`);
                markers.push(startMarker);
                allPoints.push(state.startLocation.coordinates);
            }

            // Delivery stop markers
            state.deliveryStops.forEach((stop, index) => {
                if (!stop.coordinates) return;

                let markerClasses = "numbered-marker";
                if (stop.completed) markerClasses += " completed-marker";
                if (index === state.currentStopIndex) markerClasses += " current-marker";

                let iconHtml = `<div class="${markerClasses}">${index + 1}</div>`;
                const stopDivIcon = L.divIcon({
                    html: iconHtml,
                    className: '', // Classes are in the HTML string
                    iconSize: [28, 28],
                    iconAnchor: [14, 28] // Anchor at bottom-center
                });

                const stopMarker = L.marker(stop.coordinates, { icon: stopDivIcon })
                    .addTo(map)
                    .bindPopup(`<b>Stop ${index + 1}</b><br>${stop.address}${stop.notes ? `<br><br>Notes: ${stop.notes}` : ''}`);
                markers.push(stopMarker);
                allPoints.push(stop.coordinates);
            });

            if (allPoints.length > 0) {
                try {
                    const bounds = L.latLngBounds(allPoints);
                    // Only fit bounds if not a calculated route or if only one point,
                    // otherwise drawRouteLines will handle fitting.
                    if (!state.routeCalculated || allPoints.length <= 1) {
                        map.fitBounds(bounds, { padding: [50, 50] });
                    }
                } catch(e) {
                    if (allPoints.length === 1) map.setView(allPoints[0], 15);
                }
            } else {
                map.setView([54.5, -4], 6); // Default view if no points
            }
        }
})();
