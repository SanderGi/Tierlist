function alert(message) {
    const dialog = document.getElementById('alert');
    dialog.innerHTML = /* html */`
        <p>${message}</p>
        <button class="button" style="float: right">OK</button>
    `;
    dialog.lastElementChild.onclick = () => { document.getElementById('alert').close() };
    dialog.showModal();
}

// ===================== SHARE =====================
if (!LZUTF8) { /* fallback if compression is not available */
    LZUTF8 = {
        compress: (input, options) => input,
        decompress: (input, options) => input
    }
}

const saved = window.location.hash;
if (saved) {
    alert('Saved data loaded. Warning: only some browsers allow opening such long urls.');
    
    const saveData = JSON.parse(LZUTF8.decompress(decodeURIComponent(saved.slice(1)), {inputEncoding: 'Base64'}));
    document.getElementById('items').innerHTML = saveData.items;
    document.getElementById('tiers').innerHTML = saveData.tiers;
    document.getElementById('title').textContent = saveData.title;
    setTimeout(toggleRankingMode);
}

async function save() {
    const saveData = {};
    saveData.items = document.getElementById('items').innerHTML;
    saveData.tiers = document.getElementById('tiers').innerHTML;
    saveData.title = document.getElementById('title').textContent;

    await navigator.clipboard.writeText(window.location.href + '#' + encodeURIComponent(LZUTF8.compress(JSON.stringify(saveData), {outputEncoding: 'Base64'})));
    document.getElementById('share-button').blur();
    alert('Saved url to clipboard. Warning: only some browsers allow opening such long urls.');
}
document.getElementById('share-button').addEventListener('click', async e => {
    save();
});
document.getElementById('share-button').addEventListener('focus', async e => {
   save();
});

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
if (!saved) for (let i = 0; i < 5; i++) {
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

function handleUploadedDataURL(dataurl) {
    preview.style.backgroundImage = 'url(' + dataurl + ')';
    useUploadradio.checked = true;
}

function handleUploadedFile(file) {
    reduceFileSize(file, 4000, 128, Infinity, 0.5, blob => {
        blobToDataURL(blob, handleUploadedDataURL);
    });
}

const imageUploader = document.getElementById('image-upload');
imageUploader.addEventListener('input', e => {
    handleUploadedFile(imageUploader.files[0]);
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
                handleUploadedFile(file);
            }
        });
    } else {
        // Use DataTransfer interface to access the file(s)
        [...ev.dataTransfer.files].forEach((file, i) => {
            handleUploadedFile(file);
        });
    }
});
imageDrop.addEventListener('dragover', (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
});

// ===================== IMAGE COMPRESSION =====================
// From https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob, needed for Safari:
if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function(callback, type, quality) {

            var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
                len = binStr.length,
                arr = new Uint8Array(len);

            for (var i = 0; i < len; i++) {
                arr[i] = binStr.charCodeAt(i);
            }

            callback(new Blob([arr], {type: type || 'image/png'}));
        }
    });
}

window.URL = window.URL || window.webkitURL;

// Modified from https://stackoverflow.com/a/32490603, cc by-sa 3.0
// -2 = not jpeg, -1 = no data, 1..8 = orientations
function getExifOrientation(file, callback) {
    // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
    if (file.slice) {
        file = file.slice(0, 131072);
    } else if (file.webkitSlice) {
        file = file.webkitSlice(0, 131072);
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var view = new DataView(e.target.result);
        if (view.getUint16(0, false) != 0xFFD8) {
            callback(-2);
            return;
        }
        var length = view.byteLength, offset = 2;
        while (offset < length) {
            var marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1) {
                if (view.getUint32(offset += 2, false) != 0x45786966) {
                    callback(-1);
                    return;
                }
                var little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;
                for (var i = 0; i < tags; i++)
                    if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                        callback(view.getUint16(offset + (i * 12) + 8, little));
                        return;
                    }
            }
            else if ((marker & 0xFF00) != 0xFF00) break;
            else offset += view.getUint16(offset, false);
        }
        callback(-1);
    };
    reader.readAsArrayBuffer(file);
}

// Derived from https://stackoverflow.com/a/40867559, cc by-sa
function imgToCanvasWithOrientation(img, rawWidth, rawHeight, orientation) {
    var canvas = document.createElement('canvas');
    if (orientation > 4) {
        canvas.width = rawHeight;
        canvas.height = rawWidth;
    } else {
        canvas.width = rawWidth;
        canvas.height = rawHeight;
    }

    if (orientation > 1) {
        console.log("EXIF orientation = " + orientation + ", rotating picture");
    }

    var ctx = canvas.getContext('2d');
    switch (orientation) {
        case 2: ctx.transform(-1, 0, 0, 1, rawWidth, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, rawHeight); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, rawHeight, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, rawHeight, rawWidth); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, rawWidth); break;
    }
    ctx.drawImage(img, 0, 0, rawWidth, rawHeight);
    return canvas;
}

function reduceFileSize(file, acceptFileSize, maxWidth, maxHeight, quality, callback) {
    if (file.size <= acceptFileSize) {
        callback(file);
        return;
    }
    var img = new Image();
    img.onerror = function() {
        URL.revokeObjectURL(this.src);
        callback(file);
    };
    img.onload = function() {
        URL.revokeObjectURL(this.src);
        getExifOrientation(file, function(orientation) {
            var w = img.width, h = img.height;
            var scale = (orientation > 4 ?
                Math.min(maxHeight / w, maxWidth / h, 1) :
                Math.min(maxWidth / w, maxHeight / h, 1));
            h = Math.round(h * scale);
            w = Math.round(w * scale);

            var canvas = imgToCanvasWithOrientation(img, w, h, orientation);
            canvas.toBlob(function(blob) {
                console.log("Resized image to " + w + "x" + h + ", " + (blob.size >> 10) + "kB");
                callback(blob);
            }, 'image/jpeg', quality);
        });
    };
    img.src = URL.createObjectURL(file);
}

function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);}
    a.readAsDataURL(blob);
}

// fetch(`https://pixabay.com/api/?key=37243414-d59c5342f6ccb055f6c8071d1&q=${'bach+music'}`).then(t => t.json().then(j => console.log(j)))