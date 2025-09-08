(function(){
async function scanFrameForPostcode() {
            if (!state.isScanning || elements.scannerVideo.readyState < 2) {
                return;
            }

            const canvas = elements.scannerCanvas;
            const video = elements.scannerVideo;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);

            try {
                const completion = await websim.chat.completions.create({
                    messages: [{
                        role: 'user',
                        content: [{
                                type: 'text',
                                text: `Analyze this image and extract any valid full UK postcode (e.g., SW1A 0AA, M1 1AE, G1 1RD, BT1 5GS). A full UK postcode has an outward code and an inward code separated by a space. The outward code is 2-4 characters long, and the inward code is always 3 characters long. Respond directly with JSON, following this JSON schema, and no other text. If no valid postcode is found, return an empty string for "postcode".\n\n{ "postcode": "string" }`,
                            },
                            {
                                type: 'image_url',
                                image_url: { url: imageDataUrl },
                            },
                        ],
                    }, ],
                    json: true,
                });

                const result = JSON.parse(completion.content);

                if (result.postcode) {
                    clearInterval(state.scanIntervalId); // Stop scanning
                    elements.scannedPostcodeResult.textContent = result.postcode;
                    elements.scannerResultContainer.style.display = 'block';
                    elements.scannerStatus.textContent = 'Postcode Found!';
                } else {
                    elements.scannerStatus.textContent = 'Scanning... No postcode detected yet.';
                }
            } catch (error) {
                console.error('Error during postcode scan:', error);
                elements.scannerStatus.textContent = 'Error during scan. Retrying...';
            }
        }
})();
