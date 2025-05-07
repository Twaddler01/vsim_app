const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#222',
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

let cam, pannerBounds, pannerGraphics, viewBoxGraphics;
let isPanning = false;
let uiElements;

const worldW = 1600; // 1600
const worldH = 1200; // 1200

function preload() {
    this.load.image('grid', '../assets/images/debug-grid-1920x1920.png');
}

function create() {
    cam = this.cameras.main;

    cam.setBounds(0, 0, worldW, worldH);
    cam.centerOn(worldW / 2, worldH / 2);

    // Red world border
    const border = this.add.graphics();
    border.lineStyle(4, 0xff0000, 1);
    border.strokeRect(0, 0, worldW, worldH);

    // Add a test square at bottom right to confirm full panning
    const testBox = this.add.rectangle(worldW - 100, worldH - 100, 100, 100, 0xffffff).setOrigin(0);
    const testBox2 = this.add.rectangle(50, 50, 100, 100, 0xffffff).setOrigin(0);

    // Panner setup
    const pW = 200, pH = 150;
    const pX = config.width - pW - 10;
    const pY = config.height - pH - 10;
    pannerBounds = { x: pX, y: pY, width: pW, height: pH };

    uiElements = this.add.group();

    pannerGraphics = this.add.graphics().setScrollFactor(0);
    viewBoxGraphics = this.add.graphics().setScrollFactor(0);
    uiElements.addMultiple([pannerGraphics, viewBoxGraphics]);

    const btnStyle = { fontSize: '16px', color: '#fff', backgroundColor: '#000', padding: 5 };

    function applyZoom(newZoom) {
        cam.setZoom(Phaser.Math.Clamp(newZoom, 0.2, 6)); // last value 3

        updateScrollBounds(); // replace hard setBounds
        updateCameraBounds(); // enforce clamp right after zoom
    }

    const zoomInBtn = this.add.text(pX - 70, pY, 'Zoom +', btnStyle)
        .setInteractive()
        .on('pointerdown', () => applyZoom(cam.zoom + 0.1))
        .setScrollFactor(0);
    
    const zoomOutBtn = this.add.text(pX - 70, pY + 30, 'Zoom -', btnStyle)
        .setInteractive()
        .on('pointerdown', () => applyZoom(cam.zoom - 0.1))
        .setScrollFactor(0);
    
    const centerBtn = this.add.text(pX - 70, pY + 60, 'Center', btnStyle)
        .setInteractive()
        .on('pointerdown', () => {
            cam.centerOn(worldW / 2, worldH / 2);
            applyZoom(cam.zoom); // recalibrate bounds
        })
        .setScrollFactor(0);

    uiElements.addMultiple([zoomInBtn, zoomOutBtn, centerBtn]);

    const uiCam = this.cameras.add(0, 0, config.width, config.height);
    uiCam.setScroll(0, 0);
    uiCam.ignore([border, testBox, testBox2]);
    cam.ignore(uiElements.getChildren());

    this.input.on('pointerdown', pointer => {
        if (isInsidePanner(pointer)) {
            isPanning = true;
            updateCameraFromPointer(pointer);
        }
    });

    this.input.on('pointermove', pointer => {
        if (isPanning) {
            updateCameraFromPointer(pointer);
        }
    });

    this.input.on('pointerup', () => {
        isPanning = false;
    });
}

function update() {
    updatePannerBackground();
    updatePannerViewBox();
    updateCameraBounds();
}

function isInsidePanner(pointer) {
    const { x, y, width, height } = pannerBounds;
    return pointer.x >= x && pointer.x <= x + width && pointer.y >= y && pointer.y <= y + height;
}

function updateCameraFromPointer(pointer) {
    const { x, y, width, height } = pannerBounds;
    const relX = (pointer.x - x) / width;
    const relY = (pointer.y - y) / height;

    const viewW = cam.width / cam.zoom;
    const viewH = cam.height / cam.zoom;

    const maxScrollX = worldW - viewW;
    const maxScrollY = worldH - viewH;

    const scrollX = Phaser.Math.Clamp(relX * worldW - viewW / 2, -viewW / 2, maxScrollX);
    const scrollY = Phaser.Math.Clamp(relY * worldH - viewH / 2, -viewH / 2, maxScrollY);

    cam.setScroll(scrollX, scrollY);
}

function updatePannerBackground() {
    const { x, y, width, height } = pannerBounds;
    pannerGraphics.clear();
    pannerGraphics.fillStyle(0x000000, 0.4);
    pannerGraphics.fillRect(x, y, width, height);
    pannerGraphics.lineStyle(2, 0xffffff, 1);
    pannerGraphics.strokeRect(x, y, width, height);
}

