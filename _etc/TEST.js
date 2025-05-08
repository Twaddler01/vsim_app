import ActionBox from '../classes/ActionBox.js';
import ActionBoxList from '../classes/ActionBoxList.js';
import CatBox from '../classes/CatBox.js';

// Setup unload listener
window.addEventListener('beforeunload', () => {
    //
});

const UI_STYLES = {
    // Box Colors
    titleBoxColor: 0x0000FF,
    mainBoxColor: 0x34495e,
    // Text Colors and Font Sizes
    textColor: "#ffffff",
    fontSizeLarge: "24px",
    fontSizeMedium: "20px",
    fontSizeSmall: "18px",
    // Button Color
    buttonColor: 0xe74c3c,
    // Optional: Background Color
    backgroundColor: 0x34495e,
};

let pannerBounds, pannerGraphics, viewBoxGraphics;
let isPanning = false;

const worldW = 1600; // 1600
const worldH = 1200; // 1200

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        // Globals
        //
    }

applyZoom(newZoom) {
    this.cam.setZoom(Phaser.Math.Clamp(newZoom, 0.2, 6)); // last value 3

    this.updateScrollBounds(); // replace hard setBounds
    this.updateCameraBounds(); // enforce clamp right after zoom
}

    preload() {
        //
    }

    update() {
this.updatePannerBackground();
this.updatePannerViewBox();
this.updateCameraBounds();
        // OLD PANNER
        //this.updatePannerViewport();
    }

    create() {
        // Button debug action
        document.getElementById('tempAction').addEventListener("click", () => {
           for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                console.log(`${key}: ${value}`);
            }
        });

        const width = this.game.config.width;
        const height = this.game.config.height;


this.uiElements = this.add.group();
this.worldElements = this.add.group();

this.cam = this.cameras.main;
this.cam.setBounds(0, 0, worldW, worldH);
this.cam.centerOn(worldW / 2, worldH / 2);

// Panner setup
const pW = 200, pH = 150;
const pX = width - pW - 10;
const pY = height - pH - 10;
pannerBounds = { x: pX, y: pY, width: pW, height: pH };

pannerGraphics = this.add.graphics().setScrollFactor(0);
viewBoxGraphics = this.add.graphics().setScrollFactor(0);
this.uiElements.addMultiple([pannerGraphics, viewBoxGraphics]);

const btnStyle = { fontSize: '16px', color: '#fff', backgroundColor: '#000', padding: 5 };

const zoomInBtn = this.add.text(pX - 70, pY, 'Zoom +', btnStyle)
    .setInteractive()
    .on('pointerdown', () => this.applyZoom(this.cam.zoom + 0.1))
    .setScrollFactor(0);

const zoomOutBtn = this.add.text(pX - 70, pY + 30, 'Zoom -', btnStyle)
    .setInteractive()
    .on('pointerdown', () => this.applyZoom(this.cam.zoom - 0.1))
    .setScrollFactor(0);

const centerBtn = this.add.text(pX - 70, pY + 60, 'Center', btnStyle)
    .setInteractive()
    .on('pointerdown', () => {
        this.cam.centerOn(worldW / 2, worldH / 2);
        this.applyZoom(this.cam.zoom); // recalibrate bounds
    })
    .setScrollFactor(0);

this.uiElements.addMultiple([zoomInBtn, zoomOutBtn, centerBtn]);

// World camera
this.uiCam = this.cameras.add(0, 0, width, height);
this.uiCam.setScroll(0, 0);
this.worldElements.setDepth(1); // Always on bottom
this.uiElements.setDepth(10000); // Always on top

this.uiCam.ignore(this.worldElements.getChildren());
this.cam.ignore(this.uiElements.getChildren());



this.input.on('pointerdown', pointer => {
    if (this.isInsidePanner(pointer)) {
        isPanning = true;
        this.updateCameraFromPointer(pointer);
    }
});

this.input.on('pointermove', pointer => {
    if (isPanning) {
        this.updateCameraFromPointer(pointer);
    }
});

this.input.on('pointerup', () => {
    isPanning = false;
});

