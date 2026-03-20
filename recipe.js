const recipes = [
  {
    id: 1,
    name: "Chicken Alfredo",
    ingredients: ["chicken","pasta","brocolli","cream","garlic"],
    directions: [
      "Boil pasta",
      "Cook chicken",
      "Mix cream and garlic",
      "Combine everything"
    ]
  }
];

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

const recipe = recipes.find(r => r.id === id);

if (recipe) {
  document.getElementById("recipe-name").textContent = recipe.name;

  // INGREDIENTS
  const ul = document.getElementById("ingredient-list");
  recipe.ingredients.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i;
    ul.appendChild(li);
  });

  // DIRECTIONS
  const directionsList = document.getElementById("directions-list");
  recipe.directions.forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    directionsList.appendChild(li);
  });
}

// PDF BUTTON
const pdfBtn = document.getElementById("pdf-btn");

pdfBtn.addEventListener("click", () => {
  const recipeCard = document.querySelector("body"); // capture whole page

  const options = {
    margin: 10,
    filename: `${recipe.name}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(options).from(recipeCard).save();
});

// DELETE BUTTON
const deleteBtn = document.getElementById("delete-btn");

deleteBtn.addEventListener("click", () => {
  const confirmed = confirm(`Delete "${recipe.name}"?`);

  if (confirmed) {
    const index = recipes.findIndex(r => r.id === recipe.id);
    recipes.splice(index, 1);

    // redirect back to homepage
    window.location.href = "index.html";
  }
});
