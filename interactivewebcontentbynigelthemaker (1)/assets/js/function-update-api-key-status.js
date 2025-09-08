(function(){
function updateApiKeyStatus(isSet) {
            if (isSet) {
                elements.apiKeyStatus.textContent = 'Saved';
                elements.apiKeyStatus.classList.remove('not-set');
                elements.apiKeyStatus.classList.add('saved');
            } else {
                elements.apiKeyStatus.textContent = 'Not set';
                elements.apiKeyStatus.classList.remove('saved');
                elements.apiKeyStatus.classList.add('not-set');
            }
        }
})();
