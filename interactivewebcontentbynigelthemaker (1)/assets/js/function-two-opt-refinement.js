(function(){
function twoOptRefinement(route, startingPoint) {
            if (route.length < 2) return route;

            let improved = true;
            let tour = [startingPoint, ...route];
            
            while (improved) {
                improved = false;
                for (let i = 0; i < tour.length - 2; i++) {
                    for (let j = i + 2; j < tour.length - 1; j++) {
                        const p_i = tour[i];
                        const p_i1 = tour[i + 1];
                        const p_j = tour[j];
                        const p_j1 = tour[j + 1];

                        const original_dist = calculateDistance(p_i.coordinates, p_i1.coordinates) + calculateDistance(p_j.coordinates, p_j1.coordinates);
                        const new_dist = calculateDistance(p_i.coordinates, p_j.coordinates) + calculateDistance(p_i1.coordinates, p_j1.coordinates);

                        if (new_dist < original_dist) {
                            // Reverse the segment from i+1 to j
                            const segment = tour.slice(i + 1, j + 1);
                            segment.reverse();
                            tour = [...tour.slice(0, i + 1), ...segment, ...tour.slice(j + 1)];
                            improved = true;
                        }
                    }
                    if (improved) break; // Restart scan with the improved route
                }
            }

            return tour.slice(1); // Return just the stops, without the starting point
        }
})();
