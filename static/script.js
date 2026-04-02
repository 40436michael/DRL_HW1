let n = 5;

let startCell = [0, 0];
let endCell = [4, 4];
let blockCells = [[1, 1], [2, 2], [3, 3]];

let currentMode = 'setStart'; // 'setStart', 'setEnd', 'toggleBlock'

const gridContainer = document.getElementById('grid-container');
const gridInput = document.getElementById('grid-size-input');
const sizeLabel = document.getElementById('size-label');
const sizeLabel2 = document.getElementById('size-label2');
const obsCountLabel = document.getElementById('obs-count');
const obsMaxLabel = document.getElementById('obs-max');

// Arrow mappings
const arrowIcons = {
    'Up': '<i class="fa-solid fa-arrow-up"></i>',
    'Down': '<i class="fa-solid fa-arrow-down"></i>',
    'Left': '<i class="fa-solid fa-arrow-left"></i>',
    'Right': '<i class="fa-solid fa-arrow-right"></i>'
};

function updateObstacleUI() {
    obsCountLabel.innerText = blockCells.length;
    obsMaxLabel.innerText = Math.max(0, n - 2);
}

function initGrid() {
    gridContainer.innerHTML = '';
    
    // adjust grid CSS layout dynamically based on n
    gridContainer.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${n}, 1fr)`;
    
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.r = r;
            cell.dataset.c = c;

            const valSpan = document.createElement('div');
            valSpan.className = 'cell-value';

            const iconSpan = document.createElement('div');
            iconSpan.className = 'cell-icon';

            cell.appendChild(valSpan);
            cell.appendChild(iconSpan);

            cell.addEventListener('click', () => handleCellClick(r, c));
            gridContainer.appendChild(cell);
        }
    }
    updateGridVisuals();
    updateObstacleUI();
}

function getBlockMax() {
    return Math.max(0, n - 2);
}

function handleCellClick(r, c) {
    if (currentMode === 'setStart') {
        if (!isSameCell([r, c], endCell) && !isBlock([r, c])) {
            startCell = [r, c];
        }
    } else if (currentMode === 'setEnd') {
        if (!isSameCell([r, c], startCell) && !isBlock([r, c])) {
            endCell = [r, c];
        }
    } else if (currentMode === 'toggleBlock') {
        if (!isSameCell([r, c], startCell) && !isSameCell([r, c], endCell)) {
            const idx = getBlockIndex([r, c]);
            if (idx > -1) {
                // remove
                blockCells.splice(idx, 1);
            } else {
                // strict obstacle limit n-2
                if (blockCells.length < getBlockMax()) {
                    blockCells.push([r, c]);
                } else {
                    alert(`You can only set up to ${getBlockMax()} obstacles for a ${n}x${n} grid.`);
                }
            }
        }
    }

    clearValuesAndPolicy();
    updateGridVisuals();
    updateObstacleUI();
}

function isSameCell(c1, c2) {
    if (!c1 || !c2) return false;
    return c1[0] === c2[0] && c1[1] === c2[1];
}

function isBlock(cell) {
    return getBlockIndex(cell) > -1;
}

function getBlockIndex(cell) {
    return blockCells.findIndex(b => b[0] === cell[0] && b[1] === cell[1]);
}

function clearValuesAndPolicy() {
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const cellElem = getCellElement(r, c);
            cellElem.querySelector('.cell-value').innerText = '';
            const iconWrap = cellElem.querySelector('.cell-icon');
            iconWrap.innerHTML = '';
            iconWrap.classList.remove('animate-pop');
        }
    }
}

function updateGridVisuals() {
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const cellElem = getCellElement(r, c);
            cellElem.className = 'cell'; // reset classes

            if (isSameCell([r, c], startCell)) {
                cellElem.classList.add('start');
                cellElem.querySelector('.cell-icon').innerHTML = '<i class="fa-solid fa-play"></i>';
            } else if (isSameCell([r, c], endCell)) {
                cellElem.classList.add('end');
                cellElem.querySelector('.cell-icon').innerHTML = '<i class="fa-solid fa-flag-checkered"></i>';
            } else if (isBlock([r, c])) {
                cellElem.classList.add('block');
                cellElem.querySelector('.cell-icon').innerHTML = '<i class="fa-solid fa-ban"></i>';
            }
        }
    }
}

function getCellElement(r, c) {
    return gridContainer.children[r * n + c];
}

// Controls
gridInput.addEventListener('input', (e) => {
    n = parseInt(e.target.value);
    sizeLabel.innerText = n;
    sizeLabel2.innerText = n;
    
    // Bounds check elements that fall out of new bounds
    if (startCell[0] >= n || startCell[1] >= n) startCell = [0, 0];
    if (endCell[0] >= n || endCell[1] >= n) endCell = [n-1, n-1];
    if (isSameCell(startCell, endCell)) {
        if(n > 1) endCell = [n-1, n-1];
    }
    
    // Remove out-of-bounds obstacles
    blockCells = blockCells.filter(b => b[0] < n && b[1] < n);
    // Enforce array size max n-2
    while(blockCells.length > getBlockMax()) {
        blockCells.pop();
    }
    
    initGrid();
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentMode = e.target.dataset.mode;
    });
});

document.getElementById('btnReset').addEventListener('click', () => {
    startCell = [0, 0];
    endCell = [n-1, n-1];
    blockCells = [];
    
    // Auto setup initial case if n=5
    if (n === 5) {
        blockCells = [[1, 1], [2, 2], [3, 3]];
    }
    
    clearValuesAndPolicy();
    updateGridVisuals();
    updateObstacleUI();
});

document.getElementById('btnRandom').addEventListener('click', async () => {
    try {
        const response = await fetch('/evaluate_random_policy', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                n: n,
                start: startCell,
                end: endCell,
                blocks: blockCells
            })
        });

        const data = await response.json();
        
        clearValuesAndPolicy();
        updateGridVisuals();

        // Reveal values and policy
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (isBlock([r, c])) continue;

                const cellElem = getCellElement(r, c);
                const valElem = cellElem.querySelector('.cell-value');
                const iconElem = cellElem.querySelector('.cell-icon');

                valElem.innerText = data.values[r][c].toFixed(2);

                if (data.policy[r][c]) {
                    iconElem.innerHTML = arrowIcons[data.policy[r][c]];
                } else if (isSameCell([r, c], endCell)) {
                    iconElem.innerHTML = '<i class="fa-solid fa-flag-checkered"></i>';
                }

                // Staggered Animation
                setTimeout(() => {
                    valElem.classList.remove('animate-pop');
                    iconElem.classList.remove('animate-pop');
                    void valElem.offsetWidth;
                    valElem.classList.add('animate-pop');
                    iconElem.classList.add('animate-pop');
                }, (r * n + c) * 30);
            }
        }
    } catch(err) {
        alert("Make sure python backend is running.");
    }
});

document.getElementById('btnValueIter').addEventListener('click', async () => {
    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                n: n,
                start: startCell,
                end: endCell,
                blocks: blockCells
            })
        });

        const data = await response.json();

        clearValuesAndPolicy();
        updateGridVisuals();

        let currTime = 0;
        // Display results
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (isBlock([r, c])) continue;

                const cellElem = getCellElement(r, c);
                const valElem = cellElem.querySelector('.cell-value');
                const iconElem = cellElem.querySelector('.cell-icon');

                // Format value
                valElem.innerText = data.values[r][c].toFixed(2);

                if (data.policy[r][c]) {
                    iconElem.innerHTML = arrowIcons[data.policy[r][c]];
                } else if (isSameCell([r, c], endCell)) {
                    iconElem.innerHTML = '<i class="fa-solid fa-flag-checkered"></i>';
                }

                // Animation
                setTimeout(() => {
                    valElem.classList.remove('animate-pop');
                    iconElem.classList.remove('animate-pop');
                    void valElem.offsetWidth;
                    valElem.classList.add('animate-pop');
                    iconElem.classList.add('animate-pop');
                }, (r * n + c) * 30);

                currTime = Math.max(currTime, (r * n + c) * 30);
            }
        }

        // Highlight optimal path
        setTimeout(() => {
            highlightPath(data.policy);
        }, currTime + 300);

    } catch (err) {
        console.error("Failed to run value iteration", err);
        alert("Server error running value iteration. Make sure the python backend is running.");
    }
});

function highlightPath(policy) {
    let curr = [startCell[0], startCell[1]];
    let visited = new Set();
    let delay = 0;

    while (!isSameCell(curr, endCell)) {
        let r = curr[0];
        let c = curr[1];
        let stateKey = `${r},${c}`;

        if (visited.has(stateKey) || isBlock(curr)) {
            break;
        }
        visited.add(stateKey);

        const cellElem = getCellElement(r, c);
        if (!isSameCell(curr, startCell)) {
            setTimeout(() => {
                cellElem.classList.add('path');
            }, delay);
            delay += 100;
        }

        let act = policy[r][c];
        if (!act) break;

        if (act === 'Up') curr = [r - 1, c];
        else if (act === 'Down') curr = [r + 1, c];
        else if (act === 'Left') curr = [r, c - 1];
        else if (act === 'Right') curr = [r, c + 1];
        else break;

        if (curr[0] < 0) curr[0] = 0;
        if (curr[0] >= n) curr[0] = n - 1;
        if (curr[1] < 0) curr[1] = 0;
        if (curr[1] >= n) curr[1] = n - 1;
    }
}

// Initialize on load
initGrid();
