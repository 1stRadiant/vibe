(function(){
function calculateTotalDistance(points) {
            if (!points || points.length < 2) return 0;
            
            let totalDistance = 0;
            for (let i = 0; i < points.length - 1; i++) {
                if (points[i] && points[i+1] && points[i].coordinates && points[i+1].coordinates) {
                    totalDistance += calculateDistance(points[i].coordinates, points[i+1].coordinates);
                }
            }
            return totalDistance;
        }
})();
