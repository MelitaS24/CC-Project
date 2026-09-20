/* ==========================================================================
   search.js — Fast Client-Side Book Search, Filtering & Sorting
   Handles real-time search by title/author/keyword, genre filtering,
   and dynamic sorting (Rating, A-Z, Year).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input') || document.getElementById('search-title');
  const clearBtn = document.getElementById('search-clear-btn');
  const genreSelect = document.getElementById('filter-genre') || document.getElementById('search-genre');
  const sortSelect = document.getElementById('sort-by');
  const grid = document.getElementById('search-grid') || document.querySelector('.search-grid');
  const noResults = document.getElementById('no-results');
  const resultsInfo = document.getElementById('results-info');

  if (!grid) return;

  const getCards = () => Array.from(grid.querySelectorAll('.book-card[data-title]'));

  function filterAndSortBooks() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const genre = genreSelect ? genreSelect.value.toLowerCase() : 'all';
    const sortBy = sortSelect ? sortSelect.value : 'rating-desc';

    if (clearBtn && searchInput) {
      clearBtn.style.display = searchInput.value ? 'flex' : 'none';
    }

    let cards = getCards();
    let visibleCount = 0;

    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const author = (card.dataset.author || '').toLowerCase();
      const cardGenre = (card.dataset.genre || '').toLowerCase();
      const desc = (card.querySelector('.book-card__desc') ? card.querySelector('.book-card__desc').textContent : '').toLowerCase();

      const matchesQuery = !query || title.includes(query) || author.includes(query) || desc.includes(query);
      const matchesGenre = genre === 'all' || cardGenre === genre;

      if (matchesQuery && matchesGenre) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Sort visible cards
    cards.sort((a, b) => {
      if (sortBy === 'rating-desc') {
        return parseFloat(b.dataset.rating || 0) - parseFloat(a.dataset.rating || 0);
      } else if (sortBy === 'title-asc') {
        return (a.dataset.title || '').localeCompare(b.dataset.title || '');
      } else if (sortBy === 'author-asc') {
        return (a.dataset.author || '').localeCompare(b.dataset.author || '');
      } else if (sortBy === 'year-desc') {
        return parseInt(b.dataset.year || 0) - parseInt(a.dataset.year || 0);
      }
      return 0;
    });

    // Re-append sorted cards into grid
    cards.forEach(c => grid.appendChild(c));

    // Update results indicator
    if (resultsInfo) {
      resultsInfo.innerHTML = `Showing <strong>${visibleCount}</strong> of <strong>${cards.length}</strong> books`;
    }

    // Toggle empty state
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', filterAndSortBooks);
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      filterAndSortBooks();
    });
  }

  if (genreSelect) {
    genreSelect.addEventListener('change', filterAndSortBooks);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', filterAndSortBooks);
  }

  // Check URL parameters (e.g. ?q=mystery or ?genre=Fantasy)
  const urlParams = new URLSearchParams(window.location.search);
  const qParam = urlParams.get('q');
  const genreParam = urlParams.get('genre');

  if (qParam && searchInput) {
    searchInput.value = qParam;
  }
  if (genreParam && genreSelect) {
    for (let option of genreSelect.options) {
      if (option.value.toLowerCase() === genreParam.toLowerCase()) {
        genreSelect.value = option.value;
        break;
      }
    }
  }

  // Initial run
  filterAndSortBooks();
});
