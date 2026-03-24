document.addEventListener("DOMContentLoaded", () => {
  // Read ?cat= from URL
  const params = new URLSearchParams(window.location.search);
  const category = params.get("cat");

  // Set page title
  const titleEl = document.getElementById("category-title");
  if (titleEl) {
    titleEl.textContent = category;
  }

  // Realtime listener for recipes
  db.collection("recipes").onSnapshot(snapshot => {
    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const filtered = recipes.filter(r => {
      // Ensure category exists and is a string
      if (typeof r.category !== "string") return false;

      return (
        r.category.trim().toLowerCase() ===
        category.trim().toLowerCase()
      );
    });

    renderRecipes(filtered);
  });
});
