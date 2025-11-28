// ==============================
// FIREBASE IMPORTS
// ==============================
import {
  ref,
  push,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// ==============================
// DRUG DATA STORE & CATEGORY GROUPS
// ==============================
let drugs = [];
const drugsRef = ref(window.db, "drugs");

const categoryGroups = {
    "Tablets / Capsules": ["Antibiotic Oral", "NSAIDS", "Antihypertensive", "Analgesic", "Vitamins"],
    "Syrups": ["Antibiotic Syrup", "Cough Syrup", "Antihistamine Syrup"],
    "Injectables": ["Antibiotic Injectable", "Vitamin Injection", "Vaccine"],
    "Topicals": ["Cream", "Ointment", "Lotion"],
    "Eye/Ear Drops": ["Antibiotic Drops", "Steroid Drops"],
    "Suppositories": ["Analgesic Suppository", "Antibiotic Suppository"]
};

// ==============================
// FIREBASE OPERATIONS
// ==============================
function loadDrugsFromFirebase() {
    onValue(drugsRef, (snapshot) => {
        drugs = [];
        snapshot.forEach((childSnapshot) => {
            const drug = childSnapshot.val();
            drug.id = childSnapshot.key; // Add Firebase ID
            drugs.push(drug);
        });
        loadTable();
    }, (error) => {
        console.error("Error loading drugs:", error);
    });
}

function addDrugToFirebase(drugData) {
    return push(drugsRef, drugData)
        .then(() => {
            console.log("Drug added successfully");
        })
        .catch((error) => {
            console.error("Error adding drug:", error);
            alert("Error adding drug. Please try again.");
        });
}

function updateDrugInFirebase(drugId, updatedData) {
    const drugRef = ref(window.db, `drugs/${drugId}`);
    return update(drugRef, updatedData)
        .then(() => {
            console.log("Drug updated successfully");
        })
        .catch((error) => {
            console.error("Error updating drug:", error);
            alert("Error updating drug. Please try again.");
        });
}

function deleteDrugFromFirebase(drugId) {
    const drugRef = ref(window.db, `drugs/${drugId}`);
    return remove(drugRef)
        .then(() => {
            console.log("Drug deleted successfully");
        })
        .catch((error) => {
            console.error("Error deleting drug:", error);
            alert("Error deleting drug. Please try again.");
        });
}

// ==============================
// RENDER TABLE
// ==============================
function loadTable(filterCategory = null) {
    const body = document.getElementById("panel-body");
    body.innerHTML = "";

    if (drugs.length === 0) {
        body.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">No drugs found. Add your first drug!</td></tr>`;
        return;
    }

    if(filterCategory) {
        const groupName = Object.keys(categoryGroups).find(g =>
            categoryGroups[g].includes(filterCategory)
        );
        if(groupName) {
            body.innerHTML += `<tr class="group-header"><td colspan="5">${groupName}</td></tr>`;
        }

        const filteredDrugs = drugs.filter(d => d.category === filterCategory);
        if (filteredDrugs.length === 0) {
            body.innerHTML += `<tr><td colspan="5" style="text-align: center;">No drugs in this category</td></tr>`;
        } else {
            filteredDrugs.forEach(drug => {
                body.innerHTML += createDrugRow(drug);
            });
        }
        return;
    }

    // Render all drugs grouped by category
    for(const groupName in categoryGroups){
        const mappedCategories = categoryGroups[groupName];
        const groupDrugs = drugs.filter(d => mappedCategories.includes(d.category));
        
        if(groupDrugs.length > 0) {
            body.innerHTML += `<tr class="group-header"><td colspan="5">${groupName}</td></tr>`;
            groupDrugs.forEach(drug => {
                body.innerHTML += createDrugRow(drug);
            });
        }
    }
}

function createDrugRow(drug) {
    return `
        <tr>
            <td>
                ${drug.name}
                <small>ID: ${drug.id}</small>
            </td>
            <td>${drug.strength || 'N/A'}</td>
            <td>${drug.price || 'N/A'}</td>
            <td>${drug.category || 'Uncategorized'}</td>
            <td>
                <button class="crud-action edit-btn" onclick="editDrug('${drug.id}')">Edit</button>
                <button class="crud-action delete-btn" onclick="deleteDrug('${drug.id}')">Delete</button>
            </td>
        </tr>`;
}

// ==============================
// SEARCH FUNCTION
// ==============================
function filterDrugs() {
    const term = document.getElementById("drug-search").value.toLowerCase();
    const body = document.getElementById("panel-body");
    body.innerHTML = "";

    if (drugs.length === 0) {
        body.innerHTML = `<tr><td colspan="5" style="text-align: center;">No drugs found</td></tr>`;
        return;
    }

    for(const groupName in categoryGroups){
        const mappedCategories = categoryGroups[groupName];
        const filtered = drugs.filter(d =>
            mappedCategories.includes(d.category) &&
            (d.name.toLowerCase().includes(term) ||
             d.category.toLowerCase().includes(term) ||
             (d.strength && d.strength.toLowerCase().includes(term)))
        );
        if(filtered.length === 0) continue;
        body.innerHTML += `<tr class="group-header"><td colspan="5">${groupName}</td></tr>`;
        filtered.forEach(drug => {
            body.innerHTML += createDrugRow(drug);
        });
    }
}

// ==============================
// MODAL FUNCTIONS
// ==============================
function showModal(drug = null) {
    const modal = document.getElementById("modal");
    const nameInput = document.getElementById("drug-name-input");
    const strengthInput = document.getElementById("drug-strength-input");
    const priceInput = document.getElementById("drug-price-input");
    const categoryInput = document.getElementById("drug-category-input");

    if (drug) {
        // Edit mode
        nameInput.value = drug.name || '';
        strengthInput.value = drug.strength || '';
        priceInput.value = drug.price || '';
        categoryInput.value = drug.category || '';
        modal.currentDrugId = drug.id;
    } else {
        // Add mode
        nameInput.value = '';
        strengthInput.value = '';
        priceInput.value = '';
        categoryInput.value = '';
        modal.currentDrugId = null;
    }

    modal.classList.add("show");
}

function hideModal() {
    const modal = document.getElementById("modal");
    modal.classList.remove("show");
}

// ==============================
// CRUD FUNCTIONS
// ==============================
function addDrug(){
    showModal();
}

function editDrug(drugId){
    const drug = drugs.find(d => d.id === drugId);
    if (drug) {
        showModal(drug);
    }
}

function deleteDrug(drugId){
    if(confirm("Are you sure you want to delete this drug?")){
        deleteDrugFromFirebase(drugId);
    }
}

function saveDrug() {
    const nameInput = document.getElementById("drug-name-input");
    const strengthInput = document.getElementById("drug-strength-input");
    const priceInput = document.getElementById("drug-price-input");
    const categoryInput = document.getElementById("drug-category-input");

    const name = nameInput.value.trim();
    const strength = strengthInput.value.trim();
    const price = priceInput.value.trim();
    const category = categoryInput.value.trim();

    if(!name || !price || !category) {
        alert("Please fill in all required fields: Name, Price, and Category");
        return;
    }

    const drugData = {
        name,
        strength,
        price,
        category,
        timestamp: new Date().toISOString()
    };

    const modal = document.getElementById("modal");
    if (modal.currentDrugId) {
        // Update existing drug
        updateDrugInFirebase(modal.currentDrugId, drugData)
            .then(hideModal);
    } else {
        // Add new drug
        addDrugToFirebase(drugData)
            .then(hideModal);
    }
}

// ==============================
// EVENT LISTENERS
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    const drugPanel = document.getElementById("drug-panel");
    const addDrugBtn = document.getElementById("add-drug");
    const closePanelBtn = document.getElementById("close-panel");
    const saveBtn = document.getElementById("save-btn");
    const cancelBtn = document.getElementById("cancel-btn");

    // Load drugs from Firebase
    loadDrugsFromFirebase();

    // Event listeners
    closePanelBtn.addEventListener("click", () => {
        window.location.href = "../dashboard.html";
    });

    addDrugBtn.addEventListener("click", addDrug);
    saveBtn.addEventListener("click", saveDrug);
    cancelBtn.addEventListener("click", hideModal);

    // SEARCH INPUT
    const searchInput = document.createElement("input");
    searchInput.id = "drug-search";
    searchInput.placeholder = "Search drugs by name, category, or strength...";
    searchInput.style.cssText = `
        width: 100%;
        max-width: 400px;
        margin: 0 auto 15px auto;
        display: block;
        padding: 10px;
        font-size: 1rem;
        border-radius: 8px;
        border: 1px solid #aaa;
    `;
    drugPanel.insertBefore(searchInput, drugPanel.querySelector("table"));
    searchInput.addEventListener("input", filterDrugs);
});
