// add new tiers
const colors = ['#ff7f7e', '#ffbf7f', '#ffdf80', '#feff7f', '#beff7f', '#7eff80', '#7fffff', '#7fbfff', '#807fff', '#ff7ffe', '#bf7fbe', '#3b3b3b', '#858585', '#cfcfcf', '#f7f7f7'];
const texts = ['S', ...[...Array(26)].map((val, i) => String.fromCharCode(i + 65))];
let tiers = 0;

function addTier() {
    const color = colors[tiers % colors.length];
    const text = texts[tiers % texts.length];
    tiers++;

    const tier = document.getElementById('tier-template').content.cloneNode(true);
    const value = tier.firstElementChild.firstElementChild;
    value.style.backgroundColor = color;

    const textContainer = value.firstElementChild;
    textContainer.textContent = text;

    const colorInput = value.lastElementChild.firstElementChild;
    colorInput.value = color;
    colorInput.addEventListener('input', e => {
        value.style.backgroundColor = colorInput.value;
    });

    document.getElementById('tiers').appendChild(tier);
    initDragNDrop();
}

document.getElementById('add-tier').addEventListener('click', e => {
    addTier();
});