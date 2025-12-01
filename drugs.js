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
// FIREBASE OPERATIONS (ORIGINAL)
// ==============================
function loadDrugsFromFirebase() {
    if (!navigator.onLine) {
        // If offline, load from localStorage
        loadDrugsFromLocalStorage();
        return;
    }

    onValue(drugsRef, (snapshot) => {
        drugs = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const drug = childSnapshot.val();
                drug.id = childSnapshot.key;
                drugs.push(drug);
            });
        }
        // Cache the drugs to localStorage
        cacheDrugsToLocalStorage();
        loadTable();
    }, (error) => {
        console.error("Error loading drugs:", error);
        // If Firebase fails, try loading from localStorage
        loadDrugsFromLocalStorage();
    });
}

// Original Firebase functions
const originalAddDrug = function(drugData) {
    return push(drugsRef, drugData)
        .then(() => {
            console.log("Drug added successfully");
        })
        .catch((error) => {
            console.error("Error adding drug:", error);
            alert("Error adding drug. Please try again.");
            throw error; // Re-throw to maintain promise chain
        });
};

const originalUpdateDrug = function(drugId, updatedData) {
    const drugRef = ref(window.db, `drugs/${drugId}`);
    return update(drugRef, updatedData)
        .then(() => {
            console.log("Drug updated successfully");
        })
        .catch((error) => {
            console.error("Error updating drug:", error);
            alert("Error updating drug. Please try again.");
            throw error;
        });
};

const originalDeleteDrug = function(drugId) {
    const drugRef = ref(window.db, `drugs/${drugId}`);
    return remove(drugRef)
        .then(() => {
            console.log("Drug deleted successfully");
        })
        .catch((error) => {
            console.error("Error deleting drug:", error);
            alert("Error deleting drug. Please try again.");
            throw error;
        });
};

// ==============================
// OFFLINE SUPPORT FUNCTIONS
// ==============================
let pendingOperations = JSON.parse(localStorage.getItem('pendingDrugOperations') || '[]');

// Load drugs from localStorage when offline
function loadDrugsFromLocalStorage() {
    const savedDrugs = localStorage.getItem('cachedDrugs');
    if (savedDrugs) {
        drugs = JSON.parse(savedDrugs);
        loadTable();
        console.log('Loaded drugs from local storage:', drugs.length);
        showDrugsStatus(`Loaded ${drugs.length} drugs from cache`, 'info');
    } else {
        showDrugsStatus('No cached drugs found. Go online to load data first.', 'warning');
    }
}

// Save drugs to localStorage whenever we get data from Firebase
function cacheDrugsToLocalStorage() {
    localStorage.setItem('cachedDrugs', JSON.stringify(drugs));
    console.log('Drugs cached to local storage');
}

