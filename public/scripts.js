// ===================== RANKING MODE =====================
const rankingModeButton = document.getElementById('toggle-ranking-mode');

let isRankingMode = false;
function toggleRankingMode() {
    isRankingMode = !isRankingMode;

    if (isRankingMode) {
        rankingModeButton.innerHTML = 'Edit Mode &nbsp; <i class="fa-solid fa-pen-to-square"></i>';
        document.querySelectorAll('.edit-ui').forEach(toHideElement => {
            toHideElement.style.display = 'none';
        });
        document.querySelectorAll('[contentEditable="true"]').forEach(toHideElement => {
            toHideElement.contentEditable = 'false';
        });
    } else {
        rankingModeButton.innerHTML = 'Ranking Mode &nbsp; <i class="fa-solid fa-ranking-star"></i>';
        document.querySelectorAll('.edit-ui').forEach(toHideElement => {
            toHideElement.style.display = '';
        });
        document.querySelectorAll('[contentEditable="false"]').forEach(toHideElement => {
            toHideElement.contentEditable = 'true';
        });
    }
}

rankingModeButton.addEventListener('click', e => {
    toggleRankingMode();
});

// ===================== TIERS =====================
const colors = ['#ff7f7e', '#ffbf7f', '#ffdf80', '#feff7f', '#beff7f', '#7eff80', '#7fffff', '#7fbfff', '#807fff', '#ff7ffe', '#bf7fbe', '#3b3b3b', '#858585', '#cfcfcf', '#f7f7f7'];
const texts = ['S', ...[...Array(26)].map((val, i) => String.fromCharCode(i + 65))];
let tiers = 0;

function addTier() {
    const color = colors[tiers % colors.length];
    const text = texts[tiers % texts.length];
    tiers++;

    const tier = document.getElementById('tier-template').content.cloneNode(true).firstElementChild;
    const id = 'tier-' + tiers
    tier.id = id;
    const value = tier.firstElementChild;
    value.style.backgroundColor = color;

    const textContainer = value.firstElementChild;
    textContainer.textContent = text;

    // reset scroll position when text unfocused, necessary since editing the text can modify the scroll position
    textContainer.addEventListener('blur', () => {
        value.scrollTo(0, 0);
    });

    const colorInput = value.lastElementChild.firstElementChild;
    colorInput.value = color;
    colorInput.addEventListener('input', e => {
        value.style.backgroundColor = colorInput.value;
    });

    const deleteButton = tier.lastElementChild;
    deleteButton.addEventListener('click', () => {
        document.getElementById(id).remove();
    });

    document.getElementById('tiers').appendChild(tier);
    initDragNDrop();
}

document.getElementById('add-tier').addEventListener('click', e => {
    addTier();
});

// add default tiers
for (let i = 0; i < 5; i++) {
    addTier();
}

// ===================== ITEMS =====================
let itemCount = 0;
function addItem(labelText, imageString) {
    const item = document.getElementById('item-template').content.cloneNode(true).firstElementChild;
    const id = 'item-' + itemCount++;
    item.id = id;

    item.firstElementChild.textContent = labelText;
    item.style.backgroundImage = imageString;

    // reset scroll position of item's label when unfocused, necessary since editing the content can modify the scroll position
    item.firstElementChild.addEventListener('blur', () => {
        item.firstElementChild.scrollTo(0, 0);
    });

    const deleteButton = item.lastElementChild;
    deleteButton.addEventListener('click', () => {
        document.getElementById(id).remove();
    });

    document.getElementById('items').prepend(item);
    initDragNDrop();
}

// Add-item modal
const addDialog = document.getElementById('add-item');
const preview = document.getElementById('preview');
const labelInput = document.getElementById('input-label');
const urlInput = document.getElementById('input-url');
const useURLradio = document.getElementById('use-image-url');
const useUploadradio = document.getElementById('use-image-upload');
const createItemButton = document.getElementById('create-item');

document.getElementById('add-item-button').addEventListener('click', e => {
    addDialog.showModal();
});

createItemButton.addEventListener('click', e => {
    addItem(preview.firstElementChild.textContent, preview.style.backgroundImage)
    addDialog.close();
});

labelInput.addEventListener('input', e => {
    preview.firstElementChild.textContent = labelInput.value;
})

useURLradio.addEventListener('input', e => {
    if (useURLradio.checked && urlInput.checkValidity())
        preview.style.backgroundImage = 'url(' + urlInput.value + ')';
});
urlInput.addEventListener('input', e => {
    if (useURLradio.checked) {
        preview.style.backgroundImage = 'url(' + urlInput.value + ')';
    }
});

let imageUploadDataURL;
const reader = new FileReader(); // converts image file to base64 string
reader.addEventListener(
    "load",
    () => {
        imageUploadDataURL = reader.result;
        preview.style.backgroundImage = 'url(' + imageUploadDataURL + ')';
        useUploadradio.checked = true;
    },
    false
);

const imageUploader = document.getElementById('image-upload');
imageUploader.addEventListener('input', e => {
    reader.readAsDataURL(imageUploader.files[0]);
});

const imageDrop = document.getElementById('image-drop');
imageDrop.addEventListener('drop', (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  
    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...ev.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === "file") {
                const file = item.getAsFile();
                reader.readAsDataURL(file);
            }
        });
    } else {
        // Use DataTransfer interface to access the file(s)
        [...ev.dataTransfer.files].forEach((file, i) => {
            reader.readAsDataURL(file);
        });
    }
});
imageDrop.addEventListener('dragover', (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
});

// fetch(`https://pixabay.com/api/?key=37243414-d59c5342f6ccb055f6c8071d1&q=${'bach+music'}`).then(t => t.json().then(j => console.log(j)))