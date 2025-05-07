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

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        // Globals
        //
    }

    preload() {
        //
    }

    update() {
        this.updatePannerViewport();
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
    
        // Set world bounds to 30% larger
        this.worldWidth = width * 1.3;
        this.worldHeight = height * 1.3;
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

        // Optional: visualize the extended area
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x808080, 1);
        this.graphics.fillRect(0, 0, this.worldWidth, this.worldHeight);
        this.graphics.setDepth(-1);
        
// === Step 1: Create a UI layer ===
this.uiLayer = this.add.layer();
this.uiLayer.setDepth(10000); // Always on top

// === Step 2: Create a second camera for UI ===
const uiCam = this.cameras.add(0, 0, width, height);
uiCam.setScroll(0, 0);
uiCam.ignore([this.graphics]); // Ignore background/world elements
this.cameras.main.ignore(this.uiLayer); // Main camera ignores UI

// === Step 3: Build your UI into the UI layer ===
this.createMiniPanner();
this.createZoomButtons();

/*
        // Enable camera drag for panning
        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartX = pointer.x;
            this.dragStartY = pointer.y;
        });
    
        this.input.on('pointerup', () => {
            this.isDragging = false;
        });
*/
        // Start here
        //this.isPointerInGatherContainer = false;
        //this.input.addPointer(2); // Enable multi-touch
        this.createUI();
        ////new
