// DOM Elements
const promptEditor = document.getElementById('promptEditor');
const llmResponse = document.getElementById('llmResponse');
const submitButton = document.getElementById('submitAnalysis');
const loadingIndicator = document.getElementById('loadingIndicator');

// Button Elements
const clearPromptBtn = document.getElementById('clearPrompt');
const loadTemplateBtn = document.getElementById('loadTemplate');
const copyResponseBtn = document.getElementById('copyResponse');
const clearResponseBtn = document.getElementById('clearResponse');

// Bounding Box Input Elements
const gtX1 = document.getElementById('gtX1');
const gtY1 = document.getElementById('gtY1');
const gtX2 = document.getElementById('gtX2');
const gtY2 = document.getElementById('gtY2');
const xaiX1 = document.getElementById('xaiX1');
const xaiY1 = document.getElementById('xaiY1');
const xaiX2 = document.getElementById('xaiX2');
const xaiY2 = document.getElementById('xaiY2');

// Additional Input Elements
const xaiTechnique = document.getElementById('xaiTechnique');
const modelArchitecture = document.getElementById('modelArchitecture');
const dataset = document.getElementById('dataset');

// Image Upload Elements
const originalImageInput = document.getElementById('originalImageInput');
const heatmapImageInput = document.getElementById('heatmapImageInput');
const originalImageUpload = document.getElementById('originalImageUpload');
const heatmapImageUpload = document.getElementById('heatmapImageUpload');

// Sample prompt template
const promptTemplate = `Analyze the discrepancy between the ground truth bounding box and the XAI-generated bounding box for the given coordinates.

Context:
- XAI Technique: {xaiTechnique}
- Model Architecture: {modelArchitecture}
- Dataset: {dataset}

Ground Truth Bounding Box: ({gtX1}, {gtY1}) to ({gtX2}, {gtY2})
XAI Generated Bounding Box: ({xaiX1}, {xaiY1}) to ({xaiX2}, {xaiY2})

Please provide a comprehensive analysis covering:

1. **Quantitative Analysis:**
   - Calculate IoU (Intersection over Union) between the bounding boxes
   - Measure the center point distance
   - Analyze the area difference

2. **Qualitative Analysis:**
   - Identify potential reasons for the discrepancy
   - Consider the limitations of the specific XAI technique
   - Evaluate the impact of model architecture on XAI performance

3. **Technical Factors:**
   - How the XAI technique works and its inherent limitations
   - Model-specific considerations (ResNet-50 vs U-Net)
   - Dataset characteristics that might affect XAI performance

4. **Recommendations:**
   - Suggest improvements for better XAI performance
   - Alternative XAI techniques that might work better
   - Model architecture modifications if applicable

5. **Research Insights:**
   - Relate findings to existing literature on XAI limitations
   - Discuss the trade-off between model performance and explainability

Please provide specific, actionable insights that can help improve the XAI technique's alignment with ground truth annotations.`;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the interface
    initializeInterface();
    
    // Add event listeners
    submitButton.addEventListener('click', handleSubmit);
    clearPromptBtn.addEventListener('click', clearPrompt);
    loadTemplateBtn.addEventListener('click', loadTemplate);
    copyResponseBtn.addEventListener('click', copyResponse);
    clearResponseBtn.addEventListener('click', clearResponse);
    
    // Add input validation
    addInputValidation();
    setupImageUpload();
});

function initializeInterface() {
    // Set default values or load from localStorage if available
    const savedPrompt = localStorage.getItem('xaiAnalysisPrompt');
    if (savedPrompt) {
        promptEditor.value = savedPrompt;
    }
    
    // Add placeholder text with helpful hints
    promptEditor.placeholder = `Enter your analysis prompt here...

Example:
Analyze the discrepancy between the ground truth bounding box and the XAI-generated bounding box. Consider factors like:
- Model architecture differences
- XAI technique limitations  
- Image characteristics
- Potential improvements

You can also use the "Load Template" button to get a comprehensive analysis template.`;
}

