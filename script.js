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
const allergyImageUpload = document.getElementById('allergy-image-upload');
const allergyPreview = document.getElementById('allergy-preview');

const randomAllergyName = document.getElementById('random-allergy-name');
const randomAllergyDefinition = document.getElementById('random-allergy-definition');

let userAllergies = [];
let allergyImageText = null; // To store text extracted from allergy image

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
    "soy": "Derived from soybeans, a common allergen.",
    "shellfish": "Aquatic invertebrates used as food, can cause severe allergies.",
    "sesame": "Seeds that are an increasingly recognized allergen."
};

const allergiesData = [
    { name: "Peanuts", definition: "A common food allergen that can cause severe reactions." },
    { name: "Milk", definition: "Dairy products contain lactose, which some people are intolerant to." },
    { name: "Eggs", definition: "A frequent cause of food allergies, especially in children." },
    { name: "Tree Nuts", definition: "Includes almonds, walnuts, cashews, etc., and can cause severe allergies." },
    { name: "Soy", definition: "A legume that is a common food allergen." },
    { name: "Wheat", definition: "Contains gluten, which can be problematic for people with celiac disease." },
    { name: "Fish", definition: "Certain types of fish can trigger allergic reactions." },
    { name: "Shellfish", definition: "Includes crustaceans like shrimp and crab, common allergens." },
    { name: "Sesame", definition: "Seeds that have recently been recognized as a major allergen." },
    { name: "Mustard", definition: "Can trigger allergic reactions through seeds, powder, or prepared mustard." },
    { name: "Celery", definition: "The stalk, leaves, seeds, and root can cause allergic reactions." },
    { name: "Lupin", definition: "A flowering plant, its seeds are increasingly used in flour and can cause allergies." },
    { name: "Molluscs", definition: "Includes mussels, oysters, and squid, and can cause allergic reactions." },
    { name: "Sulfites", definition: "Often used as preservatives in food and drinks, can cause sensitivity." }
];

function displayRandomAllergy() {
    const randomIndex = Math.floor(Math.random() * allergiesData.length);
    randomAllergyName.textContent = allergiesData[randomIndex].name;
    randomAllergyDefinition.textContent = allergiesData[randomIndex].definition;
}

// Function to check ingredients against allergies and return warnings
function analyzeIngredients(productIngredients) {
    const lowerCaseIngredients = productIngredients.toLowerCase();
    const warnings = [];

    userAllergies.forEach(allergy => {
        if (lowerCaseIngredients.includes(allergy.toLowerCase())) {
            warnings.push(allergy);
        }
    });

    if (allergyImageText) {
        if (lowerCaseIngredients.includes(allergyImageText.toLowerCase())) {
            warnings.push("ingredients similar to your allergy image");
        }
    }
    return warnings;
}

function getRandomAnalysisResult(warnings) {
    const randomNumber = Math.random();

    if (warnings.length > 0) {
        // More likely to show an alert if allergens are found
        if (randomNumber < 0.8) { // 80% chance of showing an alert
            const randomWarningIndex = Math.floor(Math.random() * warnings.length);
            return `Allergen detected! You might be allergic to: ${warnings[randomWarningIndex]}.`;
        } else {
            return `No new allergens strongly detected, but be cautious of: ${warnings.join(', ')}.`;
        }
    } else {
        // Less likely to show an alert if no allergens are found
        if (randomNumber < 0.2) { // 20% chance of a "false positive" or general advice
            return "No specific allergens detected, but always check the label.";
        } else {
            return "No allergens detected. You should be safe.";
        }
    }
}

// Event listener for the "Scan Text" button
scanButton.addEventListener('click', () => {
    const productText = productInput.value;
    if (productText) {
        const warnings = analyzeIngredients(productText);
        resultsText.textContent = getRandomAnalysisResult(warnings);
        resultsText.className = warnings.length > 0 ? "warning" : "";
    } else {
        resultsText.textContent = "Please enter product information or scan an image.";
        resultsText.className = "";
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
    console.log("Analyze Image button clicked!"); // DEBUG

    // Check if there's an image on the canvas
    if (capturedImageCanvas.style.display === 'none') {
        console.log("No image to analyze."); // DEBUG
        resultsText.textContent = "Please capture or upload an image to analyze.";
        resultsText.className = "warning";
        return; // Stop execution
    }

    extractedIngredientsTextarea.value = "Analyzing...";
    try {
        console.log("Starting OCR..."); // DEBUG
        const result = await Tesseract.recognize(
            capturedImageCanvas,
            'eng',
            { logger: m => console.log('Tesseract Log:', m) }
        );
        const extractedText = result.data.text;
        console.log("OCR Result:", extractedText); // DEBUG
        extractedIngredientsTextarea.value = extractedText;
        const warnings = analyzeIngredients(extractedText);
        const analysisResult = getRandomAnalysisResult(warnings);
        resultsText.textContent = analysisResult;
        resultsText.className = warnings.length > 0 ? "warning" : "";
    } catch (error) {
        console.error("OCR Error:", error);
        extractedIngredientsTextarea.value = "Error during OCR. Please try again.";
        resultsText.textContent = "Error analyzing image.";
        resultsText.className = "warning";
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

allergyImageUpload.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        allergyPreview.src = URL.createObjectURL(file);
        allergyPreview.style.display = 'block';

        try {
            const result = await Tesseract.recognize(
                file,
                'eng',
                { logger: m => console.log(m) }
            );
            allergyImageText = result.data.text;
            alert("Allergy image analyzed. We'll check for similar ingredients.");
        } catch (error) {
            console.error("OCR Error on allergy image:", error);
            alert("Error analyzing allergy image. Please try again.");
            allergyImageText = null;
        }
    } else {
        allergyPreview.src = "#";
        allergyPreview.style.display = 'none';
        allergyImageText = null;
    }
});

displayRandomAllergy(); // Display a random allergy on page load
