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
        //
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

        this.worldWidth = width;
        this.worldHeight = height;
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

        // Enable camera drag for panning
        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartX = pointer.x;
            this.dragStartY = pointer.y;
        });
    
        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        // Start here
        this.isPointerInGatherContainer = false;
        this.input.addPointer(2); // Enable multi-touch
        this.createUI();

        // ZOOM
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
            // * Ignore gatherContainer
            else if (pointers.length === 1 && pointer.isDown && !this.isPointerInGatherContainer) {
                const dragSpeed = 0.25 / this.cameraZoom; // 1
                this.cameras.main.scrollX -= pointer.velocity.x * dragSpeed;
                this.cameras.main.scrollY -= pointer.velocity.y * dragSpeed;
                this.pinchStartDistance = null; // cancel zoom state
            } 
            else {
                this.pinchStartDistance = null;
            }
        });

    }

    createUI() {
        // Setting up the main UI components
        
        // CANVAS BACKGROUND BOX
        const width = this.game.config.width;
        const height = this.game.config.height;
        // Game area rectangle
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0xffffff, 1); // Gray color
        this.graphics.fillRect(0, 0, width, height);
        this.graphics.setDepth(-1); // -1 ensures it's behind other game elements

        // **** NEW LAYOUT
        this.uiLeftSide = this.add.rectangle(0, 0, width / 2.5, height, 0x000000).setOrigin(0);
        const rightSideX = this.uiLeftSide.width + 10;
        this.uiRightSide = this.add.rectangle(rightSideX, 0, width - this.uiLeftSide.width - 20, height, 0x000000).setOrigin(0);
        
        // Global container
        this.uiRightElements = this.add.container();
        
        // *** LAYOUT AREAS
        // Gather
        const gatherArea = this.createActionBoxList(this.uiRightSide.x - 1, 100, "Gather Area");
        // Craft
        ////WIP need dynamic heights
        const craftArea = this.createActionBoxList(this.uiRightSide.x - 1, 600, "Craft Area");
        
        // Inventory
        this.catbox = new CatBox(this, -2, 100, this.uiLeftSide.width + 3, 600, { title: "Inventory" });
        
        // Load layout data
        loadLayoutFromJson(gatherArea, 'gather', this.catbox);
    
        // DEBUG
        this.debugContainer = this.add.container(500, 500);
        //this.addToWorld(this.debugContainer);
        this.debugUI(gatherArea);
    }

    // DEBUG BUTTONS
    debugUI(boxList) {
        this.addTextButton(0, 0, 'Add test_1 Box', () => {
            // flag true
                const box = boxList.activateBox('test_1', this.catbox);
                if (box) {
                    console.log('Box "test_1" activated.');
                } else {
                    console.warn('Box "test_1" could not be activated.');
                }
        });
        this.addTextButton(100, 0, 'Add test_2 Box', () => {
            // flag true
                const box = boxList.activateBox('test_2', this.catbox);
                if (box) {
                    console.log('Box "test_2" activated.');
                } else {
                    console.warn('Box "test_2" could not be activated.');
                }
        });
        this.addTextButton(200, 0, 'Add test_3 Box', () => {
            // flag true
                const box = boxList.activateBox('test_3', this.catbox);
                if (box) {
                    console.log('Box "test_3" activated.');
                } else {
                    console.warn('Box "test_3" could not be activated.');
                }
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

    createActionBoxList(startX, startY, title) {
        //const startX = this.uiRightSide.x - 1; // ContainerX
        //const startY = 100; // ContainerY
        const width = this.uiRightSide.width + 2;
        const height = this.worldHeight - 99;
        const titleHeight = 50;

        // Create the container to group the box and its contents
        const container = this.add.container(startX, startY);
        
        // Box background
        const boxRect = this.add.rectangle(0, 0, width, height, UI_STYLES.mainBoxColor)
            .setOrigin(0);
        boxRect.setStrokeStyle(2, 0xffffff);
        
        // Box title
        const boxRectTitle = this.add.rectangle(boxRect.x, boxRect.y, width, titleHeight, UI_STYLES.titleBoxColor)
            .setOrigin(0);
        boxRectTitle.setStrokeStyle(2, 0xffffff);
       
        // Title text centered at the top
        const titleText = this.add.text(
            width / 2, 15, // X centered, Y a bit down from top
            title,
            {
                fontSize: UI_STYLES.fontSizeLarge,
                color: UI_STYLES.textColor,
                align: 'center'
            }
        ).setOrigin(0.5, 0); // Center X, top Y

        // Add everything to container
        container.add([boxRect, boxRectTitle, titleText]);
        
        // Add boxes to gatherBox
        const stackX = 1;
        const stackY = titleHeight + 2;
        const stackW = width - 4;

        const boxList = new ActionBoxList(this, container, stackX, stackY, stackW, 6);

        // Toggle contents
        boxRectTitle.setInteractive();
        titleText.setInteractive();
        
        const toggle = () => {
            boxList.toggleVisibility();
        };
        
        boxRectTitle.on('pointerdown', toggle);
        titleText.on('pointerdown', toggle);

        this.uiRightElements.add(container);

        return boxList;
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