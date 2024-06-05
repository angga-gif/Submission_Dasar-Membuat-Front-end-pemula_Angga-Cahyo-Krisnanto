const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
let isEditMode = false;
let editedBookId = null;

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (isEditMode) {
      updateBook(editedBookId);
    } else {
      addBook();
    }
  });

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  incompleteBookshelfList.innerHTML = '';

  const completeBookshelfList = document.getElementById('completeBookshelfList');
  completeBookshelfList.innerHTML = '';

  for (const book of books) {
    const bookElement = makeBook(book);
    if (!book.isComplete) {
      incompleteBookshelfList.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});

function addBook() {
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = parseInt(document.getElementById('inputBookYear').value);
  const isComplete = document.getElementById('inputBookIsComplete').checked;

  const generatedID = +new Date();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}

function makeBook(bookObject) {
  const bookTitle = document.createElement('h3');
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = `Penulis: ${bookObject.author}`;

  const bookYear = document.createElement('p');
  bookYear.innerText = `Tahun: ${bookObject.year}`;

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('action');

  const bookCompleted = document.createElement('button');
  bookCompleted.classList.add('green');
  bookCompleted.innerText = bookObject.isComplete ? 'Belum selesai di Baca' : 'Selesai dibaca';
  bookCompleted.addEventListener('click', function () {
    undoBookStatus(bookObject.id);
  });

  const bookRemoved = document.createElement('button');
  bookRemoved.classList.add('red');
  bookRemoved.innerText = 'Hapus buku';
  bookRemoved.addEventListener('click', function () {
    removeBook(bookObject.id);
  });

  const bookEdited = document.createElement('button');
  bookEdited.classList.add('blue');
  bookEdited.innerText = 'Edit buku';
  bookEdited.addEventListener('click', function () {
    editBook(bookObject.id);
  });

  buttonContainer.append(bookCompleted, bookRemoved, bookEdited);

  const bookItem = document.createElement('article');
  bookItem.classList.add('book_item');
  bookItem.append(bookTitle, bookAuthor, bookYear, buttonContainer);

  return bookItem;
}

function undoBookStatus(bookId) {
  const book = findBook(bookId);

  if (book == null) return;

  book.isComplete = !book.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
    const book = findBook(bookId);
  
    if (book == null) return;
  
    document.getElementById('inputBookTitle').value = book.title;
    document.getElementById('inputBookAuthor').value = book.author;
    document.getElementById('inputBookYear').value = book.year;
    document.getElementById('inputBookIsComplete').checked = book.isComplete;
  
    const submitButton = document.getElementById('bookSubmit');
    submitButton.innerText = 'Edit Buku';
    isEditMode = true;
    editedBookId = bookId;
  }
  
  function updateBook(bookId) {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;
  
    const book = findBook(bookId);
    book.title = bookTitle;
    book.author = bookAuthor;
    book.year = bookYear;
    book.isComplete = isComplete;
  
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  
    const submitButton = document.getElementById('bookSubmit');
    submitButton.innerHTML = 'Masukkan Buku ke rak <span>Belum selesai dibaca</span>';
    isEditMode = false;
    editedBookId = null;
  }

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function searchBook() {
  const searchBookTitle = document.getElementById('searchBookTitle').value.toLowerCase();

  const bookItemList = document.querySelectorAll('.book_item > h3');

  for (bookItem of bookItemList) {
    const book = bookItem.innerText.toLowerCase();
    if (book.includes(searchBookTitle)) {
      bookItem.parentElement.style.display = 'block';
    } else {
      bookItem.parentElement.style.display = 'none';
    }
  }
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log('Data berhasil disimpan.');
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}