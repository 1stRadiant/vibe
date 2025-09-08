(function(){
function trainAiWithData() {
            const trainingData = elements.aiTrainingData.value.trim();
            if (!trainingData) {
                addAiMessage("Please enter some training data first.");
                return;
            }

            state.aiTrainingData = trainingData;
            localStorage.setItem('aiTrainingData', trainingData);
            addAiMessage("AI training data saved successfully. The assistant will use this data for future recommendations.");
            closeAiSettings();
        }
})();
