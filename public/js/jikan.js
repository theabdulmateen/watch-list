const jikanjs   = require("jikanjs");
const fetch     = require("node-fetch");

const searchBar = document.getElementById("anime-search");
const dropdown = document.querySelector(".search-list");


searchBar.addEventListener("keydown", (event) => {
    event = event || window.event;
    dropdown.innerHTML = "";

    if (event.key !== "Escape") {
        const searchQuery = searchBar.value;

        if (searchQuery.length > 2) {
            jikanjs.search(type = 'anime', query = searchQuery, page = null, params = {}, limit = 10).then((animeList) => {
                animeList.results.forEach((anime) => {
                    const div = document.createElement("div");

                    const searchlist__details = document.createElement("div");
                    searchlist__details.classList.add("search-list__details");

                    const searchlist__item = document.createElement("div");
                    searchlist__item.classList.add("search-list__item");

                    const img = document.createElement("img");
                    img.src = anime.image_url;

                    const animeTitle = document.createElement("h2");
                    animeTitle.appendChild(document.createTextNode(anime.title));

                    const type = document.createElement("h4");
                    type.appendChild(document.createTextNode("Type: " + anime.type));

                    const score = document.createElement("span");
                    score.appendChild(document.createTextNode("Score: " + anime.score));
                    score.classList.add("search-list__score");

                    const synopsis = document.createElement("span");
                    synopsis.appendChild(document.createTextNode("Synopsis: " + anime.synopsis));
                    synopsis.classList.add("searchlist__synopsis");

                    const addButton = document.createElement("button");
                    addButton.appendChild(document.createTextNode("Add To WatchList"));
                    addButton.classList.add("ui");
                    addButton.classList.add("button");
                    addButton.classList.add("search-list__addButton");
                    addButton.addEventListener("click", (event) => {
                        addToWatchList(anime).catch(err => console.log(err));;
                    });

                    searchlist__details.appendChild(animeTitle);
                    searchlist__details.appendChild(type);
                    searchlist__details.appendChild(score);
                    searchlist__details.appendChild(synopsis);
                    searchlist__details.appendChild(synopsis);
                    searchlist__details.appendChild(addButton);

                    div.appendChild(img); 
                    div.appendChild(searchlist__details); 

                    searchlist__item.appendChild(div);
                    dropdown.appendChild(searchlist__item);
                    dropdown.appendChild(searchlist__item);

                });
            }).catch((err) => {
                console.error(err);
            });
        }
    }
});


async function addToWatchList(anime) {
    const url = "/watchlist";
    const params = new URLSearchParams();

    let animeLoaded = await jikanjs.loadAnime(anime.mal_id, '' );

    let genre = animeLoaded.genres[0].name;
    for (let i = 1; i < animeLoaded.genres.length; i++) {
        genre += ", " + animeLoaded.genres[i].name;
    }

    params.append("movie[genre]", genre);
    params.append('movie[title]', anime.title);
    params.append('movie[synopsis]', anime.synopsis);

    const fetchParam = {
        method: "POST",
        body: params
    };

    let response = await fetch(url, fetchParam);
    window.location.href = "/watchlist";
}
