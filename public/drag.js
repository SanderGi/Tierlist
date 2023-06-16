
let dragSrcEl = null; // keep track of the currently dragged element
let items, dragzones; // the draggable items and dropable dropzones
    
// ===================== FOR DRAGGABLE ELEMENTS =====================
// These elements have the draggable="true" attribute set

/**
 * Once a drag starts, we note the dragged element and make it slightly transparent to indicate it is being dragged
 */
function handleDragStart(e) {
    this.style.opacity = '0.4';

    dragSrcEl = this;
}

/**
 * After the drag, we make the element fully opaque again. We also reset some of the dropzone related styles just in case.
 */
function handleDragEnd(e) {
    this.style.opacity = '1';
    
    enterCount = 0;
    dropzones.forEach(zone => {
        zone.classList.remove('over');
    });
}

// ===================== FOR DROPZONES =====================
// These elements have the .dropzone class and optionally a data-dropzone-for attribute set to the
// id of the container element that draggable elements dropped on this zone should be placed in

// keep track of the number of times the drag path enters and leaves elements within the dropzone so
// while the drag is inside the zone, we can set the .over class and once it leaves all entered child
// elements, we can remove the .over class from this dropzone
let enterCount = 0;
function handleDragEnter(e) {
    if (enterCount != 0 && !this.classList.contains('over')) {
        // when the drag enters a new dropzone before leaving the previous one, we need a timeout to ensure 
        // the enter event for the new dropzone is handled after the leave event for the previous dropzone
        setTimeout(() => {
            enterCount++;
            this.classList.add('over');
        });
    } else {
        enterCount++;
        this.classList.add('over');
    }
}

function handleDragLeave(e) {
    enterCount--;
    if (enterCount === 0) this.classList.remove('over');
}

/**
 * This must be set to allow drops to the dropzone by overwriting browser defaults.
 */
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    return false;
}

/**
 * Here we handle when a drop actually occurs. We remove the dragSrcEl from its original parent and place it
 * in the dropzone or the data-dropzone-for element if one is specified on this dropzone
 */
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }

    if (dragSrcEl != this) {
        dragSrcEl.remove();
        if ("dropzoneFor" in this.dataset) {
            document.getElementById(this.dataset.dropzoneFor).appendChild(dragSrcEl);
        } else {
            this.appendChild(dragSrcEl);
        }
        document.querySelectorAll('.preserve-last').forEach(elem => {
            const parent = elem.parentElement;
            elem.remove();
            parent.appendChild(elem);
        });
    }

    return false;
}

// ===================== INIT EVENTS =====================
// clear user selections on mousedown so they don't interfere with dragging
function clearSelection() {
    if (window.getSelection) {window.getSelection().removeAllRanges();}
    else if (document.selection) {document.selection.empty();}
}
document.onmousedown = clearSelection;

// add event listeners to the correct elements and update items and dropzones arrays
function initDragNDrop() {
    items = document.querySelectorAll('[draggable]');
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart, false);
        item.addEventListener('dragend', handleDragEnd, false);
    });

    dropzones = document.querySelectorAll('.dropzone');
    dropzones.forEach(zone => {
        zone.addEventListener('dragenter', handleDragEnter, false);
        zone.addEventListener('dragleave', handleDragLeave, false);
        zone.addEventListener('dragover', handleDragOver, false);
        zone.addEventListener('drop', handleDrop, false)
    });
}

// DOM loads
document.addEventListener('DOMContentLoaded', e => {
    initDragNDrop();
});