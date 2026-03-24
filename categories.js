// Builds category links dynamically from the sidebar category list

function buildCategoryLinks() {
  const sidebarItems = document.querySelectorAll("#category-list li");
  const container = document.getElementById("category-links");

  // If the page doesn't have a category-links container, stop
  if (!container) return;

  container.innerHTML = "";

  sidebarItems.forEach(item => {
    const cat = item.dataset.cat;
    if (!cat) return;

    const li = document.createElement("li");
    const link = document.createElement("a");

    // Link to your category template page
    link.href = `category.html?cat=${encodeURIComponent(cat)}`;
    link.textContent = cat;

    li.appendChild(link);
    container.appendChild(li);
  });
}

// Run after DOM loads
document.addEventListener("DOMContentLoaded", buildCategoryLinks);


buildCategoryLinks();