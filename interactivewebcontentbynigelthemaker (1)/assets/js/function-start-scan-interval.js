(function(){
function startScanInterval() {
            if (state.scanIntervalId) {
                clearInterval(state.scanIntervalId);
            }
            state.scanIntervalId = setInterval(scanFrameForPostcode, 2000); // Scan every 2 seconds
        }
})();
