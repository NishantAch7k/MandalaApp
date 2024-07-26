const canvas = document.getElementById('mandalaCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('color');
const canvasColorPicker = document.getElementById('canvasColor');
const lineWidthSlider = document.getElementById('lineWidth');
const gridSizeSelect = document.getElementById('gridSize');
const canvasSizeSelect = document.getElementById('canvasSize');
const mirrorModeBtn = document.getElementById('mirrorModeBtn');
const kaleidoscopeBtn = document.getElementById('kaleidoscopeBtn');
const rainbowModeBtn = document.getElementById('rainbowModeBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let gridSize = 25;
let symmetry = gridSize;
let mirrorMode = false;
let kaleidoscopeMode = false;
let rainbowMode = false;
let undoStack = [];
let redoStack = [];

function setCanvasSize(size) {
    canvas.width = size;
    canvas.height = size;
    drawGrid();
}

setCanvasSize(parseInt(canvasSizeSelect.value));

function setCanvasColor(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
}

function drawGrid() {
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < symmetry; i++) {
        const angle = (Math.PI * 2) / symmetry * i;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.lineTo(
            canvas.width / 2 + Math.cos(angle) * canvas.width,
            canvas.height / 2 + Math.sin(angle) * canvas.height
        );
        ctx.stroke();
    }
}

function draw(e) {
    if (!isDrawing) return;

    ctx.lineWidth = lineWidthSlider.value;
    ctx.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rainbowMode) {
        ctx.strokeStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
    } else {
        ctx.strokeStyle = colorPicker.value;
    }

    for (let i = 0; i < symmetry; i++) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((Math.PI * 2) / symmetry * i);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        if (mirrorMode || kaleidoscopeMode) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
            ctx.beginPath();
            ctx.moveTo(canvas.width - lastX, lastY);
            ctx.lineTo(canvas.width - x, y);
            ctx.stroke();
            ctx.restore();
        }

        if (kaleidoscopeMode) {
            ctx.save();
            ctx.scale(1, -1);
            ctx.translate(0, -canvas.height);
            ctx.beginPath();
            ctx.moveTo(lastX, canvas.height - lastY);
            ctx.lineTo(x, canvas.height - y);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.scale(-1, -1);
            ctx.translate(-canvas.width, -canvas.height);
            ctx.beginPath();
            ctx.moveTo(canvas.width - lastX, canvas.height - lastY);
            ctx.lineTo(canvas.width - x, canvas.height - y);
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    }

    lastX = x;
    lastY = y;
}

function saveState() {
    undoStack.push(canvas.toDataURL());
    redoStack = [];
}

function undo() {
    if (undoStack.length > 0) {
        redoStack.push(canvas.toDataURL());
        const imgData = undoStack.pop();
        const img = new Image();
        img.src = imgData;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push(canvas.toDataURL());
        const imgData = redoStack.pop();
        const img = new Image();
        img.src = imgData;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    saveState();
});

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

gridSizeSelect.addEventListener('change', () => {
    gridSize = parseInt(gridSizeSelect.value);
    symmetry = gridSize;
    setCanvasColor(canvasColorPicker.value);
});

canvasSizeSelect.addEventListener('change', () => {
    setCanvasSize(parseInt(canvasSizeSelect.value));
    setCanvasColor(canvasColorPicker.value);
});

canvasColorPicker.addEventListener('change', () => {
    setCanvasColor(canvasColorPicker.value);
});

mirrorModeBtn.addEventListener('click', () => {
    mirrorMode = !mirrorMode;
    mirrorModeBtn.classList.toggle('bg-cyan-600');
});

kaleidoscopeBtn.addEventListener('click', () => {
    kaleidoscopeMode = !kaleidoscopeMode;
    kaleidoscopeBtn.classList.toggle('bg-cyan-600');
});

rainbowModeBtn.addEventListener('click', () => {
    rainbowMode = !rainbowMode;
    rainbowModeBtn.classList.toggle('bg-cyan-600');
});

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

clearBtn.addEventListener('click', () => {
    saveState();
    setCanvasColor(canvasColorPicker.value);
});

downloadBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'mandala_masterpiece.png';
    link.href = dataURL;
    link.click();
});

setCanvasColor(canvasColorPicker.value);