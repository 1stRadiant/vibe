(function(){
function saveNote() {
            const notes = elements.noteModalText.value.trim();
            
            if (state.currentNoteIndex === 'start') {
                if (state.startLocation) {
                    state.startLocation.notes = notes;
                }
            } else if (state.currentNoteIndex !== null && state.deliveryStops[state.currentNoteIndex]) {
                state.deliveryStops[state.currentNoteIndex].notes = notes;
            }
            
            updateDeliveryStopsUI();
            if (state.routeCalculated) {
                updateRouteSummaryUI();
            }
            
            saveState();
            closeNoteModal();
        }
})();