function addInputValidation() {
    // Add real-time validation for coordinate inputs
    const coordinateInputs = [gtX1, gtY1, gtX2, gtY2, xaiX1, xaiY1, xaiX2, xaiY2];
    
    coordinateInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            if (value < 0) {
                this.style.borderColor = '#e53e3e';
                this.style.boxShadow = '0 0 0 3px rgba(229, 62, 62, 0.1)';
            } else {
                this.style.borderColor = '#e2e8f0';
                this.style.boxShadow = 'none';
            }
        });
    });
}

async function handleSubmit() {
    // Validate inputs
    if (!validateInputs()) {
        showNotification('Please fill in all required fields and upload images', 'error');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Prepare the data
        const analysisData = prepareAnalysisData();
        
        // Simulate API call (replace with actual API endpoint)
        const response = await simulateLLMAnalysis(analysisData);
        
        // Display the response
        displayResponse(response);
        
        // Save prompt to localStorage
        localStorage.setItem('xaiAnalysisPrompt', promptEditor.value);
        
        showNotification('Analysis completed successfully!', 'success');
        
    } catch (error) {
        console.error('Error during analysis:', error);
        showNotification('Error during analysis. Please try again.', 'error');
        displayResponse('Error: Unable to complete analysis. Please check your inputs and try again.');
    } finally {
        setLoadingState(false);
    }
}

function validateInputs() {
    const requiredFields = [
        promptEditor.value.trim(),
        gtX1.value, gtY1.value, gtX2.value, gtY2.value,
        xaiX1.value, xaiY1.value, xaiX2.value, xaiY2.value,
        xaiTechnique.value,
        modelArchitecture.value,
        dataset.value
    ];
    const hasImages = document.getElementById('originalImageDisplay').src !== 'data:,' || 
                     document.getElementById('heatmapImageDisplay').src !== 'data:,';
    return requiredFields.every(field => field !== '' && field !== null) && hasImages;
}

function prepareAnalysisData() {
    const originalImage = document.getElementById('originalImageDisplay').src;
    const heatmapImage = document.getElementById('heatmapImageDisplay').src;
    return {
        prompt: promptEditor.value.trim(),
        groundTruth: {
            x1: parseFloat(gtX1.value),
            y1: parseFloat(gtY1.value),
            x2: parseFloat(gtX2.value),
            y2: parseFloat(gtY2.value)
        },
        xaiGenerated: {
            x1: parseFloat(xaiX1.value),
            y1: parseFloat(xaiY1.value),
            x2: parseFloat(xaiX2.value),
            y2: parseFloat(xaiY2.value)
        },
        metadata: {
            xaiTechnique: xaiTechnique.value,
            modelArchitecture: modelArchitecture.value,
            dataset: dataset.value
        },
        images: {
            original: originalImage !== 'data:,' ? originalImage : null,
            heatmap: heatmapImage !== 'data:,' ? heatmapImage : null
        }
    };
}

