(function(){
function optimizeByClustering(stops, startingPoint) {
            if (stops.length < 3) return stops; // Not enough points to cluster effectively
            // Simplified K-Means clustering
            // 1. Determine K (number of clusters)
            const k = Math.min(Math.max(2, Math.floor(Math.sqrt(stops.length / 2))), 5); // Heuristic for K, capped at 5

            // 2. Initialize centroids randomly from stops
            let centroids = stops.slice(0, k).map(s => s.coordinates);
            let clusters = Array.from({ length: k }, () => []);

            for (let iter = 0; iter < 10; iter++) { // Iterate a few times to stabilize clusters
                // 3. Assign stops to the closest centroid
                clusters = Array.from({ length: k }, () => []);
                stops.forEach(stop => {
                    let minDistance = Infinity;
                    let closestCentroidIndex = 0;
                    centroids.forEach((centroid, index) => {
                        const dist = calculateDistance(stop.coordinates, centroid);
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestCentroidIndex = index;
                        }
                    });
                    clusters[closestCentroidIndex].push(stop);
                });

                // 4. Recalculate centroids
                centroids = clusters.map(cluster => {
                    if (cluster.length === 0) return [0, 0]; // Should not happen with good data
                    const sum = cluster.reduce((acc, stop) => [acc[0] + stop.coordinates[0], acc[1] + stop.coordinates[1]], [0, 0]);
                    return [sum[0] / cluster.length, sum[1] / cluster.length];
                }).filter(c => c[0] !== 0); // Filter out empty clusters' centroids
            }

            // 5. Order clusters by distance from start
            clusters.sort((a, b) => {
                if (a.length === 0) return 1;
                if (b.length === 0) return -1;
                const centroidA = centroids[clusters.indexOf(a)];
                const centroidB = centroids[clusters.indexOf(b)];
                return calculateDistance(startingPoint.coordinates, centroidA) - calculateDistance(startingPoint.coordinates, centroidB);
            });

            // 6. For each cluster, find the optimal internal path (using Nearest Neighbor)
            let finalRoute = [];
            let lastPoint = startingPoint;

            clusters.forEach(cluster => {
                if (cluster.length > 0) {
                    let unvisited = [...cluster];
                    let orderedCluster = [];
                    // Find the best entry point into the cluster from the last point of the previous cluster
                    let bestEntryPointIndex = 0;
                    let minEntryDistance = Infinity;
                    unvisited.forEach((stop, index) => {
                        const dist = calculateDistance(lastPoint.coordinates, stop.coordinates);
                        if (dist < minEntryDistance) {
                            minEntryDistance = dist;
                            bestEntryPointIndex = index;
                        }
                    });
                    let currentPoint = unvisited.splice(bestEntryPointIndex, 1)[0];
                    orderedCluster.push(currentPoint);

                    // Optimize within the cluster
                    while (unvisited.length > 0) {
                        let nearestStopIndex = -1;
                        let minDistance = Infinity;
                        for (let i = 0; i < unvisited.length; i++) {
                            const distance = calculateDistance(currentPoint.coordinates, unvisited[i].coordinates);
                            if (distance < minDistance) {
                                minDistance = distance;
                                nearestStopIndex = i;
                            }
                        }
                        const nearestStop = unvisited.splice(nearestStopIndex, 1)[0];
                        orderedCluster.push(nearestStop);
                        currentPoint = nearestStop;
                    }
                    finalRoute.push(...orderedCluster);
                    lastPoint = orderedCluster[orderedCluster.length - 1]; // Update last point for next cluster
                }
            });

            return finalRoute;
        }
})();