// Add helper functions directly to the scene instance
this.addToWorld = (objs) => {
    const items = Array.isArray(objs) ? objs : [objs];
    items.forEach(obj => {
        this.worldElements.add(obj);
        this.uiCam.ignore(obj); // prevent UI cam from rendering world
        this.cam.ignore(this.uiElements.getChildren());
    });
};

        this.createUI();
    }

    createUI() {
        // Setting up the main UI components
        
        // CANVAS BACKGROUND BOX
        const width = this.game.config.width;
        const height = this.game.config.height;
        // Game area rectangle
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x808080, 1); // Gray color
        this.graphics.fillRect(0, 0, width, height);
        this.graphics.setDepth(-1); // -1 ensures it's behind other game elements
        this.addToWorld(this.graphics);

        // *** LAYOUT AREAS
        // Gather
        const gatherArea = this.addGatherBox();
        
        // Inventory
        this.catbox = new CatBox(this, this.gatherBoxWidth + 20, 10, 400, 600, { title: "Inventory" });
        
        // Load layout data
        loadLayoutFromJson(gatherArea, 'gather', this.catbox);
    
        // DEBUG
        this.debugContainer = this.add.container(500, 500);
        //this.addToWorld(this.debugContainer);
        this.debugUI(gatherArea);
    }

    // DEBUG BUTTONS
    debugUI(boxList) {
        const debug1 = this.addTextButton(0, 0, 'Add test_3 Box', () => {
            //
            // flag true
                const box = boxList.activateBox('test_3', this.catbox);
                if (box) {
                    console.log('Box "test_3" activated.');
                } else {
                    console.warn('Box "test_3" could not be activated.');
                }
            //
        });
    
        const debug2 = this.addTextButton(0, 30, 'Remove test_3 Box', () => {
            //
            boxList.removeBoxById("test_3");
            //
        });

        const debug3 = this.addTextButton(0, 60, 'Update Box', () => {
            //
            boxList.updateBoxById('pebbles', (box) => {
                box.gain = 2;
            });
            //
        });

        const debug4 = this.addTextButton(0, 120, 'Save', () => {
            //
                saveGame(boxList);
            //
        });
        
        const debug5 = this.addTextButton(0, 150, 'Load', () => {
            //
                loadGame(boxList);
            //
        });
        
        this.addToWorld([debug1, debug2, debug3, debug4, debug5]);
    }
    
    // DEBUG
    addTextButton(x, y, label, callback) {
        const btn = this.add.text(x, y, label, {
            fontSize: '18px',
            backgroundColor: '#222',
            color: '#fff',
            padding: { x: 10, y: 5 },
        }).setInteractive();
    
        btn.on('pointerdown', callback);
        this.debugContainer.add(btn); // optional: add button to container
        return btn;
    }
    // Usage
    //this.debugContainer = this.add.container(100, 100);
    //this.debugUI(); 

    addGatherBox() {
        // *** gatherBox
        const gatherBoxX = 0;
        const gatherBoxY = 0;
        const gatherBoxWidth = 400;
        const gatherBoxHeight = 600; //// /12
        this.gatherBoxWidth = gatherBoxWidth;

        // Create the container to group the box and its contents
        const gatherContainer = this.add.container(10, 10); // Top-left position
        this.addToWorld(gatherContainer);
        
        // Box background
        const gatherBoxRect = this.add.rectangle(gatherBoxX, gatherBoxY, gatherBoxWidth, gatherBoxHeight, UI_STYLES.mainBoxColor)
            .setOrigin(0);
        gatherBoxRect.setStrokeStyle(2, 0xffffff);
        
        // Box title
        const gatherBoxRectTitle = this.add.rectangle(gatherBoxRect.x, gatherBoxRect.y, gatherBoxWidth, gatherBoxHeight / 12, UI_STYLES.titleBoxColor)
            .setOrigin(0);
        gatherBoxRectTitle.setStrokeStyle(2, 0xffffff);
        // Space of title area
        this.gatherBoxRectTitleSpace = gatherBoxHeight / 12 + 4; // Add border
        
        // Title text centered at the top
        const titleText = this.add.text(
            gatherBoxWidth / 2, 15, // X centered, Y a bit down from top
            "Gather Area",
            {
                fontSize: UI_STYLES.fontSizeLarge,
                color: UI_STYLES.textColor,
                align: 'center'
            }
        ).setOrigin(0.5, 0); // Center X, top Y
        
        // Add everything to container
        gatherContainer.add([gatherBoxRect, gatherBoxRectTitle, titleText]);
        
        // Add boxes to gatherBox
        const gatherBarStackX = gatherBoxX + 2;
        const gatherBarStackY = gatherBoxHeight / 12 + 2;
        const gatherBarStackW = gatherBoxWidth - 4;
        this.startY = gatherBarStackY;
        
        const boxList = new ActionBoxList(this, gatherContainer, gatherBarStackX, gatherBarStackY, gatherBarStackW, 6);
        // *** END gatherBox
        return boxList;
    }

