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
// FUZZY MATCHING HELPERS
// -----------------------------
function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[b.length][a.length];
}

function fuzzyMatch(text, query) {
  text = text.toLowerCase();
  query = query.toLowerCase();

  // Exact or partial match
  if (text.includes(query)) return true;

  // Fuzzy: allow small typos
  const maxDistance = 2;
  return levenshteinDistance(text, query) <= maxDistance;
}

// -----------------------------
// SEARCH (FUZZY NAME MATCHING)
// -----------------------------
const search = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");

function runSearch() {
  const query = search.value.toLowerCase();

  const filtered = recipes.filter(recipe => {
    const name = typeof recipe.name === "string" ? recipe.name : "";
    return fuzzyMatch(name, query);
  });

  renderRecipes(filtered);
}

search.addEventListener("input", runSearch);
searchBtn.addEventListener("click", runSearch);

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
    try {
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
    } catch (err) {
      console.error("PDF READ ERROR:", err);
      alert("Could not read PDF. Please try a different file.");
    }
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
