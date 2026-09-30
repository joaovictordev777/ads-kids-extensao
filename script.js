const SoundManager = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),

    playTone(freq, type, duration, volume = 0.1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playSuccess() {
        this.playTone(523.25, 'sine', 0.3);
        setTimeout(() => this.playTone(659.25, 'sine', 0.4), 100);
    },

    playError() {
        this.playTone(220, 'sawtooth', 0.3);
    },

    playClick() {
        this.playTone(440, 'square', 0.1, 0.05);
    }
};

function nextScreen(screenId) {
    SoundManager.playClick();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    const screens = ['screen-start', 'screen-mission1', 'screen-mission2', 'screen-mission3', 'screen-mission4', 'screen-finish'];
    const currentIndex = screens.indexOf(screenId);
    const progressPercent = (currentIndex / (screens.length - 1)) * 100;
    document.getElementById('progress-bar').style.width = progressPercent + '%';

    if (screenId === 'screen-mission3') {
        startBugHunt();
    }
}

// --- Missão 1: Algoritmos ---
const draggables = document.querySelectorAll('.draggable');
let draggedItem = null;

draggables.forEach(item => {
    item.addEventListener('dragstart', () => {
        draggedItem = item;
        item.style.opacity = '0.5';
    });

    item.addEventListener('dragend', () => {
        draggedItem = null;
        item.style.opacity = '1';
    });

    item.addEventListener('dragover', e => e.preventDefault());

    item.addEventListener('drop', function(e) {
        e.preventDefault();
        if (this !== draggedItem) {
            let children = Array.from(document.getElementById('algo-game').children);
            let fromIdx = children.indexOf(draggedItem);
            let toIdx = children.indexOf(this);

            if (fromIdx < toIdx) {
                this.after(draggedItem);
            } else {
                this.before(draggedItem);
            }
        }
    });
});

function checkAlgo() {
    const items = document.querySelectorAll('.draggable');
    const feedback = document.getElementById('algo-feedback');
    let correct = true;

    items.forEach((item, index) => {
        if (parseInt(item.getAttribute('data-order')) !== index + 1) {
            correct = false;
        }
    });

    if (correct) {
        SoundManager.playSuccess();
        feedback.innerText = "Incrível! O robô escovou os dentes perfeitamente! ✨";
        feedback.style.color = "green";
        setTimeout(() => nextScreen('screen-mission2'), 2000);
    } else {
        SoundManager.playError();
        feedback.innerText = "Ops! A ordem está errada. Tente novamente! 😵";
        feedback.style.color = "red";
    }
}

// --- Missão 2: Programação ---
function changeMonsterColor(color) {
    const monster = document.getElementById('monster');
    monster.style.backgroundColor = color;
    monster.style.transform = "scale(1.2) rotate(10deg)";
    setTimeout(() => {
        monster.style.transform = "scale(1) rotate(0deg)";
    }, 200);
}

function runCode() {
    // Function removed as buttons were restored
}

// --- Missão 3: Bug Hunter ---
let bugsFound = 0;
const totalBugs = 5;
let bugInterval = null;

function moveBug(bug) {
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;
    bug.style.left = x + '%';
    bug.style.top = y + '%';
}

function startBugHunt() {
    const field = document.getElementById('bug-field');
    const countDisp = document.getElementById('bug-count');
    field.innerHTML = '';
    bugsFound = 0;
    countDisp.innerText = totalBugs;

    for (let i = 0; i < totalBugs; i++) {
        const bug = document.createElement('div');
        bug.className = 'bug';
        bug.innerText = '🐞';
        moveBug(bug);

        bug.onclick = () => {
            bug.style.display = 'none';
            bugsFound++;
            countDisp.innerText = totalBugs - bugsFound;
            SoundManager.playClick();
            if (bugsFound === totalBugs) {
                document.getElementById('btn-finish').style.display = 'block';
                clearInterval(bugInterval);
            }
        };
        field.appendChild(bug);
    }

    bugInterval = setInterval(() => {
        document.querySelectorAll('.bug').forEach(bug => {
            if (bug.style.display !== 'none') {
                moveBug(bug);
            }
        });
    }, 2000);
}

// --- Missão 4: Banco de Dados ---
let dbDraggedItem = null;

function setupDBGame() {
    const items = document.querySelectorAll('.db-item');
    const boxes = document.querySelectorAll('.drop-zone');

    items.forEach(item => {
        item.addEventListener('dragstart', () => {
            dbDraggedItem = item;
            item.style.opacity = '0.5';
        });
        item.addEventListener('dragend', () => {
            dbDraggedItem = null;
            item.style.opacity = '1';
        });
    });

    boxes.forEach(box => {
        box.addEventListener('dragover', e => e.preventDefault());
        box.addEventListener('drop', function(e) {
            e.preventDefault();
            if (dbDraggedItem) {
                this.appendChild(dbDraggedItem);
                SoundManager.playClick();
            }
        });
    });
}

function checkDatabase() {
    const boxes = document.querySelectorAll('.category-box');
    const feedback = document.getElementById('db-feedback');
    let allCorrect = true;
    let allPlaced = true;

    boxes.forEach(box => {
        const category = box.getAttribute('data-category');
        const items = box.querySelectorAll('.db-item');
        items.forEach(item => {
            if (item.getAttribute('data-type') !== category) {
                allCorrect = false;
            }
        });
    });

    const totalItems = 6;
    const placedItems = document.querySelectorAll('.drop-zone .db-item').length;
    if (placedItems < totalItems) {
        allPlaced = false;
    }

    if (allCorrect && allPlaced) {
        SoundManager.playSuccess();
        feedback.innerText = "Perfeito! Você organizou o banco de dados com sucesso! 🗄️";
        feedback.style.color = "green";
        setTimeout(() => nextScreen('screen-finish'), 2000);
    } else {
        SoundManager.playError();
        feedback.innerText = allPlaced ? "Alguns itens estão na categoria errada. Tente de novo! 😵" : "Coloque todos os itens nas caixas antes de verificar! 🧐";
        feedback.style.color = "red";
    }
}

// Initialize DB game
setupDBGame();