async function simulateLLMAnalysis(data) {
    // This is a simulation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calculate some basic metrics
    const gtArea = Math.abs((data.groundTruth.x2 - data.groundTruth.x1) * (data.groundTruth.y2 - data.groundTruth.y1));
    const xaiArea = Math.abs((data.xaiGenerated.x2 - data.xaiGenerated.x1) * (data.xaiGenerated.y2 - data.xaiGenerated.y1));
    const areaDiff = Math.abs(gtArea - xaiArea);
    const areaDiffPercent = (areaDiff / gtArea) * 100;
    
    // Calculate center points
    const gtCenterX = (data.groundTruth.x1 + data.groundTruth.x2) / 2;
    const gtCenterY = (data.groundTruth.y1 + data.groundTruth.y2) / 2;
    const xaiCenterX = (data.xaiGenerated.x1 + data.xaiGenerated.x2) / 2;
    const xaiCenterY = (data.xaiGenerated.y1 + data.xaiGenerated.y2) / 2;
    const centerDistance = Math.sqrt(Math.pow(gtCenterX - xaiCenterX, 2) + Math.pow(gtCenterY - xaiCenterY, 2));
    
    return `# XAI Analysis Report

## Executive Summary
Analysis of ${data.metadata.xaiTechnique} performance on ${data.metadata.dataset} using ${data.metadata.modelArchitecture} architecture.

## Quantitative Analysis

### Bounding Box Metrics
- **Ground Truth Area**: ${gtArea.toFixed(2)} square units
- **XAI Generated Area**: ${xaiArea.toFixed(2)} square units
- **Area Difference**: ${areaDiff.toFixed(2)} square units (${areaDiffPercent.toFixed(1)}% difference)
- **Center Point Distance**: ${centerDistance.toFixed(2)} units

### Coordinate Comparison
**Ground Truth**: (${data.groundTruth.x1}, ${data.groundTruth.y1}) to (${data.groundTruth.x2}, ${data.groundTruth.y2})
**XAI Generated**: (${data.xaiGenerated.x1}, ${data.xaiGenerated.y1}) to (${data.xaiGenerated.x2}, ${data.xaiGenerated.y2})

## Qualitative Analysis

### Potential Discrepancy Factors

1. **XAI Technique Limitations**
   - ${data.metadata.xaiTechnique} may struggle with complex spatial relationships
   - Gradient-based methods can be sensitive to model architecture choices
   - Localization accuracy varies based on feature map resolution

2. **Model Architecture Impact**
   - ${data.metadata.modelArchitecture} architecture characteristics affect XAI performance
   - Different layer structures produce varying quality explanations
   - Skip connections and residual blocks influence gradient flow

3. **Dataset-Specific Considerations**
   - ${data.metadata.dataset} characteristics may affect XAI technique effectiveness
   - Image resolution and annotation quality impact results
   - Domain-specific features may not be well-captured by current XAI methods

## Technical Recommendations

### Immediate Improvements
1. **Try Alternative XAI Techniques**
   - Consider ${getAlternativeTechniques(data.metadata.xaiTechnique)}
   - Experiment with ensemble methods combining multiple XAI approaches

2. **Model Architecture Adjustments**
   - Fine-tune attention mechanisms for better localization
   - Consider adding auxiliary tasks for improved feature learning
   - Implement multi-scale feature fusion

3. **Preprocessing Enhancements**
   - Normalize input images consistently
   - Apply data augmentation techniques
   - Consider resolution-specific preprocessing

### Long-term Strategies
1. **Research Directions**
   - Investigate attention-based XAI methods
   - Explore self-supervised learning for better feature representations
   - Consider developing domain-specific XAI techniques

2. **Evaluation Framework**
   - Implement comprehensive evaluation metrics
   - Create benchmark datasets for XAI performance
   - Develop automated quality assessment tools

## Conclusion
The observed discrepancy (${areaDiffPercent.toFixed(1)}% area difference) suggests that while ${data.metadata.xaiTechnique} provides useful insights, there's room for improvement in localization accuracy. The ${centerDistance.toFixed(2)} unit center distance indicates moderate spatial alignment issues that should be addressed through the recommended improvements.

**Next Steps**: Implement the suggested alternative techniques and architectural modifications to improve XAI performance and achieve better alignment with ground truth annotations.`;
}

function getAlternativeTechniques(currentTechnique) {
    const alternatives = {
        'gradcam': 'Grad-CAM++, Eigen-CAM, or Guided Grad-CAM',
        'gradcam++': 'Eigen-CAM, LIME, or Integrated Gradients',
        'lime': 'Grad-CAM, SHAP, or Kernel SHAP',
        'eigencam': 'Grad-CAM, Grad-CAM++, or Guided Backpropagation',
        'guidedgradcam': 'Eigen-CAM, LIME, or Integrated Gradients'
    };
    return alternatives[currentTechnique] || 'other gradient-based or perturbation-based methods';
}

function displayResponse(response) {
    llmResponse.innerHTML = response;
}

function setLoadingState(isLoading) {
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    } else {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Analyze with LLM';
    }
}

function clearPrompt() {
    promptEditor.value = '';
    showNotification('Prompt cleared', 'info');
}

