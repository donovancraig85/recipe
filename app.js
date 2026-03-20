const recipes = [
  {id: 1, 
  name: "Chicken Alfredo",
  ingredients: ["chicken","pasta","brocolli","cream","garlic"]},
  {id: 2,
  name: "Beef Tacos",
  ingredients: ["Ground beef", "taco shells", "taco seasoning"]},
  {id: 3,
  name: "cereal",
  ingredients: ["ceral of choice", "milk"]},
  {id: 4,
  name: "Cake",
  ingredients: ["eggs", "milk"]}
];

function renderRecipes(list) {
  const container = document.getElementById("recipe-list");
  container.innerHTML = "";
const recipes = [
  {id: 1, 
  name: "Chicken Alfredo",
  ingredients: ["chicken","pasta","brocolli","cream","garlic"]},
  {id: 2,
  name: "Beef Tacos",
  ingredients: ["Ground beef", "taco shells", "taco seasoning"]},
  {id: 3,
  name: "cereal",
  ingredients: ["ceral of choice", "milk"]},
  {id: 4,
  name: "Cake",
  ingredients: ["eggs", "milk"]}
];

function renderRecipes(list) {
  const container = document.getElementById("recipe-list");
  container.innerHTML = "";

  list.forEach(recipe => {
    const li = document.createElement("li");

   
    const link = document.createElement("a");
    link.textContent = recipe.name;
    link.href = `recipe.html?id=${recipe.id}`;

    // delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation(); // prevent link click
      deleteRecipe(recipe.id);
    });

    li.appendChild(link);
    li.appendChild(deleteBtn);
    container.appendChild(li);
  });
}

function deleteRecipe(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;

  const confirmed = confirm(`Delete "${recipe.name}"?`);

  if (confirmed) {
    const index = recipes.findIndex(r => r.id === id);
    recipes.splice(index, 1);
    renderRecipes(recipes);
  }
}

//initial load
renderRecipes(recipes);
const search = document.getElementById("search");

//search functionality
search.addEventListener("input", () => {
  const query = search.value.toLowerCase();
  const container = document.getElementById("recipe-list"); 

  const filtered = recipes.filter(recipe => {
    const nameMatch = recipe.name.toLowerCase().includes(query);
    const ingredientMatch = recipe.ingredients.some(i =>
      i.toLowerCase().includes(query)
    );
    return nameMatch || ingredientMatch;
  });

  // show list only when there are results
  container.style.display = filtered.length > 0 ? "block" : "none";

  renderRecipes(filtered);
});



const fileInput = document.getElementById("recipe-file");
const uploadbtn = document.getElementById("upload-btn");

uploadbtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file first");
    return;
  }
  
  const reader = new FileReader();
  reader.onload =() => {
    const text = reader.result;

    //Expecting Format:
    //Recipe Name
    //ingredient1, ingredient2, ingredient3
    const lines = text.split("\n").map(l => l.trim());

    const name = lines[0];
    const ingredients = lines[1]
    .split(",")
    .map(i => i.trim())
    .filter(i => i.length > 0);

    if (!name || ingredients.length === 0) {
      alert("File format incorrect. First line = name, second line = ingredients.");
      return;
    }

    const newRecipe = {
    id:recipes.length + 1,
    name,
    ingredients
    };

    recipes.push(newRecipe);
    renderRecipes(recipes);
    alert("Recipe uploaded successfully!");
  };

  reader.readAsText(file);
});


