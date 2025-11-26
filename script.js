// ==============================
// Drug Data Store
// ==============================
let drugs = [
    { category: "Antibiotic Oral", name: "Ciprofloxacin", strength: "500mg", price: "9000" },
    { category: "Antibiotic Syrup", name: "Amoxicillin", strength: "125mg/5ml", price: "9000" },
    { category: "Antibiotic Injectable", name: "Ceftriaxone", strength: "1g vial", price: "9000" },
    { category: "NSAIDS", name: "Diclofenac", strength: "50mg", price: "9000" },
    { category: "Antihypertensive", name: "Hctz", strength: "25mg", price: "9000" },
    { category: "Antidiabetic", name: "Metformin", strength: "500mg", price: "9000" },
    { category: "Topical", name: "Hydrocortisone", strength: "1% cream", price: "9000" },
    { category: "Eye drops", name: "NeoDexa", strength: "5ml", price: "9000" },
    { category: "Emergency Drugs", name: "Diazepam", strength: "10mg/2ml", price: "9000" },
    { category: "Others", name: "Ringer's Lactate", strength: "500ml", price: "9000" }
];

// ==============================
// Main Sub-Headings
// ==============================
const categoryGroups = {
    "Tablets / Capsules": ["Antibiotic Oral", "NSAIDS", "Antihypertensive", "Antidiabetic", "Emergency Drugs"],
    "Syrups": ["Antibiotic Syrup"],
    "Injectables": ["Antibiotic Injectable"],
    "Topical": ["Topical"],
    "Suppositories": [],
    "Eye / Ear Drops": ["Eye drops"],
    "Procedures": []
};


// ==============================
// TABLE RENDERING FUNCTIONS
// ==============================

// Full table & category view (with headings)
function loadTable(filterCategory = null) {
    const body = document.getElementById("panel-body");
    body.innerHTML = "";

    // -----------------------------
    // 1️⃣ Specific category clicked
    // -----------------------------
    if (filterCategory) {

        const groupName = Object.keys(categoryGroups).find(g =>
            categoryGroups[g].includes(filterCategory)
        );

        if (groupName) {
            body.innerHTML += `
                <tr style="background:#e9eef5;font-weight:bold;color:#1c3347;">
                    <td colspan="4" style="padding:10px;">${groupName}</td>
                </tr>
            `;
        }

        drugs
            .filter(d => d.category === filterCategory)
            .forEach((d, i) => {
                body.innerHTML += `
                    <tr>
                        <td>
                            <div>${d.name}</div>
                            <small style="color:#555;">${d.strength}</small>
                        </td>
                        <td>Qty</td>
                        <td>${d.price}</td>
                        <td>
                            <button class="crud-action edit-btn" onclick="editDrug(${i})">Edit</button>
                            <button class="crud-action delete-btn" onclick="deleteDrug(${i})">Delete</button>
                        </td>
                    </tr>
                `;
            });

        return;
    }

    // -----------------------------
    // 2️⃣ Full grouped view
    // -----------------------------
    for (const groupName in categoryGroups) {
        const mappedCategories = categoryGroups[groupName];

        body.innerHTML += `
            <tr style="background:#e9eef5;font-weight:bold;color:#1c3347;">
                <td colspan="4" style="padding:10px;">${groupName}</td>
            </tr>
        `;

        drugs.forEach((d, i) => {
            if (mappedCategories.includes(d.category)) {
                body.innerHTML += `
                    <tr>
                        <td>
                            <div>${d.name}</div>
                            <small style="color:#555;">${d.strength}</small>
                        </td>
                        <td>Qty</td>
                        <td>${d.price}</td>
                        <td>
                            <button class="crud-action edit-btn" onclick="editDrug(${i})">Edit</button>
                            <button class="crud-action delete-btn" onclick="deleteDrug(${i})">Delete</button>
                        </td>
                    </tr>
                `;
            }
        });
    }
}



// ==============================
// SEARCH FUNCTION
// ==============================
function filterDrugs() {
    const term = document.getElementById("drug-search").value.toLowerCase();
    const body = document.getElementById("panel-body");
    body.innerHTML = "";

    for (const groupName in categoryGroups) {
        const mappedCategories = categoryGroups[groupName];

        const groupFiltered = drugs.filter(d =>
            mappedCategories.includes(d.category) &&
            (
                d.name.toLowerCase().includes(term) ||
                d.category.toLowerCase().includes(term) ||
                (d.strength && d.strength.toLowerCase().includes(term))
            )
        );

        if (groupFiltered.length === 0) continue;

        body.innerHTML += `
            <tr style="background:#e9eef5;font-weight:bold;color:#1c3347;">
                <td colspan="4" style="padding:10px;">${groupName}</td>
            </tr>
        `;

        groupFiltered.forEach((d, i) => {
            body.innerHTML += `
                <tr>
                    <td>
                        <div>${d.name}</div>
                        <small style="color:#555;">${d.strength}</small>
                    </td>
                    <td>Qty</td>
                    <td>${d.price}</td>
                    <td>
                        <button class="crud-action edit-btn" onclick="editDrug(${i})">Edit</button>
                        <button class="crud-action delete-btn" onclick="deleteDrug(${i})">Delete</button>
                    </td>
                </tr>
            `;
        });
    }
}



// ==============================
// CRUD FUNCTIONS
// ==============================
function addDrug() {
    const name = prompt("Drug name:");
    const strength = prompt("Strength:");
    const price = prompt("Price:");
    const category = prompt("Category:");

    if (name && price && category) {
        drugs.push({ category, name, strength, price });
        loadTable();
    }
}

function editDrug(i) {
    const newName = prompt("New name:", drugs[i].name);
    const newStrength = prompt("New strength:", drugs[i].strength);
    const newPrice = prompt("New price:", drugs[i].price);

    if (newName && newPrice) {
        drugs[i].name = newName;
        drugs[i].strength = newStrength;
        drugs[i].price = newPrice;
        loadTable();
    }
}

function deleteDrug(i) {
    if (confirm("Delete this drug?")) {
        drugs.splice(i, 1);
        loadTable();
    }
}



// ==============================
// EVENT LISTENERS
// ==============================
document.addEventListener("DOMContentLoaded", () => {

    const mainContent = document.querySelector(".main-content");
    const drugPanel = document.getElementById("drug-panel");
    const panelTitle = document.getElementById("panel-title");
    const addDrugBtn = document.getElementById("add-drug");
    const closePanelBtn = document.getElementById("close-panel");

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            const category = card.querySelector(".header-text")?.textContent;
            panelTitle.textContent = category;
            loadTable(category);
            drugPanel.classList.add("show");
            mainContent.style.display = "none";
        });
    });

    document.querySelector("nav ul li:first-child").addEventListener("click", () => {
        panelTitle.textContent = "All Drugs";
        loadTable();
        drugPanel.classList.add("show");
        mainContent.style.display = "none";
    });

    closePanelBtn.addEventListener("click", () => {
        drugPanel.classList.remove("show");
        mainContent.style.display = "flex";
    });

    addDrugBtn.addEventListener("click", addDrug);
});