function loadTemplate() {
    const template = promptTemplate
        .replace('{xaiTechnique}', xaiTechnique.value || '[XAI_TECHNIQUE]')
        .replace('{modelArchitecture}', modelArchitecture.value || '[MODEL_ARCHITECTURE]')
        .replace('{dataset}', dataset.value || '[DATASET]')
        .replace('{gtX1}', gtX1.value || '[GT_X1]')
        .replace('{gtY1}', gtY1.value || '[GT_Y1]')
        .replace('{gtX2}', gtX2.value || '[GT_X2]')
        .replace('{gtY2}', gtY2.value || '[GT_Y2]')
        .replace('{xaiX1}', xaiX1.value || '[XAI_X1]')
        .replace('{xaiY1}', xaiY1.value || '[XAI_Y1]')
        .replace('{xaiX2}', xaiX2.value || '[XAI_X2]')
        .replace('{xaiY2}', xaiY2.value || '[XAI_Y2]');
    
    promptEditor.value = template;
    showNotification('Template loaded', 'success');
}

async function copyResponse() {
    const responseText = llmResponse.textContent;
    if (responseText && responseText.trim() !== '') {
        try {
            await navigator.clipboard.writeText(responseText);
            showNotification('Response copied to clipboard', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = responseText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Response copied to clipboard', 'success');
        }
    } else {
        showNotification('No response to copy', 'warning');
    }
}

function clearResponse() {
    llmResponse.innerHTML = `
        <div class="placeholder">
            <i class="fas fa-robot"></i>
            <p>LLM analysis will appear here after submission</p>
        </div>
    `;
    showNotification('Response cleared', 'info');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#48bb78',
        'error': '#f56565',
        'warning': '#ed8936',
        'info': '#4299e1'
    };
    return colors[type] || '#4299e1';
}

function setupImageUpload() {
    // Original image upload
    originalImageUpload.addEventListener('click', () => originalImageInput.click());
    originalImageInput.addEventListener('change', (e) => handleImageUpload(e, 'original'));
    // Heatmap image upload
    heatmapImageUpload.addEventListener('click', () => heatmapImageInput.click());
    heatmapImageInput.addEventListener('change', (e) => handleImageUpload(e, 'heatmap'));
    // Drag and drop functionality
    setupDragAndDrop(originalImageUpload, originalImageInput, 'original');
    setupDragAndDrop(heatmapImageUpload, heatmapImageInput, 'heatmap');
}

function handleImageUpload(event, type) {
    const file = event.target.files[0];
    if (file) {
        validateAndDisplayImage(file, type);
    }
}

function validateAndDisplayImage(file, type) {
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        displayImagePreview(e.target.result, type);
        showNotification(`${type === 'original' ? 'Original' : 'Heatmap'} image uploaded successfully`, 'success');
    };
    reader.readAsDataURL(file);
}

function displayImagePreview(imageSrc, type) {
    const uploadArea = document.getElementById(`${type}ImageUpload`);
    const preview = document.getElementById(`${type}ImagePreview`);
    const imageDisplay = document.getElementById(`${type}ImageDisplay`);
    uploadArea.style.display = 'none';
    preview.style.display = 'block';
    imageDisplay.src = imageSrc;
}

function removeImage(type) {
    const uploadArea = document.getElementById(`${type}ImageUpload`);
    const preview = document.getElementById(`${type}ImagePreview`);
    const input = document.getElementById(`${type}ImageInput`);
    input.value = '';
    uploadArea.style.display = 'block';
    preview.style.display = 'none';
    showNotification(`${type === 'original' ? 'Original' : 'Heatmap'} image removed`, 'info');
}

function setupDragAndDrop(uploadArea, input, type) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            input.files = files;
            handleImageUpload({ target: { files: files } }, type);
        }
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
    }
    
    // Ctrl/Cmd + L to load template
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        loadTemplate();
    }
    
    // Ctrl/Cmd + K to clear prompt
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearPrompt();
    }
});

// Add helpful tooltips
document.addEventListener('DOMContentLoaded', function() {
    // Add tooltips to buttons
    const tooltips = {
        'clearPrompt': 'Clear the prompt editor (Ctrl/Cmd + K)',
        'loadTemplate': 'Load a comprehensive analysis template (Ctrl/Cmd + L)',
        'copyResponse': 'Copy the LLM response to clipboard',
        'clearResponse': 'Clear the LLM response area',
        'submitAnalysis': 'Submit analysis to LLM (Ctrl/Cmd + Enter)'
    };
    
    Object.keys(tooltips).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltips[id];
        }
    });
}); 