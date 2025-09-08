(function(){
function updateDeliveryStopsUI() {
            elements.stopList.innerHTML = '';
            state.deliveryStops.forEach((stop, index) => {
                const li = document.createElement('li');
                li.className = `stop-item ${stop.completed ? 'completed' : ''} ${index === state.currentStopIndex ? 'current-stop' : ''}`;

                const span = document.createElement('span');
                span.innerHTML = `<b>${index + 1}.</b> ${stop.address}`;
                span.title = stop.address;

                const completeBtn = document.createElement('button');
                completeBtn.textContent = stop.completed ? '✓' : '○';
                completeBtn.title = stop.completed ? 'Mark as incomplete' : 'Mark as complete';
                completeBtn.className = 'complete-btn';
                completeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleStopCompletion(index);
                });

                const noteBtn = document.createElement('button');
                noteBtn.textContent = '📝';
                noteBtn.title = 'Edit notes';
                noteBtn.className = 'note-btn';
                noteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openNoteModal(index);
                });

                const removeBtn = document.createElement('button');
                removeBtn.textContent = '×';
                removeBtn.title = 'Remove stop';
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeDeliveryStop(index);
                });

                li.appendChild(completeBtn);
                li.appendChild(noteBtn);
                li.appendChild(span);
                li.appendChild(removeBtn);
                elements.stopList.appendChild(li);
            });

            elements.stopCount.textContent = state.deliveryStops.length;
            updateMapMarkers();
        }
})();
