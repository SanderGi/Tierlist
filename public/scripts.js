document.addEventListener('DOMContentLoaded', (event) => {
    let dragSrcEl = null;
    
    function handleDragStart(e) {
        this.style.opacity = '0.4';
    
        dragSrcEl = this;
    }
    
    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
    
        return false;
    }
    
    let enterCount = 0;
    function handleDragEnter(e) {
        enterCount++;
        this.classList.add('over');
    }
    
    function handleDragLeave(e) {
        enterCount--;
        if (enterCount === 0) this.classList.remove('over');
    }
    
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
        }
    
        return false;
    }
    
    function handleDragEnd(e) {
        this.style.opacity = '1';
        
        enterCount = 0;
        dropzones.forEach(zone => {
            zone.classList.remove('over');
        });
    }
    
    const items = document.querySelectorAll('[draggable]');
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart, false);
        item.addEventListener('dragend', handleDragEnd, false);
    });

    const dropzones = [...document.getElementsByClassName('dropzone')];
    dropzones.forEach(zone => {
        zone.addEventListener('dragenter', handleDragEnter, false);
        zone.addEventListener('dragleave', handleDragLeave, false);
        zone.addEventListener('dragover', handleDragOver, false);
        zone.addEventListener('drop', handleDrop, false)
    });
});