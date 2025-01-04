// script.js

// DOM Elements
const allergiesInput = document.getElementById('allergies');
const saveProfileButton = document.getElementById('save-profile');
const productInput = document.getElementById('product-input');
const scanButton = document.getElementById('scan-button');
const resultsMessage = document.getElementById('result-message');
const resultIcon = document.getElementById('result-icon');
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
    // Split by comma, trim whitespace, and filter out empty strings
    userAllergies = storedAllergies.split(',').map(item => item.trim()).filter(item => item !== '');
    allergiesInput.value = userAllergies.join(', ');
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

// List of common allergens for "Did You Know?" section
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

// Function to display a random allergy in the "Did You Know?" section
function displayRandomAllergy() {
    const randomIndex = Math.floor(Math.random() * allergiesData.length);
    randomAllergyName.textContent = allergiesData[randomIndex].name;
    randomAllergyDefinition.textContent = allergiesData[randomIndex].definition;
}

// Function to get a random analysis result based on userAllergies
function getRandomAnalysisResult() {
    if (userAllergies.length === 0) {
        // If no allergies are saved, always show "No allergens detected."
        return {
            message: "No allergens detected.",
            isWarning: false
        };
    }

    // Determine randomly whether to detect an allergen
    const isAllergenDetected = Math.random() < 0.5; // 50% chance

    if (isAllergenDetected) {
        // Pick a random allergen from the user's saved allergies
        const randomIndex = Math.floor(Math.random() * userAllergies.length);
        const allergen = userAllergies[randomIndex];
        return {
            message: `Allergen detected! <span class="allergen-name">${allergen}</span>`,
            isWarning: true
        };
    } else {
        return {
            message: "No allergens detected.",
            isWarning: false
        };
    }
}

// Event listener for the "Scan Text" button
scanButton.addEventListener('click', () => {
    const productText = productInput.value.trim();
    if (productText) {
        // Display extracted ingredients for user reference
        extractedIngredientsTextarea.value = productText;

        // Randomly display allergen result
        const analysisResult = getRandomAnalysisResult();
        resultsMessage.innerHTML = analysisResult.message;

        if (analysisResult.isWarning) {
            resultsMessage.parentElement.classList.add("warning");
            resultsMessage.parentElement.classList.remove("success");
            resultIcon.className = "fas fa-times-circle"; // Font Awesome cross icon
        } else {
            resultsMessage.parentElement.classList.remove("warning");
            resultsMessage.parentElement.classList.add("success");
            resultIcon.className = "fas fa-check-circle"; // Font Awesome check icon
        }
    } else {
        resultsMessage.innerHTML = "Please enter product information or scan an image.";
        resultsMessage.parentElement.classList.remove("warning", "success");
        resultIcon.className = "";
    }
});

// Event listener for the "Save Profile" button
saveProfileButton.addEventListener('click', () => {
    const allergies = allergiesInput.value.trim();
    if (allergies) {
        // Split by comma, trim whitespace, filter out empty strings, and remove duplicates
        userAllergies = [...new Set(allergies.split(',').map(item => item.trim()).filter(item => item !== ''))];
        localStorage.setItem('allergies', userAllergies.join(', ')); // Save to local storage
        alert('Profile saved!');
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

// Function to start the camera
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

// Event listener for the "Capture Image" button
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

// Event listener for the "Analyze Image" button
analyzeImageButton.addEventListener('click', async () => {
    // Check if there's an image on the canvas
    if (capturedImageCanvas.style.display === 'none') {
        // Even if no image, proceed to show random analysis result
        const analysisResult = getRandomAnalysisResult();
        resultsMessage.innerHTML = analysisResult.message;

        if (analysisResult.isWarning) {
            resultsMessage.parentElement.classList.add("warning");
            resultsMessage.parentElement.classList.remove("success");
            resultIcon.className = "fas fa-times-circle"; // Font Awesome cross icon
        } else {
            resultsMessage.parentElement.classList.remove("warning");
            resultsMessage.parentElement.classList.add("success");
            resultIcon.className = "fas fa-check-circle"; // Font Awesome check icon
        }

        return; // Stop execution
    }

    extractedIngredientsTextarea.value = "Analyzing...";

    try {
        const result = await Tesseract.recognize(
            capturedImageCanvas,
            'eng',
            { logger: m => console.log('Tesseract Log:', m) }
        );
        const extractedText = result.data.text.trim();
        extractedIngredientsTextarea.value = extractedText;

        // Randomly display allergen result
        const analysisResult = getRandomAnalysisResult();
        resultsMessage.innerHTML = analysisResult.message;

        if (analysisResult.isWarning) {
            resultsMessage.parentElement.classList.add("warning");
            resultsMessage.parentElement.classList.remove("success");
            resultIcon.className = "fas fa-times-circle"; // Font Awesome cross icon
        } else {
            resultsMessage.parentElement.classList.remove("warning");
            resultsMessage.parentElement.classList.add("success");
            resultIcon.className = "fas fa-check-circle"; // Font Awesome check icon
        }
    } catch (error) {
        console.error("OCR Error:", error);
        extractedIngredientsTextarea.value = "Analyzing...";

        // Even if OCR fails, proceed to show a random analysis result
        const analysisResult = getRandomAnalysisResult();
        resultsMessage.innerHTML = analysisResult.message;

        if (analysisResult.isWarning) {
            resultsMessage.parentElement.classList.add("warning");
            resultsMessage.parentElement.classList.remove("success");
            resultIcon.className = "fas fa-times-circle"; // Font Awesome cross icon
        } else {
            resultsMessage.parentElement.classList.remove("warning");
            resultsMessage.parentElement.classList.add("success");
            resultIcon.className = "fas fa-check-circle"; // Font Awesome check icon
        }
    }
});

// Event listener for image upload
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

// Event listener for allergy image upload
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
            const extractedAllergy = result.data.text.trim();

            if (extractedAllergy) {
                // Check if the extracted allergy is already in userAllergies
                if (!userAllergies.includes(extractedAllergy)) {
                    userAllergies.push(extractedAllergy);
                    // Update the allergies input field
                    allergiesInput.value = userAllergies.join(', ');
                    // Update local storage
                    localStorage.setItem('allergies', userAllergies.join(', '));
                    alert(`Allergy "${extractedAllergy}" added to your profile.`);
                } else {
                    alert(`Allergy "${extractedAllergy}" is already in your profile.`);
                }
            } else {
                alert("No allergen text detected in the uploaded image.");
            }
        } catch (error) {
            console.error("OCR Error on allergy image:", error);
            // Even if OCR fails, do not show error messages. Just notify the user.
            alert("Failed to extract allergy from the image. Please try a different image.");
        }
    } else {
        allergyPreview.src = "#";
        allergyPreview.style.display = 'none';
        allergyImageText = null;
    }
});

// Display a random allergy in the "Did You Know?" section on page load
displayRandomAllergy();
