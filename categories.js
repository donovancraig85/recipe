// Read ?cat= from URL
const params = new URLSearchParams(window.location.search);
const category = params.get("cat");

// Set page title
document.getElementById("category-title").textContent = category;

// Load recipes from Firestore
db.collection("recipes").get().then(snapshot => {
  const recipes = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const filtered = recipes.filter(r =>
    r.category &&
    r.category.toLowerCase() === category.toLowerCase()
  );

  renderRecipes(filtered);
});
