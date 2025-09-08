(function(){
function openNoteModal(index) {
            state.currentNoteIndex = index;
            const stop = index === 'start' ? state.startLocation : state.deliveryStops[index];
            
            elements.noteModalTitle.textContent = index === 'start' ? 'Start Location Notes' : `Stop ${index + 1} Notes`;
            elements.noteModalText.value = stop.notes || '';
            elements.noteModal.style.display = 'block';
            elements.noteModalText.focus();
        }
})();
