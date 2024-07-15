document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=30';
    let collection = [];
    let favorites = [];
    let ascending = true;

   
    const totalCollectionPokemons = document.getElementById('total-pokemons');
    const totalFavoritesPokemons = document.getElementById('total-fav-pokemons');
    
    const sortButton = document.getElementById('sort-button');


    async function fetchData() {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            const pokemonPromises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
            const pokemonDetails = await Promise.all(pokemonPromises);
            collection = pokemonDetails.map(pokemon => ({
                id: pokemon.id,
                name: pokemon.name,
                image: pokemon.sprites.front_default,
                type: pokemon.types.map(typeInfo => typeInfo.type.name).join(', '),
                weight: pokemon.weight
            }));
            renderElements('main');
            updateTotal();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function renderElements(type) {
        const containerId = type === 'main' ? 'collection-items' : 'favorite-items';
        const containerData = type === 'main' ? collection : favorites;
        const container = document.getElementById(containerId);

        container.innerHTML = '';

        containerData.forEach(item => {
            const card = createCard(item);
            const actionButton = document.createElement('button');

            actionButton.textContent = type === 'main' ? 'Add to Favorites' : 'Remove from Favorites';
            actionButton.addEventListener('click', () => moveItems(item.id, type));
            card.appendChild(actionButton);
            container.appendChild(card);
        });
    }

    function createCard(item) {
        const card = document.createElement('div');
        card.classList.add('card');
        const img = document.createElement('img');
        img.src = item.image;
        const name = document.createElement('h3');
        name.textContent = item.name;
        const type = document.createElement('p');
        type.textContent = `Type: ${item.type}`;
        const weight = document.createElement('p');
        weight.textContent = `Weight: ${item.weight}`;
        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(type);
        card.appendChild(weight);
        return card;
    }

    function moveItems(id, type) {
        const sourceArray = type === 'main' ? collection : favorites;
        const targetArray = type === 'main' ? favorites : collection;

        const index = sourceArray.findIndex(item => item.id === id);
        if (index !== -1) {
            targetArray.push(sourceArray[index]);
            sourceArray.splice(index, 1);
            renderElements('main');
            renderElements('favs');
            updateTotal();
        }
    }

    function updateTotal() {
        const totalCollectionWeight = collection.reduce((sum, pokemon) => sum + pokemon.weight, 0);
        const totalFavsWeight = favorites.reduce(
            (sum, pokemon) => sum + pokemon.weight, 0);
        
        totalCollectionPokemons.textContent = `Total Pokémon Weight: ${totalCollectionWeight}`;
        totalFavoritesPokemons.textContent = `Total Pokemon Weight: ${totalFavsWeight}`;
    }

    function sortItems() {
        const compareFunction = ascending
            ? (a, b) => a.name.localeCompare(b.name)
            : (a, b) => b.name.localeCompare(a.name);
        collection.sort(compareFunction);
        favorites.sort(compareFunction);
        renderElements('main');
        renderElements('favs');
        ascending = !ascending;
        sortButton.textContent = ascending ? 'Sort A-Z' : 'Sort Z-A';
    }

    sortButton.addEventListener('click', sortItems);

    fetchData();
});
