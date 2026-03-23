function autoFormatRecipe(raw, name) {
  raw = cleanText(raw);

  // Split into lines
  let lines = raw
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // Section buckets
  let narrative = [];
  let ingredients = [];
  let directions = [];
  let notes = [];
  let tips = [];
  let serving = [];
  let misc = [];

  // Track current section
  let current = "narrative";

  // Keyword maps
  const sectionMap = {
    "ingredients": "ingredients",
    "ingredient": "ingredients",
    "directions": "directions",
    "instructions": "directions",
    "method": "directions",
    "steps": "directions",
    "notes": "notes",
    "note": "notes",
    "tips": "tips",
    "tip": "tips",
    "serving": "serving",
    "serve": "serving",
    "servings": "serving"
  };

  // Detect section headers
  function detectSection(line) {
    const lower = line.toLowerCase();
    for (let key in sectionMap) {
      if (lower.startsWith(key)) {
        return sectionMap[key];
      }
    }
    return null;
  }

  // Ingredient heuristics
  const ingredientKeywords = [
    "cup", "tsp", "tbsp", "teaspoon", "tablespoon",
    "oz", "ounce", "lb", "pound", "clove", "slice",
    "gram", "kg", "ml", "liter", "pinch", "g)"
  ];

  function looksLikeIngredient(line) {
    const lower = line.toLowerCase();
    return (
      ingredientKeywords.some(k => lower.includes(k)) ||
      /^[0-9]/.test(line) ||
      line.includes(",")
    );
  }

  // Parse line-by-line
  for (let line of lines) {
    const detected = detectSection(line);

    if (detected) {
      current = detected;
      continue;
    }

    // Auto-detect ingredients if no header
    if (current === "narrative" && looksLikeIngredient(line)) {
      current = "ingredients";
    }

    // Push into correct bucket
    switch (current) {
      case "narrative": narrative.push(line); break;
      case "ingredients": ingredients.push(line); break;
      case "directions": directions.push(line); break;
      case "notes": notes.push(line); break;
      case "tips": tips.push(line); break;
      case "serving": serving.push(line); break;
      default: misc.push(line); break;
    }
  }

  return {
    title: name,
    narrative,
    ingredients,
    directions,
    notes,
    tips,
    serving,
    misc
  };
}
