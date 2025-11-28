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
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const drug = childSnapshot.val();
                drug.id = childSnapshot.key;
                drugs.push(drug);
            });
        }
        loadTable();
    }, (error) => {
        console.error("Error loading drugs:", error);
        alert("Error loading drugs from database.");
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
        body.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: #666;">No drugs found. Click "Add Drug" to add your first drug!</td></tr>`;
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
            body.innerHTML += `<tr><td colspan="5" style="text-align: center; padding: 20px;">No drugs in this category</td></tr>`;
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

    // Show uncategorized drugs
    const uncategorizedDrugs = drugs.filter(d => {
        const isCategorized = Object.values(categoryGroups).some(categories => 
            categories.includes(d.category)
        );
        return !isCategorized && d.category;
    });

    if (uncategorizedDrugs.length > 0) {
        body.innerHTML += `<tr class="group-header"><td colspan="5">Other Drugs</td></tr>`;
        uncategorizedDrugs.forEach(drug => {
            body.innerHTML += createDrugRow(drug);
        });
    }
}

function createDrugRow(drug) {
    return `
        <tr>
            <td>
                <strong>${drug.name}</strong>
                ${drug.strength ? `<small>Strength: ${drug.strength}</small>` : ''}
            </td>
            <td>${drug.strength || 'N/A'}</td>
            <td>${drug.price ? `$${drug.price}` : 'N/A'}</td>
            <td>${drug.category || 'Uncategorized'}</td>
            <td>
                <button class="crud-action edit-btn" data-id="${drug.id}">Edit</button>
                <button class="crud-action delete-btn" data-id="${drug.id}">Delete</button>
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

    const filteredDrugs = drugs.filter(d =>
        d.name.toLowerCase().includes(term) ||
        (d.category && d.category.toLowerCase().includes(term)) ||
        (d.strength && d.strength.toLowerCase().includes(term))
    );

    if (filteredDrugs.length === 0) {
        body.innerHTML = `<tr><td colspan="5" style="text-align: center;">No drugs match your search</td></tr>`;
        return;
    }

    // Group filtered results
    const groupedResults = {};
    filteredDrugs.forEach(drug => {
        const groupName = Object.keys(categoryGroups).find(g =>
            categoryGroups[g].includes(drug.category)
        ) || 'Other Drugs';
        
        if (!groupedResults[groupName]) {
            groupedResults[groupName] = [];
        }
        groupedResults[groupName].push(drug);
    });

    for (const groupName in groupedResults) {
        body.innerHTML += `<tr class="group-header"><td colspan="5">${groupName}</td></tr>`;
        groupedResults[groupName].forEach(drug => {
            body.innerHTML += createDrugRow(drug);
        });
    }
}

// ==============================
// MODAL FUNCTIONS
// ==============================
function showModal(drug = null) {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modal-title");
    const nameInput = document.getElementById("drug-name-input");
    const strengthInput = document.getElementById("drug-strength-input");
    const priceInput = document.getElementById("drug-price-input");
    const categoryInput = document.getElementById("drug-category-input");

    if (drug) {
        // Edit mode
        modalTitle.textContent = "Edit Drug";
        nameInput.value = drug.name || '';
        strengthInput.value = drug.strength || '';
        priceInput.value = drug.price || '';
        categoryInput.value = drug.category || '';
        modal.currentDrugId = drug.id;
    } else {
        // Add mode
        modalTitle.textContent = "Add New Drug";
        nameInput.value = '';
        strengthInput.value = '';
        priceInput.value = '';
        categoryInput.value = '';
        modal.currentDrugId = null;
    }

    modal.classList.add("show");
    nameInput.focus();
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
    if(confirm("Are you sure you want to delete this drug? This action cannot be undone.")){
        deleteDrugFromFirebase(drugId)
            .then(() => {
                console.log("Drug deleted successfully");
            })
            .catch(error => {
                console.error("Error deleting drug:", error);
            });
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

    if(!name) {
        alert("Please enter a drug name");
        nameInput.focus();
        return;
    }

    if(!price) {
        alert("Please enter a price");
        priceInput.focus();
        return;
    }

    if(!category) {
        alert("Please select a category");
        categoryInput.focus();
        return;
    }

    const drugData = {
        name,
        strength: strength || '',
        price,
        category,
        timestamp: new Date().toISOString()
    };

    const modal = document.getElementById("modal");
    const promise = modal.currentDrugId 
        ? updateDrugInFirebase(modal.currentDrugId, drugData)
        : addDrugToFirebase(drugData);

    promise.then(() => {
        hideModal();
    }).catch(error => {
        console.error("Error saving drug:", error);
    });
}

// ==============================
// EVENT LISTENERS
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    const addDrugBtn = document.getElementById("add-drug");
    const closePanelBtn = document.getElementById("close-panel");
    const saveBtn = document.getElementById("save-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const searchInput = document.getElementById("drug-search");

    // Load drugs from Firebase
    loadDrugsFromFirebase();

    // Event listeners
    closePanelBtn.addEventListener("click", () => {
        window.location.href = "./index.html";
    });

    addDrugBtn.addEventListener("click", addDrug);
    saveBtn.addEventListener("click", saveDrug);
    cancelBtn.addEventListener("click", hideModal);

    // Search functionality
    searchInput.addEventListener("input", filterDrugs);

    // Event delegation for edit/delete buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const drugId = e.target.getAttribute('data-id');
            editDrug(drugId);
        }
        
        if (e.target.classList.contains('delete-btn')) {
            const drugId = e.target.getAttribute('data-id');
            deleteDrug(drugId);
        }
    });

    // Close modal when clicking outside
    document.getElementById('modal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideModal();
        }
    });

    // Enter key support in modal
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('modal');
        if (modal.classList.contains('show')) {
            if (e.key === 'Enter') {
                saveDrug();
            } else if (e.key === 'Escape') {
                hideModal();
            }
        }
    });
});