// PANNER FUNCTIONS
isInsidePanner(pointer) {
    const { x, y, width, height } = pannerBounds;
    return pointer.x >= x && pointer.x <= x + width && pointer.y >= y && pointer.y <= y + height;
}

updateCameraFromPointer(pointer) {
    const { x, y, width, height } = pannerBounds;
    const relX = (pointer.x - x) / width;
    const relY = (pointer.y - y) / height;

    const viewW = this.cam.width / this.cam.zoom;
    const viewH = this.cam.height / this.cam.zoom;

    const maxScrollX = worldW - viewW;
    const maxScrollY = worldH - viewH;

    const scrollX = Phaser.Math.Clamp(relX * worldW - viewW / 2, -viewW / 2, maxScrollX);
    const scrollY = Phaser.Math.Clamp(relY * worldH - viewH / 2, -viewH / 2, maxScrollY);

    this.cam.setScroll(scrollX, scrollY);
}

updatePannerBackground() {
    const { x, y, width, height } = pannerBounds;
    pannerGraphics.clear();
    pannerGraphics.fillStyle(0x000000, 0.4);
    pannerGraphics.fillRect(x, y, width, height);
    pannerGraphics.lineStyle(2, 0xffffff, 1);
    pannerGraphics.strokeRect(x, y, width, height);
}

updatePannerViewBox() {
    const { x: pX, y: pY, width: pW, height: pH } = pannerBounds;

    // The actual visible camera size in world units
    const visibleW = this.cam.width / this.cam.zoom;
    const visibleH = this.cam.height / this.cam.zoom;

    // Clamp total scroll range so we don't overshoot when zoomed
    const maxScrollX = worldW - visibleW;
    const maxScrollY = worldH - visibleH;

    // Normalize scroll to [0, 1] based on world size
    const normX = Phaser.Math.Clamp(this.cam.scrollX / maxScrollX, 0, 1);
    const normY = Phaser.Math.Clamp(this.cam.scrollY / maxScrollY, 0, 1);

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

updateCameraBounds() {
    const zoom = this.cam.zoom;
    const viewW = this.cam.width / zoom;
    const viewH = this.cam.height / zoom;

    const maxScrollX = Math.max(0, worldW - viewW);
    const maxScrollY = Math.max(0, worldH - viewH);

    this.cam.scrollX = Phaser.Math.Clamp(this.cam.scrollX, -viewW / 2, maxScrollX);
    this.cam.scrollY = Phaser.Math.Clamp(this.cam.scrollY, -viewH / 2, maxScrollY);
}

updateScrollBounds() {
    const visibleW = this.cam.width / this.cam.zoom;
    const visibleH = this.cam.height / this.cam.zoom;

    const extraW = Math.max(0, visibleW - worldW);
    const extraH = Math.max(0, visibleH - worldH);

    this.cam.setBounds(
        -extraW / 2, // allow scrolling past 0,0
        -extraH / 2,
        worldW + extraW,
        worldH + extraH
    );
}

} // MainScene

// FUNCTIONS
async function loadLayoutFromJson(object, section, addedObject) {
    const response = await fetch('assets/data/layout.json');
    const data = await response.json();
    const loadedData = data[section] || [];

    // Save config list to object for access in activateBox
    object.boxConfigs = loadedData;

    // Load save data from localStorage
    const saveData = JSON.parse(localStorage.getItem('gameState')) || [];

    loadedData.forEach(jsonBox => {
        const saveBox = saveData.find(save => save.id === jsonBox.id);
        const isActive = jsonBox.active || (saveBox && saveBox.active);

        if (isActive) {
            const box = object.activateBox(jsonBox.id, addedObject);

            if (box && saveBox) {
                // Apply save state (like gain/count) to the box
                box.gain = saveBox.gain ?? box.gain;
                box.count = saveBox.count ?? box.count;
            }
        }
    });
}
// USAGE
//const boxList = new ActionBoxList(this, someContainer, 0, 0, 400);
//loadLayoutFromJson(boxList, 'gather');

export function saveGame(object) {
    const data = [];

    object.boxes.forEach(({ box }) => {
        data.push({
            active: box.active,
            id: box.id,
            gain: box.gain,
            count: box.count || 0, // default to 0 if undefined
        });
    });

    localStorage.setItem('gameState', JSON.stringify(data));
    console.log('Saved:' + localStorage.getItem('gameState'));
}

export function loadGame(object) {
    const data = JSON.parse(localStorage.getItem('gameState'));
    if (!data) return;

    data.forEach(({ id, gain, count }) => {
        object.updateBoxById(id, (box) => {
            box.gain = gain;
            box.count = count;
        });
    });
}

// Export default MainScene;
export default MainScene;