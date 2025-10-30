const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-btn");
const errorContainer = document.getElementById("error-container");
const resultHeading = document.getElementById("result-heading");
const mealsContainer = document.querySelector(".meals-container");
const mealDetailsContent = document.getElementById("meal-details-content");
const backButton = document.getElementById("back-btn");
const mealDetails = document.getElementById("meal-details");


const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

searchButton.addEventListener("click", searchMeals);
backButton.addEventListener("click", () => {
    mealDetails.classList.add("hidden");
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchMeals();
});

mealsContainer.addEventListener("click", showMealDetails);

async function searchMeals() {
    const searchItem = searchInput.value.trim();
    mealDetails.classList.add("hidden");
    if (!searchItem) {
        errorContainer.textContent = "Please enter a search term";
        errorContainer.classList.remove("hidden");
        return;
    };
    try {
        resultHeading.textContent = `Searching for "${searchItem}"...`;
        mealsContainer.innerHTML = "";
        errorContainer.classList.add("hidden");

        const response = await fetch(`${SEARCH_URL}${searchItem}`);
        const data = await response.json();
        if (data.meals === null) {
            resultHeading.textContent = "";
            mealsContainer.innerHTML = "";
            errorContainer.textContent = `No recipes found for "${searchItem}". Try another search term!`;
            errorContainer.classList.remove("hidden");
        } else {
            resultHeading.textContent = `Search results for ${searchItem}: `;
            displayMeals(data.meals);
            searchInput.value = "";
        }
    } catch (error) {
        errorContainer.textContent = "Something went wrong. Please try again later.";
        errorContainer.classList.remove("hidden");
    }
}

function displayMeals(meals) {
    mealsContainer.innerHTML = "";

    meals.forEach(meal => {
        mealsContainer.innerHTML += `
            <div class="meal" data-meal-id="${meal.idMeal}">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}"/>
            <div class="meal-info">
            <h3 class="meal-title">${meal.strMeal}</h3>
            ${meal.strCategory ?
                `<div class="meal-category">${meal.strCategory}</div>`
                : ""
            }
            </div>
            </div>
            `
    });
}

async function showMealDetails(e) {
    const mealEl = e.target.closest(".meal");
    if (!mealEl) return;

    const mealId = mealEl.getAttribute("data-meal-id");

    try {
        const response = await fetch(`${LOOKUP_URL}${mealId}`);
        const data = await response.json();
        console.log(data);

        if (data.meals && data.meals[0]) {
            const selectedMeal = data.meals[0];
            const ingredients = [];

            for (let i = 1; i <= 20; i++) {
                if (
                    selectedMeal[`strIngredient${i}`] &&
                    selectedMeal[`strIngredient${i}`].trim() !== ""
                ) {
                    ingredients.push({
                        ingredient: selectedMeal[`strIngredient${i}`],
                        measure: selectedMeal[`strMeasure${i}`],
                    });
                }
            }

            mealDetailsContent.innerHTML = `
                <img src="${selectedMeal.strMealThumb}" alt="${selectedMeal.strMeal}" class="meal-details-img"/>
                <h2 class="meal-details-title">${selectedMeal.strMeal}</h2>
                <div class="meal-details-category">
                    <span>${selectedMeal.strCategory || "Uncategorized"}</span>
                </div>
                <div class="meal-details-instructions">
                    <h3>Instructions</h3>
                    <p>${selectedMeal.strInstructions}</p>
                </div>
                <div class="meal-details-ingredients">
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${ingredients
                            .map(
                                (item) =>
                                    `<li><i class="fas fa-check-circle"></i>${item.measure} ${item.ingredient}</li>`
                            )
                            .join("")}
                    </ul>
                </div>
                ${
                    selectedMeal.strYoutube
                        ? `
                    <a href="${selectedMeal.strYoutube}" target="_blank" class="youtube-link">
                        <i class="fab fa-youtube"></i>Watch Video
                    </a>
                `
                        : ""
                }
            `;

            mealDetails.classList.remove("hidden");
            mealDetails.scrollIntoView({ behavior: "smooth" });
        } 
    } catch (error) {
        errorContainer.text = "Could not load recipe details. Please try again later.";
        errorContainer.classList.remove("hidden");
    }
} 
