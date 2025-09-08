(function(){
function optimizeRoute(stops, method, startingPoint) {
            // This function implements a nearest-neighbor heuristic for the Traveling Salesperson Problem.
            // It provides a much more efficient route than simple sorting.
            if (!startingPoint || stops.length < 2) {
                if (stops.length === 1 && startingPoint) {
                    return stops;
                }
                return stops;
            }

            // A new simple sort option for users who prefer it.
            if (method === 'closest-to-start') {
                 // Sorts stops based on their direct distance from the starting point.
                return stops.sort((a, b) => {
                    const distA = calculateDistance(startingPoint.coordinates, a.coordinates);
                    const distB = calculateDistance(startingPoint.coordinates, b.coordinates);
                    return distA - distB;
                });
            }

            if (method === 'cluster') {
                return optimizeByClustering(stops, startingPoint);
            }
            
            // Default (time) and roundtrip: Nearest Neighbor algorithm
            let unvisitedStops = [...stops];
            let orderedStops = [];
            let currentPoint = startingPoint;

            while (unvisitedStops.length > 0) {
                let nearestStopIndex = -1;
                let minDistance = Infinity;

                // Find the closest unvisited stop to the current point in the route
                for (let i = 0; i < unvisitedStops.length; i++) {
                    const distance = calculateDistance(currentPoint.coordinates, unvisitedStops[i].coordinates);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestStopIndex = i;
                    }
                }
                
                // Add the nearest stop to our ordered list and remove it from unvisited
                const nearestStop = unvisitedStops.splice(nearestStopIndex, 1)[0];
                orderedStops.push(nearestStop);
                
                // The new current point is the stop we just added
                currentPoint = nearestStop;
            }

            // For 'fuel' option, apply 2-opt refinement for a better route
            if (method === 'fuel') {
                return twoOptRefinement(orderedStops, startingPoint);
            }

            return orderedStops;
        }
})();
