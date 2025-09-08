(function(){
// Initialize the map centered on Great Britain
        const map = L.map('map').setView([54.5, -4], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Application state
        const state = {
            apiKey: localStorage.getItem('googleMapsApiKey') || '',
            startLocation: null,
            deliveryStops: [],
            selectedDeliveryLocation: null,
            routeCalculated: false,
            optimizationMethod: localStorage.getItem('routeOptimizationMethod') || 'time',
            mapVisible: localStorage.getItem('mapVisible') === 'true' || false,
            currentNoteIndex: null,
            startStopOverride: null,
            endStopOverride: null,
            geminiApiKey: localStorage.getItem('geminiApiKey') || '',
            aiTrainingData: localStorage.getItem('aiTrainingData') || '',
            currentStopIndex: 0,
            hasNewAiNotification: false,
            isScanning: false,
            scanIntervalId: null,
            videoStream: null
        };

        // Google Maps SDK Services
        let autocompleteService;
        let placesService;
        let geocoder;

        // DOM elements
        const elements = {
            hamburgerMenuBtn: document.getElementById('hamburger-menu-btn'),
            sideMenu: document.getElementById('side-menu'),
            menuItems: document.querySelectorAll('.menu-item'),
            toggleMapMenuItem: document.getElementById('toggle-map-menu-item'),
            apiKeyInput: document.getElementById('api-key-input'),
            saveApiKeyBtn: document.getElementById('save-api-key'),
            apiKeyStatus: document.getElementById('api-key-status'),
            startLocationInput: document.getElementById('start-location'),
            startSuggestions: document.getElementById('start-suggestions'),
            deliveryLocationInput: document.getElementById('delivery-location'),
            deliverySuggestions: document.getElementById('delivery-suggestions'),
            stopNotesInput: document.getElementById('stop-notes'),
            addStopBtn: document.getElementById('add-stop'),
            stopList: document.getElementById('stop-list'),
            stopCount: document.getElementById('stop-count'),
            calculateRouteBtn: document.getElementById('calculate-route'),
            clearAllBtn: document.getElementById('clear-all'),
            routeSummary: document.getElementById('route-summary'),
            routeDetails: document.getElementById('route-details'),
            routeSequence: document.getElementById('route-sequence'),
            postcodeSearchInput: document.getElementById('postcode-search'),
            searchPostcodeBtn: document.getElementById('search-postcode'),
            addressResults: document.getElementById('address-results'),
            optimizeDistance: document.getElementById('optimize-distance'),
            optimizeTime: document.getElementById('optimize-time'),
            optimizeFuel: document.getElementById('optimize-fuel'),
            roundTrip: document.getElementById('round-trip'),
            toggleMapBtn: document.getElementById('toggle-map'),
            mapContainer: document.getElementById('map'),
            closeMapBtn: document.getElementById('close-map'),
            locationStatus: document.getElementById('location-status'),
            requestLocationBtn: document.getElementById('request-location'),
            noteModal: document.getElementById('note-modal'),
            noteModalTitle: document.getElementById('note-modal-title'),
            noteModalText: document.getElementById('note-modal-text'),
            saveNoteBtn: document.getElementById('save-note'),
            cancelNoteBtn: document.getElementById('cancel-note'),
            noteModalClose: document.querySelector('.note-modal-close'),
            // AI Assistant elements
            aiChatToggle: document.getElementById('ai-chat-toggle'),
            aiChatContainer: document.getElementById('ai-chat-container'),
            aiChatHeader: document.getElementById('ai-chat-header'),
            aiChatClose: document.getElementById('ai-chat-close'),
            aiChatBody: document.getElementById('ai-chat-body'),
            aiChatInput: document.getElementById('ai-chat-input'),
            aiChatSend: document.getElementById('ai-chat-send'),
            aiQuickActions: document.getElementById('ai-quick-actions'),
            aiNotificationBadge: document.getElementById('ai-notification-badge'),
            // AI Settings elements
            aiSettingsModal: document.getElementById('ai-settings-modal'),
            aiSettingsBtn: document.getElementById('ai-settings-btn'),
            aiSettingsClose: document.querySelector('.ai-settings-close'),
            closeAiSettings: document.getElementById('close-ai-settings'),
            aiTrainingData: document.getElementById('ai-training-data'),
            trainAiBtn: document.getElementById('train-ai'),
            parcelScanInput: document.getElementById('parcel-scan'),
            scanParcelBtn: document.getElementById('scan-parcel'),
            // Notification Banner
            notificationBanner: document.getElementById('notification-permission-banner'),
            enableNotificationsBtn: document.getElementById('enable-notifications'),
            dismissNotificationsBtn: document.getElementById('dismiss-notifications'),
            // Tabs
            tabButtons: document.querySelectorAll('.tab-button'), // Kept for logic, but UI is hidden
            tabPanes: document.querySelectorAll('.tab-pane'),
            optimizeCluster: document.getElementById('optimize-cluster'),
            // Postcode Scanner elements
            scanPostcodeBtn: document.getElementById('scan-postcode-btn'),
            startStopSelect: document.getElementById('start-stop-select'),
            endStopSelect: document.getElementById('end-stop-select'),
            postcodeScannerModal: document.getElementById('postcode-scanner-modal'),
            scannerModalClose: document.getElementById('scanner-modal-close'),
            scannerVideo: document.getElementById('scanner-video'),
            scannerCanvas: document.getElementById('scanner-canvas'),
            scannerStatus: document.getElementById('scanner-status'),
            scannerResultContainer: document.getElementById('scanner-result-container'),
            scannedPostcodeResult: document.getElementById('scanned-postcode-result'),
            confirmPostcodeBtn: document.getElementById('confirm-postcode-btn'),
            retryScanBtn: document.getElementById('retry-scan-btn'),
            recalculateRouteLiveBtn: document.getElementById('recalculate-route-live'),
            searchLiveRouteInput: document.getElementById('search-live-route'),
            viewLiveRouteBtn: document.getElementById('view-live-route-btn')
        };
init();
})();