function updatePannerViewBox() {
    const { x: pX, y: pY, width: pW, height: pH } = pannerBounds;

    // The actual visible camera size in world units
    const visibleW = cam.width / cam.zoom;
    const visibleH = cam.height / cam.zoom;

    // Clamp total scroll range so we don't overshoot when zoomed
    const maxScrollX = worldW - visibleW;
    const maxScrollY = worldH - visibleH;

    // Normalize scroll to [0, 1] based on world size
    const normX = Phaser.Math.Clamp(cam.scrollX / maxScrollX, 0, 1);
    const normY = Phaser.Math.Clamp(cam.scrollY / maxScrollY, 0, 1);

    // Map to mini-map size
    const viewX = pX + normX * (pW - (visibleW * (pW / worldW)));
    const viewY = pY + normY * (pH - (visibleH * (pH / worldH)));

    const viewW = visibleW * (pW / worldW);
    const viewH = visibleH * (pH / worldH);

    viewBoxGraphics.clear();
    viewBoxGraphics.fillStyle(0xffffff, 0.4);
    viewBoxGraphics.fillRect(viewX, viewY, viewW, viewH);
    viewBoxGraphics.lineStyle(1, 0xffffff);
    viewBoxGraphics.strokeRect(viewX, viewY, viewW, viewH);
}

function updateCameraBounds() {
    const zoom = cam.zoom;
    const viewW = cam.width / zoom;
    const viewH = cam.height / zoom;

    const maxScrollX = Math.max(0, worldW - viewW);
    const maxScrollY = Math.max(0, worldH - viewH);

    cam.scrollX = Phaser.Math.Clamp(cam.scrollX, -viewW / 2, maxScrollX);
    cam.scrollY = Phaser.Math.Clamp(cam.scrollY, -viewH / 2, maxScrollY);
}

function updateScrollBounds() {
    const visibleW = cam.width / cam.zoom;
    const visibleH = cam.height / cam.zoom;

    const extraW = Math.max(0, visibleW - worldW);
    const extraH = Math.max(0, visibleH - worldH);

    cam.setBounds(
        -extraW / 2, // allow scrolling past 0,0
        -extraH / 2,
        worldW + extraW,
        worldH + extraH
    );
}


/*
import MainScene from "./MainScene.js";

// Override console.log, console.warn, and console.error for exporting into a file
function logExport() {
    var logs = [];
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    console.log = function (message) {
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }
        logs.push(`LOG: ${message}`);
        originalConsoleLog(message);
    };

    console.warn = function (message) {
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }
        logs.push(`WARNING: ${message}`);
        originalConsoleWarn(message);
    };

    console.error = function (message) {
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }
        logs.push(`ERROR: ${message}`);
        originalConsoleError(message);
    };

    let exportButton = document.createElement('button');
    exportButton.id = 'exportButton';
    exportButton.innerHTML = 'Export Logs';
    document.getElementById('debugButtons').appendChild(exportButton);

    exportButton.addEventListener("click", function () {
        // Save logs to a file
        let logString = logs.join('\n');

        // Create a Blob containing the text data
        const blob = new Blob([logString], { type: 'text/plain' });

        // Create a download link
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'logs.txt';

        // Append the link to the document
        document.getElementById('debugButtons').appendChild(link);

        // Trigger the download
        link.click();

        // Remove the link from the document
        document.getElementById('debugButtons').removeChild(link);
    });
}

// Allow exporting of HTML to inspect/debug elements
function htmlExport() {
    // Create the "Export HTML" button
    const exportHTMLButton = document.createElement('button');
    exportHTMLButton.id = 'exportHTMLButton';
    exportHTMLButton.textContent = 'Export HTML';
    
    // Append the button to the document body
    document.body.appendChild(exportHTMLButton);
    
    // Add an event listener to the "Export HTML" button
    exportHTMLButton.addEventListener("click", function () {
        // Get the HTML content of the entire document
        let htmlContent = document.documentElement.outerHTML;
    
        // Create a Blob containing the HTML content
        const blob = new Blob([htmlContent], { type: 'text/html' });
    
        // Create a download link
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'page.html';
    
        // Append the link to the document
        document.getElementById('debugButtons').appendChild(link);
    
        // Trigger the download
        link.click();
    
        // Remove the link from the document
        document.getElementById('debugButtons').removeChild(link);
    });
}

// DEBUGGING FUNCTIONS
logExport();
htmlExport();

// PHASER START
const MAX_WIDTH = 1280; // Max width for mobile portrait
const MAX_HEIGHT = 1920; // Max height for mobile portrait
const ASPECT_RATIO = 3 / 2; // Portrait aspect ratio (adjust as needed)

function getGameSize() {
    let width = Math.min(window.innerWidth, MAX_WIDTH); // Ensure the width is portrait-friendly
    let height = Math.min(window.innerHeight, width * ASPECT_RATIO); // Maintain aspect ratio

    return { width, height };
}

const { width, height } = getGameSize();

const config = {
    type: Phaser.AUTO,
    scene: [MainScene],
    scale: {
        mode: Phaser.Scale.FIT, // FIT is good for preserving aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game
        width: width,
        height: height,
        min: {
            width: 320, // Minimum width for small devices
            height: 480 // Minimum height for portrait screens
        },
        max: {
            width: MAX_WIDTH, // Maximum width
            height: MAX_HEIGHT // Maximum height (portrait-optimized)
        }
    }
};

const game = new Phaser.Game(config);

// Optional resize handler (may not be necessary if using Phaser's FIT mode)
window.addEventListener("resize", () => {
    const { width, height } = getGameSize();
    game.scale.resize(width, height);
});

function setGameSize(w, h) {
    game.scale.resize(w, h);
    game.canvas.style.width = `${w}px`;
    game.canvas.style.height = `${h}px`;
}
*/