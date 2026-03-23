// Assumes firebase app + db are already initialized in recipe.html

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let currentRecipe = null;

db.collection("recipes").doc(id).get()
  .then(doc => {
    if (!doc.exists) {
      document.getElementById("recipe-name").textContent = "Recipe not found";
      return;
    }

    const recipe = doc.data();
    currentRecipe = recipe;

    document.getElementById("recipe-name").textContent = recipe.name;

    // -----------------------------
    // NARRATIVE
    // -----------------------------
    const narrativeEl = document.getElementById("narrative");
    narrativeEl.innerHTML = (recipe.narrative || []).join("<br>");

    // -----------------------------
    // INGREDIENTS
    // -----------------------------
    const ul = document.getElementById("ingredient-list");
    ul.innerHTML = ""; // clear old content
    (recipe.ingredients || []).forEach(i => {
      const li = document.createElement("li");
      li.textContent = i;
      ul.appendChild(li);
    });

    // -----------------------------
    // DIRECTIONS
    // -----------------------------
    const directionsList = document.getElementById("directions-list");
    directionsList.innerHTML = ""; // clear old content
    (recipe.directions || []).forEach(step => {
      const li = document.createElement("li");
      li.textContent = step;
      directionsList.appendChild(li);
    });
  })
  .catch(err => {
    console.error("Error loading recipe:", err);
  });

// PDF + Delete logic stays the same


// PDF button
const pdfBtn = document.getElementById("pdf-btn");

pdfBtn.addEventListener("click", () => {
  if (!currentRecipe) return;

  const recipeCard = document.querySelector(".recipe-card") || document.body;

  const options = {
    margin: 10,
    filename: `${currentRecipe.name}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(options).from(recipeCard).save();
});

// Delete button
const deleteBtn = document.getElementById("delete-btn");

deleteBtn.addEventListener("click", () => {
  if (!currentRecipe) return;

  const confirmed = confirm(`Delete "${currentRecipe.name}"?`);

  if (!confirmed) return;

  db.collection("recipes").doc(id).delete()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(err => {
      console.error("Error deleting recipe:", err);
      alert("Error deleting recipe. Check console for details.");
    });
});
