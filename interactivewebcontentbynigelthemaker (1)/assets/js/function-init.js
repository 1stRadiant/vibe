(function(){
function init() {
            // Set saved API key if exists
            if (state.apiKey) {
                elements.apiKeyInput.value = state.apiKey;
                updateApiKeyStatus(true);
                loadGoogleMapsSDK(); // Load SDK with the key
            } else {
                updateApiKeyStatus(false);
            }

            // Set saved optimization method
            if (state.optimizationMethod === 'distance') {
                elements.optimizeDistance.checked = true;
            } else if (state.optimizationMethod === 'time') {
                elements.optimizeTime.checked = true;
            } else if (state.optimizationMethod === 'fuel') {
                elements.optimizeFuel.checked = true;
            } else if (state.optimizationMethod === 'roundtrip') {
                elements.roundTrip.checked = true;
            }

            // Set initial map visibility
            if (state.mapVisible) {
                toggleMapVisibility();
            }

            // Set AI training data if exists
            if (state.aiTrainingData) {
                elements.aiTrainingData.value = state.aiTrainingData;
            }

            // Load saved state if exists
            loadSavedState();

            // Check location permission
            checkLocationPermission();

            // Event listeners
            elements.hamburgerMenuBtn.addEventListener('click', toggleSideMenu);
            document.addEventListener('click', (e) => {
                if (elements.sideMenu.classList.contains('visible') && !elements.sideMenu.contains(e.target) && !elements.hamburgerMenuBtn.contains(e.target)) {
                    toggleSideMenu();
                }
            });
            
            elements.menuItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabId = item.dataset.tab;
                    if (tabId) {
                        switchTab(tabId);
                        toggleSideMenu();
                    }
                });
            });

            elements.saveApiKeyBtn.addEventListener('click', saveApiKey);
            elements.startLocationInput.addEventListener('input', debounce(() => handleLocationInput(elements.startLocationInput, elements.startSuggestions, true), 300));
            elements.deliveryLocationInput.addEventListener('input', debounce(() => handleLocationInput(elements.deliveryLocationInput, elements.deliverySuggestions, false), 300));
            elements.addStopBtn.addEventListener('click', addDeliveryStop);
            elements.calculateRouteBtn.addEventListener('click', calculateRoute);
            elements.clearAllBtn.addEventListener('click', clearAll);
            elements.searchPostcodeBtn.addEventListener('click', searchPostcodeForResults);
            elements.toggleMapMenuItem.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMapVisibility();
                toggleSideMenu();
            });
            elements.closeMapBtn.addEventListener('click', toggleMapVisibility);
            elements.requestLocationBtn.addEventListener('click', requestLocationPermission);
            elements.saveNoteBtn.addEventListener('click', saveNote);
            elements.cancelNoteBtn.addEventListener('click', closeNoteModal);
            elements.noteModalClose.addEventListener('click', closeNoteModal);

            // AI Chat event listeners
            elements.aiChatSend.addEventListener('click', sendAiMessage);
            elements.aiChatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendAiMessage();
            });
            
            // Quick action buttons
            document.querySelectorAll('.ai-chat-quick-action').forEach(button => {
                if (button.id !== 'ai-settings-btn') {
                    button.addEventListener('click', (e) => {
                        const prompt = e.target.getAttribute('data-prompt');
                        elements.aiChatInput.value = prompt;
                        sendAiMessage();
                    });
                }
            });

            // AI Settings event listeners
            elements.aiSettingsBtn.addEventListener('click', openAiSettings);
            elements.aiSettingsClose.addEventListener('click', closeAiSettings);
            elements.closeAiSettings.addEventListener('click', closeAiSettings);
            elements.trainAiBtn.addEventListener('click', trainAiWithData);
            elements.scanParcelBtn.addEventListener('click', handleParcelScan);

            // Notification permission banner listeners
            elements.enableNotificationsBtn.addEventListener('click', requestNotificationPermission);
            elements.dismissNotificationsBtn.addEventListener('click', () => {
                elements.notificationBanner.style.display = 'none';
            });

            // Postcode Scanner event listeners
            elements.scanPostcodeBtn.addEventListener('click', startPostcodeScanner);
            elements.scannerModalClose.addEventListener('click', stopPostcodeScanner);
            elements.confirmPostcodeBtn.addEventListener('click', () => {
                elements.postcodeSearchInput.value = elements.scannedPostcodeResult.textContent;
                stopPostcodeScanner();
                elements.searchPostcodeBtn.click(); // Automatically search after confirming
            });
            elements.retryScanBtn.addEventListener('click', () => {
                elements.scannerResultContainer.style.display = 'none';
                elements.scannerStatus.textContent = 'Scanning...';
                startScanInterval();
            });

            // Close modals when clicking outside
            window.addEventListener('click', (event) => {
                if (event.target === elements.noteModal) {
                    closeNoteModal();
                }
                if (event.target === elements.aiSettingsModal) {
                    closeAiSettings();
                }
            });

            // Route optimization selection
            elements.optimizeDistance.addEventListener('change', () => {
                if (elements.optimizeDistance.checked) {
                    state.optimizationMethod = 'closest-to-start';
                    localStorage.setItem('routeOptimizationMethod', 'closest-to-start');
                }
            });
            elements.optimizeTime.addEventListener('change', () => {
                if (elements.optimizeTime.checked) {
                    state.optimizationMethod = 'time';
                    localStorage.setItem('routeOptimizationMethod', 'time');
                }
            });
            elements.optimizeFuel.addEventListener('change', () => {
                if (elements.optimizeFuel.checked) {
                    state.optimizationMethod = 'fuel';
                    localStorage.setItem('routeOptimizationMethod', 'fuel');
                }
            });
            elements.optimizeCluster.addEventListener('change', () => {
                if (elements.optimizeCluster.checked) {
                    state.optimizationMethod = 'cluster';
                    localStorage.setItem('routeOptimizationMethod', 'cluster');
                }
            });
            elements.roundTrip.addEventListener('change', () => {
                if (elements.roundTrip.checked) {
                    state.optimizationMethod = 'roundtrip';
                    localStorage.setItem('routeOptimizationMethod', 'roundtrip');
                }
            });

            elements.deliveryLocationInput.addEventListener('input', () => {
                 if (state.selectedDeliveryLocation && elements.deliveryLocationInput.value !== state.selectedDeliveryLocation.address) {
                     state.selectedDeliveryLocation = null;
                     elements.addStopBtn.disabled = true;
                 }
            });
            
            elements.startLocationInput.addEventListener('input', () => {
                 if (state.startLocation && elements.startLocationInput.value !== state.startLocation.address) {
                     state.startLocation = null;
                     updateMapMarkers();
                     updateCalculateRouteButton();
                 }
            });

            document.addEventListener('click', (e) => {
                 if (!elements.startLocationInput.contains(e.target) && !elements.startSuggestions.contains(e.target)) {
                    elements.startSuggestions.style.display = 'none';
                }
                 if (!elements.deliveryLocationInput.contains(e.target) && !elements.deliverySuggestions.contains(e.target)) {
                    elements.deliverySuggestions.style.display = 'none';
                }
                 if (!elements.postcodeSearchInput.contains(e.target) && !elements.searchPostcodeBtn.contains(e.target) && !elements.addressResults.contains(e.target)) {
                    elements.addressResults.style.display = 'none';
                }
            });

            elements.viewLiveRouteBtn.addEventListener('click', () => {
                switchTab('route-tab');
            });

            elements.startStopSelect.addEventListener('change', (e) => {
                state.startStopOverride = e.target.value || null;
                saveState();
            });

            elements.endStopSelect.addEventListener('change', (e) => {
                state.endStopOverride = e.target.value || null;
                saveState();
            });

            updateCalculateRouteButton();
            updateViewLiveRouteButton();
        }
})();
