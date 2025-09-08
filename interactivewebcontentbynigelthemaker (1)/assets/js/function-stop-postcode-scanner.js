(function(){
function stopPostcodeScanner() {
            if (state.scanIntervalId) {
                clearInterval(state.scanIntervalId);
                state.scanIntervalId = null;
            }
            if (state.videoStream) {
                state.videoStream.getTracks().forEach(track => track.stop());
                state.videoStream = null;
            }
            elements.scannerVideo.srcObject = null;
            elements.postcodeScannerModal.style.display = 'none';
            state.isScanning = false;
        }
})();
