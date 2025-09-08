(function(){
async function startPostcodeScanner() {
            if (state.isScanning) return;
            state.isScanning = true;

            elements.postcodeScannerModal.style.display = 'flex';
            elements.scannerStatus.textContent = 'Starting camera...';
            elements.scannerResultContainer.style.display = 'none';
            elements.scannerVideo.style.display = 'block';

            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("Camera access is not supported by your browser.");
                }
                state.videoStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    } 
                });
                elements.scannerVideo.srcObject = state.videoStream;
                await elements.scannerVideo.play();
                elements.scannerStatus.textContent = 'Scanning...';
                startScanInterval();
            } catch (err) {
                console.error("Error accessing camera: ", err);
                elements.scannerStatus.textContent = `Error: ${err.message}. Please check permissions.`;
                state.isScanning = false;
            }
        }
})();
