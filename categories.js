document.addEventListener("DOMContentLoaded", () => {
  // Wait until Firebase is fully initialized
  const waitForFirebase = setInterval(() => {
    if (window.db) {
      clearInterval(waitForFirebase);
      startCategoryPage();
    }
  }, 50);
});

function startCategoryPage() {
  // Read ?cat= from URL
  const params = new URLSearchParams(window.location.search);
  const category = params.get("cat");

  if (!category || typeof category !== "string") {
    renderRecipes([]);
    return;
  }

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
      const cat = r.category;
      if (typeof cat !== "string") return false;

      return (
        cat.trim().toLowerCase() ===
        category.trim().toLowerCase()
      );
    });

    renderRecipes(filtered);
  });
}
