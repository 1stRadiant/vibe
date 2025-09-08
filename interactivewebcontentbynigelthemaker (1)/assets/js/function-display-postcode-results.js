(function(){
function displayPostcodeResults(results) {
            elements.addressResults.innerHTML = '';
            if (!results || results.length === 0) {
                const noResultDiv = document.createElement('div');
                noResultDiv.className = 'address-result-item';
                noResultDiv.style.fontStyle = 'italic';
                noResultDiv.style.color = '#888';
                noResultDiv.textContent = 'No addresses found for this postcode.';
                elements.addressResults.appendChild(noResultDiv);
                elements.addressResults.style.display = 'block';
                return;
            }

            results.forEach(result => {
                 if (!result || !result.address || !result.coordinates) return;

                const div = document.createElement('div');
                div.className = 'address-result-item';
                div.textContent = result.address;
                div.addEventListener('click', () => {
                    elements.deliveryLocationInput.value = result.address;
                    state.selectedDeliveryLocation = result;
                    elements.addStopBtn.disabled = false;
                    elements.addressResults.style.display = 'none';
                    elements.deliveryLocationInput.focus();
                });
                elements.addressResults.appendChild(div);
            });

            elements.addressResults.style.display = 'block';
        }
})();
