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