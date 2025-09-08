(function(){
function updateRouteSummaryUI(routePoints) {
            if (!routePoints) { // If called without specific points (e.g., on completion toggle)
                routePoints = [state.startLocation, ...state.deliveryStops];
                if (state.optimizationMethod === 'roundtrip' && state.startLocation) {
                    routePoints.push({
                        ...state.startLocation,
                        address: `Return to: ${state.startLocation.address}`,
                        isReturn: true
                    });
                }
            }

            elements.routeSequence.innerHTML = '';
            
            let stopCounter = 0;
            routePoints.forEach((point, index) => {
                if (!point || !point.address || !Array.isArray(point.coordinates) || point.coordinates.length !== 2) return;

                const li = document.createElement('li');
                
                // Find the original stop object from state.deliveryStops to get its current properties
                // This is crucial because `routePoints` can be a temporary, reordered list
                const originalStopIndexInState = state.deliveryStops.findIndex(s => s.address === point.address);
                const isDeliveryStop = !point.isReturn && index > 0;
                const actualPointReference = isDeliveryStop && originalStopIndexInState > -1 
                    ? state.deliveryStops[originalStopIndexInState]
                    : state.startLocation;

                if (actualPointReference && actualPointReference.completed) {
                    li.className = 'completed';
                }

                // Highlight if it's the current stop
                if (isDeliveryStop && originalStopIndexInState === state.currentStopIndex) {
                    li.classList.add('current-stop');
                }
                    
                const textSpan = document.createElement('span');
                let label;
                if (index === 0) {
                    label = "Start";
                } else if (point.isReturn) {
                    label = "Return";
                } else {
                    stopCounter++;
                    label = `Stop ${stopCounter}`;
                }
                
                textSpan.innerHTML = `<b>${label}:</b> ${point.address}${actualPointReference.notes ? `<br><small style="color:#666;">Note: ${actualPointReference.notes}</small>` : ''}`;
                textSpan.title = point.address;
                li.appendChild(textSpan);

                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.gap = '5px';

                // Complete button
                const completeButton = document.createElement('button');
                completeButton.textContent = (actualPointReference && actualPointReference.completed) ? '✓' : '○';
                completeButton.title = (actualPointReference && actualPointReference.completed) ? 'Mark as incomplete' : 'Mark as complete';
                completeButton.className = 'complete-btn';
                completeButton.addEventListener('click', () => {
                     if (isDeliveryStop && originalStopIndexInState !== -1) {
                        toggleStopCompletion(originalStopIndexInState);
                    } else if (index === 0) { // It's the start location
                         state.startLocation.completed = !state.startLocation.completed;
                         updateCurrentStopIndex();
                         updateAllUIs();
                         saveState();
                    }
                });
                buttonContainer.appendChild(completeButton);

                // Note button
                const noteButton = document.createElement('button');
                noteButton.textContent = '📝';
                noteButton.classList.add('note-btn');
                noteButton.title = 'Edit notes';
                noteButton.addEventListener('click', () => {
                    if (isDeliveryStop && originalStopIndexInState !== -1) {
                        openNoteModal(originalStopIndexInState);
                    } else { // Start or Return point
                        openNoteModal('start');
                    }
                });
                buttonContainer.appendChild(noteButton);

                // Navigation button
                const [lat, lng] = point.coordinates;
                if (typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)) {
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

                    const navButton = document.createElement('button');
                    navButton.textContent = 'Navigate';
                    navButton.classList.add('navigate-btn');
                    navButton.title = `Open navigation to ${label} in Google Maps`;
                    navButton.addEventListener('click', async () => {
                        // Check if it's a delivery stop (not start or return)
                        if (isDeliveryStop && originalStopIndexInState !== -1) {
                            // 1. Update current stop index
                            state.currentStopIndex = originalStopIndexInState;
                            
                            // 2. Update all UIs to reflect the new current stop
                            updateAllUIs();
                            
                            // 3. Save the state
                            saveState();

                            // 4. Show native notification for the new current stop
                            await showCurrentStopNotification(actualPointReference);
                        }
                        
                        // 5. Open Google Maps for navigation
                        window.open(googleMapsUrl, '_blank');
                    });
                    buttonContainer.appendChild(navButton);
                } else {
                    const noNavSpan = document.createElement('span');
                    noNavSpan.style.fontSize = '0.8em';
                    noNavSpan.style.fontStyle = 'italic';
                    noNavSpan.style.marginLeft = '10px';
                    noNavSpan.textContent = '(Nav not available)';
                    buttonContainer.appendChild(noNavSpan);
                }

                li.appendChild(buttonContainer);
                elements.routeSequence.appendChild(li);
            });

            elements.routeSummary.style.display = 'block';
            handleLiveRouteSearch(); // Apply search filter after updating the list
        }
})();