// Generate a unique offline ID
function generateOfflineId() {
    return 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ==============================
// OFFLINE-ENABLED CRUD OPERATIONS
// ==============================
// These functions will be used throughout the app
function addDrugToFirebase(drugData) {
    if (!navigator.onLine) {
        // Store operation for later sync
        const operation = {
            type: 'add',
            data: drugData,
            timestamp: new Date().toISOString(),
            offlineId: generateOfflineId()
        };
        
        pendingOperations.push(operation);
        localStorage.setItem('pendingDrugOperations', JSON.stringify(pendingOperations));
        
        // Add to local drugs array for immediate UI update
        const tempId = operation.offlineId;
        drugs.push({ ...drugData, id: tempId, offlineId: tempId });
        
        // Update localStorage with the new drug
        cacheDrugsToLocalStorage();
        loadTable();
        
        console.log('Drug added offline - will sync when online');
        showDrugsStatus('Drug added offline - will sync when online', 'info');
        
        // Return a resolved promise
        return Promise.resolve();
    }

    // Online: use original Firebase function
    return originalAddDrug(drugData);
}

function updateDrugInFirebase(drugId, updatedData) {
    if (!navigator.onLine) {
        // Check if this is an offline-created drug
        const isOfflineDrug = drugId.startsWith('offline_');
        
        const operation = {
            type: 'update',
            drugId: drugId,
            data: updatedData,
            timestamp: new Date().toISOString(),
            isOfflineDrug: isOfflineDrug
        };
        
        pendingOperations.push(operation);
        localStorage.setItem('pendingDrugOperations', JSON.stringify(pendingOperations));
        
        // Update local drugs array
        const drugIndex = drugs.findIndex(d => d.id === drugId);
        if (drugIndex !== -1) {
            drugs[drugIndex] = { ...drugs[drugIndex], ...updatedData };
            // Update localStorage
            cacheDrugsToLocalStorage();
            loadTable();
        }
        
        console.log('Drug updated offline - will sync when online');
        showDrugsStatus('Drug updated offline - will sync when online', 'info');
        
        // Return a resolved promise
        return Promise.resolve();
    }

    // Online: use original Firebase function
    return originalUpdateDrug(drugId, updatedData);
}

function deleteDrugFromFirebase(drugId) {
    if (!navigator.onLine) {
        // Check if this is an offline-created drug
        const isOfflineDrug = drugId.startsWith('offline_');
        
        const operation = {
            type: 'delete',
            drugId: drugId,
            timestamp: new Date().toISOString(),
            isOfflineDrug: isOfflineDrug
        };
        
        pendingOperations.push(operation);
        localStorage.setItem('pendingDrugOperations', JSON.stringify(pendingOperations));
        
        // Remove from local drugs array
        const drugIndex = drugs.findIndex(d => d.id === drugId);
        if (drugIndex !== -1) {
            drugs.splice(drugIndex, 1);
            // Update localStorage
            cacheDrugsToLocalStorage();
            loadTable();
        }
        
        console.log('Drug deleted offline - will sync when online');
        showDrugsStatus('Drug deleted offline - will sync when online', 'info');
        
        // Return a resolved promise
        return Promise.resolve();
    }

    // Online: use original Firebase function
    return originalDeleteDrug(drugId);
}

// ==============================
// SYNC PENDING OPERATIONS
// ==============================
function syncPendingOperations() {
    if (pendingOperations.length === 0 || !navigator.onLine) {
        return Promise.resolve();
    }

    showDrugsStatus('Syncing offline changes...', 'info');
    
    // Process operations one by one
    const processNextOperation = () => {
        if (pendingOperations.length === 0 || !navigator.onLine) {
            showDrugsStatus('All changes synced!', 'success');
            // Reload fresh data from Firebase
            loadDrugsFromFirebase();
            return Promise.resolve();
        }
        
        const operation = pendingOperations[0];
        let promise;
        
        if (operation.type === 'add') {
            promise = originalAddDrug(operation.data);
        } else if (operation.type === 'update') {
            // For offline-created drugs, we need to add them first, then update
            if (operation.isOfflineDrug) {
                showDrugsStatus('Cannot update offline-created drug. Please delete and recreate.', 'warning');
                // Remove this operation from queue
                pendingOperations.shift();
                localStorage.setItem('pendingDrugOperations', JSON.stringify(pendingOperations));
                return processNextOperation();
            }
            promise = originalUpdateDrug(operation.drugId, operation.data);
        } else if (operation.type === 'delete') {
            // For offline-created drugs, no need to delete from Firebase
            if (operation.isOfflineDrug) {
                pendingOperations.shift();
                localStorage.setItem('pendingDrugOperations', JSON.stringify(pendingOperations));
                return processNextOperation();
            }
            promise = originalDeleteDrug(operation.drugId);
        }
        
        return promise
            .then(() => {
                // Remove successful operation from queue
                pendingOperations.shift();
                localStorage.setItem('pendingDrugOperations', JSON.stringify(pendingOperations));
                
                // Process next operation
                return processNextOperation();
            })
            .catch(error => {
                console.error('Failed to sync operation:', error);
                showDrugsStatus('Sync failed - will retry later', 'warning');
                // Keep the operation in queue for retry
                return Promise.reject(error);
            });
    };
    
    return processNextOperation();
}

// ==============================
// NETWORK STATUS HANDLING
// ==============================
function updateNetworkStatus() {
    if (navigator.onLine) {
        console.log('App is online');
        // Try to sync pending operations when coming online
        setTimeout(() => {
            syncPendingOperations().catch(() => {
                console.log('Sync will be retried later');
            });
        }, 1000);
    } else {
        console.log('App is offline');
        showDrugsStatus('You are offline - changes will sync when online', 'warning');
    }
}

// Listen for network status changes
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

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
    const isOffline = drug.id && drug.id.startsWith('offline_');
    const offlineBadge = isOffline ? '<span style="color: #ff9800; font-size: 0.8em;">(Offline)</span>' : '';
    
    return `
        <tr>
            <td>
                <strong>${drug.name}</strong> ${offlineBadge}
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
    
    // Clear the form
    document.getElementById("drug-name-input").value = '';
    document.getElementById("drug-strength-input").value = '';
    document.getElementById("drug-price-input").value = '';
    document.getElementById("drug-category-input").value = '';
    modal.currentDrugId = null;
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
        ? updateDrugInFirebase(modal.currentDrugId, drugData)  // Using offline-enabled function
        : addDrugToFirebase(drugData);  // Using offline-enabled function

    promise.then(() => {
        hideModal();
    }).catch(error => {
        console.error("Error saving drug:", error);
        hideModal();
    });
}

// ==============================
// STATUS MESSAGE HELPER
// ==============================
function showDrugsStatus(message, type) {
    // Remove any existing status messages
    const existingStatus = document.querySelector('.drug-status-message');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    const statusDiv = document.createElement('div');
    statusDiv.className = 'drug-status-message';
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(statusDiv);
    
    setTimeout(() => {
        if (statusDiv.parentNode) {
            statusDiv.remove();
        }
    }, 3000);
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

    // Initial network status check
    updateNetworkStatus();
    
    // Load drugs from Firebase or cache
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
    
    // Display pending operations count
    if (pendingOperations.length > 0 && !navigator.onLine) {
        showDrugsStatus(`You have ${pendingOperations.length} pending changes to sync`, 'info');
    }
});
