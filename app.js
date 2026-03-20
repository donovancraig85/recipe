// Assumes firebase app + db are already initialized in index.html
// Example in HTML:
// const app = firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

let recipes = [];

// Load all recipes from Firestore
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

const search = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");

// Search (live)
search.addEventListener("input", () => {
  const query = search.value.toLowerCase();
  const container = document.getElementById("recipe-list");

  const filtered = recipes.filter(recipe => {
    const nameMatch = recipe.name.toLowerCase().includes(query);
    const ingredientMatch = (recipe.ingredients || []).some(i =>
      i.toLowerCase().includes(query)
    );
    return nameMatch || ingredientMatch;
  });

  container.style.display = filtered.length > 0 ? "block" : "none";
  renderRecipes(filtered);
});

// Search (button)
searchBtn.addEventListener("click", () => {
  const query = search.value.toLowerCase();
  const container = document.getElementById("recipe-list");

  const filtered = recipes.filter(recipe => {
    const nameMatch = recipe.name.toLowerCase().includes(query);
    const ingredientMatch = (recipe.ingredients || []).some(i =>
      i.toLowerCase().includes(query)
    );
    return nameMatch || ingredientMatch;
  });

  container.style.display = "block";
  renderRecipes(filtered);
});

// Upload
const fileInput = document.getElementById("recipe-file");
const uploadbtn = document.getElementById("upload-btn");

uploadbtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file first");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result;

    // Expecting format:
    // Line 1: Recipe Name
    // Line 2: ingredient1, ingredient2, ingredient3
    // Line 3+: optional directions, one step per line
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

    const name = lines[0];
    const ingredients = (lines[1] || "")
      .split(",")
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const directions = lines.slice(2); // remaining lines as steps

    if (!name || ingredients.length === 0) {
      alert("File format incorrect. First line = name, second line = ingredients.");
      return;
    }

    const newRecipe = {
      name,
      ingredients,
      directions
    };

    db.collection("recipes").add(newRecipe)
      .then(() => {
        alert("Recipe uploaded successfully!");
        loadRecipes();
      })
      .catch(err => {
        console.error("Error uploading recipe:", err);
        alert("Error uploading recipe. Check console for details.");
      });
  };

  reader.readAsText(file);
});
