const btnSearch = document.getElementById('btnSearch');
const btnClear = document.getElementById('btnClear');
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');

function getTimeZone(placeName) {
  const name = placeName.toLowerCase();
  if (name.includes('sydney')) return 'Australia/Sydney';
  if (name.includes('melbourne')) return 'Australia/Melbourne';
  if (name.includes('australia')) return 'Australia/Sydney';
  if (name.includes('tokyo') || name.includes('kyoto') || name.includes('japan')) return 'Asia/Tokyo';
  if (name.includes('rio') || name.includes('são paulo') || name.includes('sao paulo') || name.includes('copacabana') || name.includes('brazil')) return 'America/Sao_Paulo';
  if (name.includes('angkor') || name.includes('cambodia')) return 'Asia/Phnom_Penh';
  if (name.includes('taj mahal') || name.includes('india')) return 'Asia/Kolkata';
  if (name.includes('bora bora') || name.includes('french polynesia')) return 'Pacific/Tahiti';
  return 'UTC';
}

function getLocalTimeString(placeName) {
  const timeZone = getTimeZone(placeName);
  const options = {
    timeZone: timeZone,
    hour12: true,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };
  const formattedTime = new Date().toLocaleTimeString('en-US', options);
  console.log("Current time in " + placeName + ":", formattedTime);
  return formattedTime;
}

function fetchTravelData() {
  fetch('travel_recommendation_api.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Travel API Data fetched successfully:', data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

function searchRecommendations() {
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    resultsContainer.innerHTML = '<div class="no-results">Please enter a keyword to search.</div>';
    return;
  }

  fetch('travel_recommendation_api.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      return response.json();
    })
    .then(data => {
      console.log('Search query:', query);
      console.log('Fetched data for search:', data);

      let matchedItems = [];

      if (query === 'beach' || query === 'beaches') {
        matchedItems = data.beaches || [];
      } else if (query === 'temple' || query === 'temples') {
        matchedItems = data.temples || [];
      } else if (query === 'country' || query === 'countries') {
        if (data.countries && data.countries.length > 0) {
          data.countries.forEach(c => {
            if (c.cities) {
              matchedItems.push(...c.cities);
            }
          });
        }
      } else {
        if (data.countries) {
          const matchedCountry = data.countries.find(c => c.name.toLowerCase() === query || c.name.toLowerCase().includes(query));
          if (matchedCountry && matchedCountry.cities) {
            matchedItems = matchedCountry.cities;
          } else {
            data.countries.forEach(c => {
              if (c.cities) {
                c.cities.forEach(city => {
                  if (city.name.toLowerCase().includes(query)) {
                    matchedItems.push(city);
                  }
                });
              }
            });
          }
        }

        if (matchedItems.length === 0 && data.temples) {
          data.temples.forEach(temple => {
            if (temple.name.toLowerCase().includes(query)) {
              matchedItems.push(temple);
            }
          });
        }

        if (matchedItems.length === 0 && data.beaches) {
          data.beaches.forEach(beach => {
            if (beach.name.toLowerCase().includes(query)) {
              matchedItems.push(beach);
            }
          });
        }
      }

      displayResults(matchedItems);
    })
    .catch(error => {
      console.error('Search error:', error);
      resultsContainer.innerHTML = '<div class="no-results">Unable to load recommendations at this time.</div>';
    });
}

function displayResults(items) {
  resultsContainer.innerHTML = '';

  if (!items || items.length === 0) {
    resultsContainer.innerHTML = '<div class="no-results">No destinations found matching your keyword. Try "beach", "temple", or "country".</div>';
    return;
  }

  items.forEach(item => {
    const timeString = getLocalTimeString(item.name);

    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = item.name;

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = item.name;

    const timeElem = document.createElement('p');
    timeElem.className = 'card-time';
    timeElem.textContent = 'Local Time: ' + timeString;

    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = item.description;

    const btn = document.createElement('button');
    btn.className = 'card-btn';
    btn.textContent = 'Visit';

    cardBody.appendChild(title);
    cardBody.appendChild(timeElem);
    cardBody.appendChild(desc);
    cardBody.appendChild(btn);

    card.appendChild(img);
    card.appendChild(cardBody);

    resultsContainer.appendChild(card);
  });
}

function clearResults() {
  if (searchInput) {
    searchInput.value = '';
  }
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
  }
}

if (btnSearch) {
  btnSearch.addEventListener('click', searchRecommendations);
}

if (btnClear) {
  btnClear.addEventListener('click', clearResults);
}

if (searchInput) {
  searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      searchRecommendations();
    }
  });
}

fetchTravelData();
