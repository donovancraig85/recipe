// Read ?cat= from URL
const params = new URLSearchParams(window.location.search);
const category = params.get("cat");

// Set page title
document.getElementById("category-title").textContent = category;

// Realtime listener for recipes
db.collection("recipes").onSnapshot(snapshot => {
  const recipes = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const filtered = recipes.filter(r =>
    r.category &&
    r.category.trim().toLowerCase() === category.trim().toLowerCase()
  );

  renderRecipes(filtered);
});
