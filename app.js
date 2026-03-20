// -----------------------------
// GLOBALS
// -----------------------------
let recipes = [];

// -----------------------------
// LOAD RECIPES FROM FIRESTORE
// -----------------------------
function loadRecipes() {
  db.collection("recipes").get().then(snapshot => {
    recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    renderRecipes(recipes);
  }).catch(err => {
    console.error("Error loading recipes:", err);
  });
}

function renderRecipes(list) {
  const container = document.getElementById("recipe-list");
  container.innerHTML = "";

  list.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const link = document.createElement("a");
    link.textContent = recipe.name;
    link.href = `recipe.html?id=${recipe.id}`;

    card.appendChild(link);
    container.appendChild(card);
  });
}

// Initial load
loadRecipes();

// -----------------------------
// SEARCH
// -----------------------------
const search = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");

search.addEventListener("input", () => {
  const query = search.value.toLowerCase();
  const filtered = recipes.filter(recipe => {
    const nameMatch = recipe.name.toLowerCase().includes(query);
    const ingredientMatch = (recipe.ingredients || []).some(i =>
      i.toLowerCase().includes(query)
    );
    return nameMatch || ingredientMatch;
  });

  renderRecipes(filtered);
});

searchBtn.addEventListener("click", () => {
  const query = search.value.toLowerCase();
  const filtered = recipes.filter(recipe => {
    const nameMatch = recipe.name.toLowerCase().includes(query);
    const ingredientMatch = (recipe.ingredients || []).some(i =>
      i.toLowerCase().includes(query)
    );
    return nameMatch || ingredientMatch;
  });

  renderRecipes(filtered);
});

// -----------------------------
// UPLOAD (TEXT + PDF)
// -----------------------------
const fileInput = document.getElementById("recipe-file");
const uploadbtn = document.getElementById("upload-btn");
const uploadName = document.getElementById("upload-name");

uploadbtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  const name = uploadName.value.trim();

  if (!name) {
    alert("Please enter a recipe name.");
    return;
  }

  if (!file) {
    alert("Please select a file first.");
    return;
  }

  const extension = file.name.split(".").pop().toLowerCase();

  if (extension === "pdf") {
    readPDF(file, name);
  } else {
    readTextFile(file, name);
  }
});

// -----------------------------
// READ TEXT FILES
// -----------------------------
function readTextFile(file, name) {
  const reader = new FileReader();

  reader.onload = () => {
    processRecipeText(reader.result, name);
  };

  reader.readAsText(file);
}

// -----------------------------
// READ PDF FILES
// -----------------------------
function readPDF(file, name) {
  const reader = new FileReader();

  reader.onload = async () => {
    const typedArray = new Uint8Array(reader.result);
    const pdf = await pdfjsLib.getDocument(typedArray).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(" ") + "\n";
    }

    processRecipeText(fullText, name);
  };

  reader.readAsArrayBuffer(file);
}

// -----------------------------
// PROCESS RECIPE TEXT (NO VALIDATION)
// -----------------------------
function processRecipeText(text, name) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  // Extract ingredients (first comma-separated line)
  const ingredientsLine = lines.find(l => l.includes(","));
  const ingredients = ingredientsLine
    ? ingredientsLine.split(",").map(i => i.trim())
    : [];

  // Everything else becomes directions
  const directions = lines.filter(l => l !== ingredientsLine);

  const newRecipe = {
    name,
    ingredients,
    directions
  };

  db.collection("recipes").add(newRecipe)
    .then(() => {
      alert("Recipe uploaded successfully!");
      uploadName.value = "";
      fileInput.value = "";
      loadRecipes();
    })
    .catch(err => {
      console.error("Error uploading recipe:", err);
      alert("Error uploading recipe. Check console for details.");
    });
}
