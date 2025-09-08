(function(){
function updateStopConstraintDropdowns() {
            const stops = state.deliveryStops;
            const startSelect = elements.startStopSelect;
            const endSelect = elements.endStopSelect;

            const currentStartVal = startSelect.value;
            const currentEndVal = endSelect.value;

            startSelect.innerHTML = '<option value="">Automatic</option>';
            endSelect.innerHTML = '<option value="">Automatic</option>';

            stops.forEach(stop => {
                const optionStart = document.createElement('option');
                optionStart.value = stop.address;
                optionStart.textContent = stop.address;
                startSelect.appendChild(optionStart);

                const optionEnd = document.createElement('option');
                optionEnd.value = stop.address;
                optionEnd.textContent = stop.address;
                endSelect.appendChild(optionEnd);
            });

            startSelect.value = currentStartVal;
            endSelect.value = currentEndVal;
        }
})();