//this.createMiniPanner();
//this.createZoomButtons();

        // ZOOM
        /*
        const canvasWidth = this.scale.width;
        const canvasHeight = this.scale.height;
        
        // Calculate min zoom that fits the entire extended world in view
        this.minZoom = Math.max(
            canvasWidth / this.worldWidth,
            canvasHeight / this.worldHeight
        );
        
        // Set initial zoom state
        this.cameraZoom = 1;
        this.pinchStartDistance = null;
        this.cameras.main.setZoom(this.cameraZoom);

        this.input.on('pointermove', (pointer) => {
            // Ignore all camera interaction if touch started in gatherContainer
            if (this.isPointerInGatherContainer) return;
        
            const pointers = this.input.manager.pointers.filter(p => p.isDown);
        
            // Handle pinch zoom
            if (pointers.length === 2) {
                const [p1, p2] = pointers;
                const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        
                if (this.pinchStartDistance === null) {
                    this.pinchStartDistance = dist;
                } else {
                    const delta = dist - this.pinchStartDistance;
                    this.pinchStartDistance = dist;
        
                    const zoomFactor = 1 + delta * 0.00125; // 0025
                    this.cameraZoom = Phaser.Math.Clamp(this.cameraZoom * zoomFactor, this.minZoom, 5);
                    this.cameras.main.setZoom(this.cameraZoom);
                }
            } 
            // Handle drag-to-pan
            else if (pointers.length === 1 && pointer.isDown) {
                const dragSpeed = 0.25 / this.cameraZoom; // 1
                this.cameras.main.scrollX -= pointer.velocity.x * dragSpeed;
                this.cameras.main.scrollY -= pointer.velocity.y * dragSpeed;
                this.pinchStartDistance = null; // cancel zoom state
            } 
            else {
                this.pinchStartDistance = null;
            }
        });
*/
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

        // *** LAYOUT AREAS
        // Gather
        const gatherArea = this.addGatherBox();
        
        // Inventory
        this.catbox = new CatBox(this, this.gatherBoxWidth + 20, 10, 400, 600, { title: "Inventory" });
        
        // Load layout data
        loadLayoutFromJson(gatherArea, 'gather', this.catbox);
    
        // DEBUG
        this.debugContainer = this.add.container(500, 500);
        this.debugUI(gatherArea);
    }

    // DEBUG BUTTONS
    debugUI(boxList) {
        this.addTextButton(0, 0, 'Add test_3 Box', () => {
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
    
        this.addTextButton(0, 30, 'Remove test_3 Box', () => {
            //
            boxList.removeBoxById("test_3");
            //
        });

        this.addTextButton(0, 60, 'Update Box', () => {
            //
            boxList.updateBoxById('pebbles', (box) => {
                box.gain = 2;
            });
            //
        });

        this.addTextButton(0, 120, 'Save', () => {
            //
                saveGame(boxList);
            //
        });
        
        this.addTextButton(0, 150, 'Load', () => {
            //
                loadGame(boxList);
            //
        });


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

createMiniPanner() {
    const camWidth = this.game.config.width;
    const camHeight = this.game.config.height;

    const pannerWidth = 450;
    const pannerHeight = 300;
    const pannerX = camWidth - pannerWidth - 10;
    const pannerY = camHeight - pannerHeight - 10;

    // Store panner bounds separately
    this.pannerBounds = { x: pannerX, y: pannerY, width: pannerWidth, height: pannerHeight };

    // Background box
    this.panner = this.add.graphics();
    this.panner.fillStyle(0x000000, 0.4);
    this.panner.fillRect(pannerX, pannerY, pannerWidth, pannerHeight);
    this.panner.lineStyle(2, 0xffffff, 1);
    this.panner.strokeRect(pannerX, pannerY, pannerWidth, pannerHeight);
    this.uiLayer.add(this.panner);

    // Viewport indicator inside the panner
    this.pannerCameraView = this.add.graphics();
    this.uiLayer.add(this.pannerCameraView);

    // Input handlers
    this.input.on('pointerdown', this.onPannerPointerDown, this);
    this.input.on('pointermove', this.onPannerPointerMove, this);
    this.input.on('pointerup', () => this.isPanning = false);
}

drawPannerBackground() {
    const { x, y, width, height } = this.panner;
    this.pannerGraphics.clear();
    this.pannerGraphics.fillStyle(0x000000, 0.4);
    this.pannerGraphics.fillRect(x, y, width, height);
    this.pannerGraphics.lineStyle(2, 0xffffff, 0.8);
    this.pannerGraphics.strokeRect(x, y, width, height);
}

onPannerPointerDown(pointer) {
    if (this.isPointerInPanner(pointer)) {
        this.isPanning = true;
        this.updateCameraFromPanner(pointer.x, pointer.y);
    }
}

onPannerPointerMove(pointer) {
    if (this.isPanning) {
        this.updateCameraFromPanner(pointer.x, pointer.y);
    }
}

updateCameraFromPanner(pointerX, pointerY) {
    const { x, y, width, height } = this.pannerBounds;
    const cam = this.cameras.main;
    const bounds = cam._bounds;

    const relX = (pointerX - x) / width;
    const relY = (pointerY - y) / height;

    const scrollX = bounds.x + relX * (bounds.width - cam.width / cam.zoom);
    const scrollY = bounds.y + relY * (bounds.height - cam.height / cam.zoom);

    cam.setScroll(scrollX, scrollY);
}

isPointerInPanner(pointer) {
    const { x, y, width, height } = this.pannerBounds;
    return (
        pointer.x >= x &&
        pointer.x <= x + width &&
        pointer.y >= y &&
        pointer.y <= y + height
    );
}

updateCameraFromPanner(pointerX, pointerY) {
    const { x, y, width, height } = this.pannerBounds;
    const cam = this.cameras.main;
    const bounds = cam._bounds;

    const relX = (pointerX - x) / width;
    const relY = (pointerY - y) / height;

    const maxScrollX = bounds.width - cam.width / cam.zoom;
    const maxScrollY = bounds.height - cam.height / cam.zoom;

    const scrollX = bounds.x + relX * maxScrollX;
    const scrollY = bounds.y + relY * maxScrollY;

    console.log(`relX: ${relX.toFixed(2)}, relY: ${relY.toFixed(2)}`);
    console.log(`scrollX: ${scrollX.toFixed(2)}, scrollY: ${scrollY.toFixed(2)}`);

    cam.setScroll(scrollX, scrollY);

    // Ensure the viewport updates immediately
    this.updatePannerViewport();
}

updatePannerViewport() {
    const { x, y, width, height } = this.pannerBounds;
    const cam = this.cameras.main;
    const bounds = cam._bounds;

    const relX = (cam.scrollX - bounds.x) / (bounds.width - cam.width / cam.zoom);
    const relY = (cam.scrollY - bounds.y) / (bounds.height - cam.height / cam.zoom);

    const viewWidth = (cam.width / cam.zoom / bounds.width) * width;
    const viewHeight = (cam.height / cam.zoom / bounds.height) * height;

    const viewX = x + relX * (width - viewWidth);
    const viewY = y + relY * (height - viewHeight);

    this.pannerCameraView.clear();
    this.pannerCameraView.fillStyle(0xffffff, 0.4);
    this.pannerCameraView.fillRect(viewX, viewY, viewWidth, viewHeight);
    this.pannerCameraView.lineStyle(1, 0xffffff, 1);
    this.pannerCameraView.strokeRect(viewX, viewY, viewWidth, viewHeight);
}

// Create zoom buttons and center button
createZoomButtons() {
    const { x, y } = this.pannerBounds;
    const btnStyle = { fontSize: '12px', color: '#fff', backgroundColor: '#000' };

    this.zoomInBtn = this.add.text(x - 50, y, 'Zoom +', btnStyle)
        .setInteractive()
        .on('pointerdown', () => this.changeZoom(0.1));
    this.uiLayer.add(this.zoomInBtn);

    this.zoomOutBtn = this.add.text(x - 50, y + 20, 'Zoom -', btnStyle)
        .setInteractive()
        .on('pointerdown', () => this.changeZoom(-0.1));
    this.uiLayer.add(this.zoomOutBtn);

    this.centerBtn = this.add.text(x - 50, y + 40, 'Center', btnStyle)
        .setInteractive()
        .on('pointerdown', () => this.centerCamera());
    this.uiLayer.add(this.centerBtn);
}

// Handle zoom
changeZoom(delta) {
    const cam = this.cameras.main;
    cam.setZoom(Phaser.Math.Clamp(cam.zoom + delta, 0.5, 3));
    this.updatePannerViewport();
}

centerCamera() {
    const cam = this.cameras.main;
    cam.centerOn(cam._bounds.centerX, cam._bounds.centerY);
    this.updatePannerViewport();
}

// Reset panner position back to its original position
resetPannerPosition() {
    const cam = this.cameras.main;
    // Set panner position back to its original position based on initial screen size
    this.panner.x = this.originalPannerPosition.x;
    this.panner.y = this.originalPannerPosition.y;
}



// Call this regularly
//update() {
    //this.updatePannerViewport();
//}



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