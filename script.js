const allergiesInput = document.getElementById('allergies');
const saveProfileButton = document.getElementById('save-profile');
const productInput = document.getElementById('product-input');
const scanButton = document.getElementById('scan-button');
const resultsText = document.getElementById('results-text');
const glossaryList = document.getElementById('glossary-list');

const openCameraButton = document.getElementById('open-camera-button');
const cameraView = document.getElementById('camera-view');
const captureButton = document.getElementById('capture-button');
const capturedImageCanvas = document.getElementById('captured-image');
const capturedImageContext = capturedImageCanvas.getContext('2d');
const analyzeImageButton = document.getElementById('analyze-image-button');
const extractedIngredientsTextarea = document.getElementById('extracted-ingredients');
const imageUpload = document.getElementById('image-upload');

let userAllergies = [];

// Load profile from local storage if available
const storedAllergies = localStorage.getItem('allergies');
if (storedAllergies) {
    userAllergies = storedAllergies.split(',').map(item => item.trim());
    allergiesInput.value = storedAllergies;
}

// Sample ingredient glossary (can be expanded)
const ingredientGlossary = {
    "nuts": "Can cause allergic reactions in some people.",
    "gluten": "A protein found in wheat, barley, and rye.",
    "dairy": "Products containing milk.",
    "artificial colors": "Synthetic dyes added to food.",
    "soy": "Derived from soybeans, a common allergen."
};

// Function to check ingredients against allergies
function analyzeIngredients(productIngredients) {
    let isSafe = true;
    let warnings = [];

    const lowerCaseIngredients = productIngredients.toLowerCase();

    userAllergies.forEach(allergy => {
        if (lowerCaseIngredients.includes(allergy.toLowerCase())) {
            isSafe = false;
            warnings.push(`Warning: May contain ${allergy}.`);
        }
    });

    for (const ingredient in ingredientGlossary) {
        if (lowerCaseIngredients.includes(ingredient.toLowerCase())) {
            warnings.push(`${ingredient}: ${ingredientGlossary[ingredient]}`);
        }
    }

    if (isSafe) {
        resultsText.textContent = "This product appears to be safe based on your profile.";
    } else {
        resultsText.textContent = "Potential allergens or sensitivities detected!";
        warnings.forEach(warning => {
            resultsText.textContent += `\n${warning}`;
        });
    }
}

// Event listener for the "Scan Text" button
scanButton.addEventListener('click', () => {
    const productText = productInput.value;
    if (productText) {
        analyzeIngredients(productText);
    } else {
        resultsText.textContent = "Please enter product information or scan an image.";
    }
});

// Event listener for the "Save Profile" button
saveProfileButton.addEventListener('click', () => {
    const allergies = allergiesInput.value.trim();
    if (allergies) {
        userAllergies = allergies.split(',').map(item => item.trim());
        localStorage.setItem('allergies', allergies); // Save to local storage
        alert('Profile saved!'); // Simple feedback
    } else {
        userAllergies = [];
        localStorage.removeItem('allergies'); // Clear from local storage
        alert('Profile cleared.');
    }
});

// Populate the ingredient glossary
for (const ingredient in ingredientGlossary) {
    const listItem = document.createElement('li');
    listItem.textContent = `${ingredient}: ${ingredientGlossary[ingredient]}`;
    glossaryList.appendChild(listItem);
}

// Camera and OCR Functionality
let stream = null;

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraView.srcObject = stream;
        cameraView.style.display = 'block';
        captureButton.style.display = 'block';
    } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Could not access camera. Please make sure you have granted permission.");
    }
}

openCameraButton.addEventListener('click', startCamera);

captureButton.addEventListener('click', () => {
    capturedImageCanvas.width = cameraView.videoWidth;
    capturedImageCanvas.height = cameraView.videoHeight;
    capturedImageContext.drawImage(cameraView, 0, 0, capturedImageCanvas.width, capturedImageCanvas.height);
    cameraView.style.display = 'none';
    captureButton.style.display = 'none';
    capturedImageCanvas.style.display = 'block';
    analyzeImageButton.style.display = 'block';
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
});

analyzeImageButton.addEventListener('click', async () => {
    extractedIngredientsTextarea.value = "Analyzing...";
    try {
        const result = await Tesseract.recognize(
            capturedImageCanvas,
            'eng',
            { logger: m => console.log(m) }
        );
        extractedIngredientsTextarea.value = result.data.text;
        analyzeIngredients(result.data.text); // Analyze the extracted text
    } catch (error) {
        console.error("OCR Error:", error);
        extractedIngredientsTextarea.value = "Error during OCR. Please try again.";
    }
});

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                capturedImageCanvas.width = img.width;
                capturedImageCanvas.height = img.height;
                capturedImageContext.drawImage(img, 0, 0);
                capturedImageCanvas.style.display = 'block';
                analyzeImageButton.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
