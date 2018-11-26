import './slider';
import createNote from './newNoteText';

const textField = document.querySelector('#textField');

const queryDataObject = {
  key: 'AIzaSyCmyyF1CeiRA4u2rRwMbROfVH6PaEE2MOU',
  type: 'video',
  part: 'snippet',
  count: '15',
};

function createNewNote(index, components) {
  const noteDiv = document.createElement('div');
  noteDiv.className = 'note';
  if (index % 4 === 2 || index % 4 === 3) {
    noteDiv.className += ' hide';
  }

  components.appendChild(noteDiv);
  noteDiv.innerHTML = createNote;
}

function initializeNote(currentElement, currentNote) {
  const imageBox = currentElement.querySelector('.imageBox');
  const imageUrl = currentNote.snippet.thumbnails.medium.url;
  imageBox.style = `background: url(${imageUrl}) no-repeat;`;

  const title = imageBox.querySelector('a');
  title.href = `https://www.youtube.com/watch?v=${currentNote.id}`;
  title.innerHTML = currentNote.snippet.title;
  const channelData = currentElement.querySelectorAll('.channelData');
  channelData[0].innerHTML = currentNote.snippet.channelTitle;
  const date = currentNote.snippet.publishedAt.split('T')[0];
  channelData[1].innerHTML = date;
  channelData[2].innerHTML = currentNote.statistics.viewCount;

  const description = currentElement.querySelector('.description');
  const descriptionText = currentNote.snippet.description.slice(0, 100);
  description.textContent = `${descriptionText}...`;
}

function createAnswerForMobile(notes) {
  const components = document.querySelectorAll('.components');
  if (components.textContent !== 'undefined') {
    for (let i = 0; i < components.length; i += 1) {
      createNewNote(0, components[i]);
    }
  }
  const elements = document.querySelectorAll('.note');
  for (let i = 0, n = components.length - 2; i < n; i += 1) {
    initializeNote(elements[i + 1], notes[i]);
    if (i === 0) {
      initializeNote(elements[components.length - 1], notes[i]);
    }
    if (i === n - 1) {
      initializeNote(elements[0], notes[i]);
    }
  }
}

function createAnswer(notes) {
  const components = document.querySelectorAll('.components');
  if (window.screen.width < 480) {
    return createAnswerForMobile(notes);
  }
  if (components.textContent !== 'undefined') {
    let numSlide = 1;
    for (let i = 0, n = queryDataObject.count; i < n; i += 1) {
      createNewNote(i, components[numSlide]);
      if (i % 4 === 3) {
        numSlide += 1;
      }
    }

    // Добавить крайние элементы
    for (let i = 0; i < 4; i += 1) {
      createNewNote(i, components[0]);
    }
    for (let i = 0; i < 4; i += 1) {
      createNewNote(i, components[components.length - 1]);
    }
  }
  const elements = document.querySelectorAll('.note');
  for (let i = 0, n = queryDataObject.count; i < n; i += 1) {
    initializeNote(elements[i + 4], notes[i]);
  }

  // Для крайних элементов
  for (let i = 0; i < 4; i += 1) {
    initializeNote(elements[i], notes[i]);
  }
  for (let i = elements.length - 4; i < elements.length; i += 1) {
    initializeNote(elements[i], notes[i - 8]);
  }
  return null;
}

function requests(q) {
  fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${queryDataObject.key}&type=${
      queryDataObject.type
    }&part=${queryDataObject.part}&maxResults=${queryDataObject.count}&q=${q}`,
    { method: 'GET' },
  )
    .then(response => response.json())
    .then((data) => {
      const videoIdArray = data.items.map(val => val.id.videoId);
      const idStr = videoIdArray.join(',');
      fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${
          queryDataObject.key
        }&id=${idStr}&part=snippet,statistics`,
        { method: 'GET' },
      )
        .then(secondResponse => secondResponse.json())
        .then((snippetData) => {
          createAnswer(snippetData.items);
        });
    });
}

textField.addEventListener('keydown', (e) => {
  if (e.keyCode === 13) {
    requests(textField.value);
  }
});
