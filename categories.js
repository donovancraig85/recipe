// -----------------------------
// CATEGORY PAGE LOADER
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Wait until Firebase initializes
  const waitForFirebase = setInterval(() => {
    if (window.db) {
      clearInterval(waitForFirebase);
      startCategoryPage();
    }
  }, 50);
});

function startCategoryPage() {
  // Read ?cat= from URL and normalize it
  const params = new URLSearchParams(window.location.search);
  const rawCategory = params.get("cat");

  if (!rawCategory || typeof rawCategory !== "string") {
    renderRecipes([]);
    return;
  }

  const category = rawCategory.trim().toLowerCase();

  // Set page title
  const titleEl = document.getElementById("category-title");
  if (titleEl) {
    titleEl.textContent = capitalizeWords(rawCategory.trim());
  }

  // Listen for recipe updates
  db.collection("recipes").onSnapshot(snapshot => {
    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter recipes by normalized category
    const filtered = recipes.filter(r => {
      if (!r.category || typeof r.category !== "string") return false;

      const recipeCat = r.category.trim().toLowerCase();

      // Forgiving match: "dinner", "Dinner ", "Dinner Recipes", etc.
      return recipeCat.includes(category);
    });

    renderRecipes(filtered);
  });
}

// -----------------------------
// HELPERS
// -----------------------------
function capitalizeWords(str) {
  return str
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
