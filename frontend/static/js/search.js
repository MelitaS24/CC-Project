/* ==========================================================================
   search.js — Backend Book Search, Filtering & Sorting
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const genreSelect = document.getElementById('filter-genre');
  const sortSelect = document.getElementById('sort-by');

  const grid = document.getElementById('search-results-grid');
  const noResults = document.getElementById('no-results');
  const resultCount = document.getElementById('result-count');

  if (!grid) return;

  let allBooks = [];

  // ------------------------------------------------------------
  // Load books from Flask backend
  // ------------------------------------------------------------

  async function loadBooks() {

    try {

      const response = await fetch(
        'http://127.0.0.1:5001/books'
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to load books'
        );
      }

      allBooks = data.books || [];

      renderBooks();

    } catch (error) {

      console.error('Search books error:', error);

      grid.innerHTML = '';

      if (resultCount) {
        resultCount.innerHTML =
          'Unable to load books from the backend.';
      }

      if (noResults) {
        noResults.style.display = 'block';
      }
    }
  }


  // ------------------------------------------------------------
  // Render books
  // ------------------------------------------------------------

  function renderBooks() {

    const query = searchInput
      ? searchInput.value.trim().toLowerCase()
      : '';

    const selectedGenre = genreSelect
      ? genreSelect.value.toLowerCase()
      : 'all';

    const sortBy = sortSelect
      ? sortSelect.value
      : 'title-asc';


    // Filter
    let books = allBooks.filter(book => {

      const title = (book.title || '').toLowerCase();

      const author = (book.author || '').toLowerCase();

      const genre = (book.genre || '').toLowerCase();

      const description =
        (book.description || '').toLowerCase();


      const matchesSearch =
        !query ||
        title.includes(query) ||
        author.includes(query) ||
        description.includes(query);

      const matchesGenre =
        selectedGenre === 'all' ||
        genre === selectedGenre;


      return matchesSearch && matchesGenre;

    });


    // ------------------------------------------------------------
    // Sorting
    // ------------------------------------------------------------

    if (sortBy === 'title-asc') {

      books.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '')
      );

    } else if (sortBy === 'author-asc') {

      books.sort((a, b) =>
        (a.author || '').localeCompare(b.author || '')
      );

    }


    // ------------------------------------------------------------
    // Update result count
    // ------------------------------------------------------------

    if (resultCount) {

      resultCount.innerHTML =
        `Showing <strong>${books.length}</strong> results`;

    }


    // ------------------------------------------------------------
    // Empty state
    // ------------------------------------------------------------

    if (noResults) {

      noResults.style.display =
        books.length === 0 ? 'block' : 'none';

    }


    // ------------------------------------------------------------
    // Clear old cards
    // ------------------------------------------------------------

    grid.innerHTML = '';


    // ------------------------------------------------------------
    // Create book cards
    // ------------------------------------------------------------

    books.forEach(book => {

      const card = document.createElement('article');

      card.className =
        'card book-card hover-glow';


      card.innerHTML = `

        <div class="book-card__cover-wrapper">

          <img
            src="${book.cover_url || 'https://picsum.photos/seed/book' + book.id + '/400/540'}"
            alt="${book.title}"
            class="book-card__cover"
            loading="lazy"
          />

          <div class="book-card__meta-overlay">

            <span
              class="badge badge-forest"
              style="background:rgba(36,72,63,0.85);color:#FFF;"
            >
              ${book.genre}
            </span>

          </div>

        </div>


        <div class="book-card__body">

          <h3 class="book-card__title">
            ${book.title}
          </h3>

          <p class="book-card__author">
            ${book.author}
          </p>

          <p class="book-card__desc">
            ${book.description || 'No description available.'}
          </p>


          <div class="book-card__footer">

            <span class="book-card__status">
              Available
            </span>

            <div class="book-card__actions">

              <a
                href="details.html?id=${book.id}"
                class="btn btn-primary"
              >
                <span>Read</span>
              </a>

            </div>

          </div>

        </div>

      `;


      grid.appendChild(card);

    });

  }


  // ------------------------------------------------------------
  // Search input
  // ------------------------------------------------------------

  if (searchInput) {

    searchInput.addEventListener(
      'input',
      () => {

        if (clearBtn) {

          clearBtn.style.display =
            searchInput.value ? 'flex' : 'none';

        }

        renderBooks();

      }
    );

  }


  // ------------------------------------------------------------
  // Clear search
  // ------------------------------------------------------------

  if (clearBtn && searchInput) {

    clearBtn.addEventListener(
      'click',
      () => {

        searchInput.value = '';

        clearBtn.style.display = 'none';

        searchInput.focus();

        renderBooks();

      }
    );

  }


  // ------------------------------------------------------------
  // Genre filter
  // ------------------------------------------------------------

  if (genreSelect) {

    genreSelect.addEventListener(
      'change',
      renderBooks
    );

  }


  // ------------------------------------------------------------
  // Sorting
  // ------------------------------------------------------------

  if (sortSelect) {

    sortSelect.addEventListener(
      'change',
      renderBooks
    );

  }


  // ------------------------------------------------------------
  // URL parameters
  // Example:
  // search.html?q=harry
  // search.html?genre=Fantasy
  // ------------------------------------------------------------

  const urlParams =
    new URLSearchParams(window.location.search);

  const qParam =
    urlParams.get('q');

  const genreParam =
    urlParams.get('genre');


  if (qParam && searchInput) {

    searchInput.value = qParam;

  }


  if (genreParam && genreSelect) {

    for (const option of genreSelect.options) {

      if (
        option.value.toLowerCase() ===
        genreParam.toLowerCase()
      ) {

        genreSelect.value = option.value;

        break;

      }

    }

  }


  // ------------------------------------------------------------
  // Start
  // ------------------------------------------------------------

  loadBooks();

});