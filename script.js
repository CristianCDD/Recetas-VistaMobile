const mealsEl = document.getElementById('meals');
const FavoriteContainer = document.getElementById('fav-meals');

const mealPopup = document.getElementById('meal-popup');
const popupCloseBtn = document.getElementById('close-popup');
const mealInfoEl = document.getElementById('meal-info');

const reset = document.getElementById('reset-popup');


reset.addEventListener('click',()=>{
    window.location.reload();
})

const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');
getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randonMeal = respData.meals[0];
    addMeal(randonMeal, true);
    console.log(randonMeal);

}
async function getMealById(id) {
    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    const respData = await resp.json();
    const meal = respData.meals[0];
    return meal;
}

async function getMealsBySearch(term) {
    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`)

    const resptData = await resp.json();
    const meals = await resptData.meals;
    return meals;
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `
                <div class="meal-header">

                ${random == true ? `<span class="random">Comidas  <i class="fa-solid fa-utensils"></i></span>` : ''}
                
                
                    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
                </div>
                <div class="meal-body">
                    <h4>${mealData.strMeal}</h4>
                    <button class="fav-btn">
                        <i class="fa fa-heart"></i>                                   
                    </button>
                </div>
            `;

    const btne = meal.querySelector('.meal-body .fav-btn');

    btne.addEventListener('click', () => {
        if (btne.classList.contains('active')) {
            removeMealLS(mealData.idMeal);
            btne.classList.remove('active');
            /* window.location.reload() */;

        } else {
            addMealLS(mealData.idMeal);
            btne.classList.add('active');
            /* window.location.reload(); */

        }

        fetchFavMeals();

    });

    const mealIMG = meal.querySelector('img')

    /* Mostrar la receta en pantalla completa (la imagen principal que aparece) */
    mealIMG.addEventListener('click',(e)=>{
        showMealInfo(mealData);
        console.log('Entrando');
    })

    mealsEl.appendChild(meal);


}

function addMealLS(mealId) {

    const mealIds = getMealsLS();
    /*  console.log("1. "+mealIds); */
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));

    /* console.log("2. "+[...mealIds, mealId]); */
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();
    localStorage.setItem(
        'mealIds',
        JSON.stringify(mealIds.filter((id) => id !== mealId))
    );

}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? [] : mealIds;

}

async function fetchFavMeals() {
    FavoriteContainer.innerHTML = '';

    const mealIds = getMealsLS();


    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        const meal = await getMealById(mealId);
        addMealFav(meal);
    }



}

/*Agregando  Circulos como instagram */
function addMealFav(mealData) {
    const favMeal = document.createElement('li');
    

    favMeal.innerHTML = `
        <img src="${mealData.strMealThumb}"
        alt = "${mealData.strMeal}">
        <span>${mealData.strMeal}</span>
        <button class = "clear"><i class="fa-solid fa-rectangle-xmark"></i></button>
        `;

    const btn = favMeal.querySelector('.clear');

    const favMealIMG = favMeal.querySelector('img');
    console.log(favMealIMG);

    btn.addEventListener('click', () => {

       removeMealLS(mealData.idMeal);
       fetchFavMeals();
    })

    favMealIMG.addEventListener('click',()=>{
        showMealInfo(mealData); 
    })

    FavoriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
    mealInfoEl.innerHTML = '';

    const mealEl = document.createElement('div');

    const ingredients = [];
    for(let i=1; i<=20; i++){
        if(mealData[`strIngredient${i}`]){
            ingredients.push(`${mealData['strIngredient'+i]} / ${mealData['strMeasure'+i]}`);
        }else{
            break;
        }
    }



    mealEl.innerHTML = ` 
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        
        <p>${mealData.strInstructions}</p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients.map((ing)=> `<li>${ing}</li>`).join("")}
        </ul>
        `;

    mealInfoEl.appendChild(mealEl);

    mealPopup.classList.remove('hidden');
}

/* Icono de lupa para buscar */
searchBtn.addEventListener('click', async () => {
    mealsEl.innerHTML = '';
    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

    if (meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        })
    }

});

popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden');
})