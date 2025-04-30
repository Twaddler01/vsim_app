import ActionBox from '../classes/ActionBox.js';
import ActionBoxList from '../classes/ActionBoxList.js';

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
        const worldWidth = width * 1.3;
        const worldHeight = height * 1.3;
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    
        // Optional: visualize the extended area
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x808080, 1);
        this.graphics.fillRect(0, 0, worldWidth, worldHeight);
        this.graphics.setDepth(-1);
    
        this.createUI();
    
        // Enable camera drag for panning
        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartX = pointer.x;
            this.dragStartY = pointer.y;
        });
    
        this.input.on('pointerup', () => {
            this.isDragging = false;
        });
    
        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                this.cameras.main.scrollX -= (pointer.x - this.dragStartX);
                this.cameras.main.scrollY -= (pointer.y - this.dragStartY);
                this.dragStartX = pointer.x;
                this.dragStartY = pointer.y;
            }
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
            canvasWidth / worldWidth,
            canvasHeight / worldHeight
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

            const zoomFactor = 1 + delta * 0.0025;
            this.cameraZoom = Phaser.Math.Clamp(this.cameraZoom * zoomFactor, this.minZoom, 5);
            this.cameras.main.setZoom(this.cameraZoom);
        }
    } 
    // Handle drag-to-pan
    else if (pointers.length === 1 && pointer.isDown) {
        const dragSpeed = 1 / this.cameraZoom;
        this.cameras.main.scrollX -= pointer.velocity.x * dragSpeed;
        this.cameras.main.scrollY -= pointer.velocity.y * dragSpeed;
        this.pinchStartDistance = null; // cancel zoom state
    } 
    else {
        this.pinchStartDistance = null;
    }
});


/*
        // Listen for pinch gestures
        this.input.on('pointermove', () => {
            if (this.isPointerInGatherContainer) return;

            const pointers = this.input.manager.pointers.filter(p => p.isDown);
        
            if (pointers.length === 2) {
                const [p1, p2] = pointers;
                const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        
                if (this.pinchStartDistance === null) {
                    this.pinchStartDistance = dist;
                } else {
                    const delta = dist - this.pinchStartDistance;
                    this.pinchStartDistance = dist;
        
                    const zoomFactor = 1 + delta * 0.0025;
                    this.cameraZoom = Phaser.Math.Clamp(this.cameraZoom * zoomFactor, this.minZoom, 5);
                    this.cameras.main.setZoom(this.cameraZoom);
                }
            } else {
                this.pinchStartDistance = null;
            }
        });*/
    //
    


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

    // LAYOUT AREAS
const gatherBoxX = 0;
const gatherBoxY = 0;
const gatherBoxWidth = 400;
const gatherBoxHeight = 600;

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

// You can now add other contents below titleText if needed
/*const contentText = this.add.text(
    20, 60,
    "Resource list goes here...",
    {
        fontSize: UI_STYLES.fontSizeSmall,
        color: UI_STYLES.textColor,
        wordWrap: { width: gatherBoxWidth - 40 }
    }
);*/

// Add everything to container
gatherContainer.add([gatherBoxRect, gatherBoxRectTitle, titleText]);

// Add boxes to gatherBox
const gatherBarStackX = gatherBoxX + 2;
const gatherBarStackY = gatherBoxHeight / 12 + 2;
const gatherBarStackW = gatherBoxWidth - 4;

const boxList = new ActionBoxList(this, gatherContainer, gatherBarStackX, gatherBarStackY, gatherBarStackW, 6);

boxList.addBox({
    id: "twigs",
    title: "Gather Twigs",
    description: "Collect nearby twigs.",
    gain: "+1 Twig",
    showButton: true,
    buttonLabel: "Gather",
    onAction: () => console.log("Gathering twigs...")
});

boxList.addBox({
    id: "pebbles",
    title: "Gather Pebbles",
    description: "Collect nearby pebbles.",
    gain: "+1 Pebbles",
    showButton: true,
    buttonLabel: "Gather",
    onAction: () => console.log("Gathering pebbles...")
});

boxList.addBox({
    id: "test_1",
    title: "Gather TEST1",
    description: "Collect nearby TEST.",
    gain: "+1 TEST",
    showButton: true,
    buttonLabel: "Gather",
    onAction: () => console.log("Gathering TEST...")
});

boxList.addBox({
    id: "test_2",
    title: "Gather TEST2",
    description: "Collect nearby TEST.",
    gain: "+1 TEST",
    showButton: true,
    buttonLabel: "Gather",
    onAction: () => console.log("Gathering TEST...")
});

/*
// Location of Gather boxes stack
const gatherBarStackX = gatherBoxX + 2;
const gatherBarStackY = gatherBoxHeight / 12 + 2;
const gatherBarStackW = gatherBoxWidth - 4;
const gatherBarStackH = 150;

const box = new ActionBox(this, gatherBarStackX, gatherBarStackY, gatherBarStackW, gatherBarStackH, {
    title: "Gather Twigs",
    description: "Collect nearby twigs from the ground.",
    gain: "Twigs",
    showButton: true,
    buttonLabel: "Gather",
    onAction: () => console.log("Gathering...")
});
gatherContainer.add(box);
*/


    /*const boxSize = 300;
    const spacing = 20;
    const startX = 20;
    const startY = 20;
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const x = startX + col * (boxSize + spacing);
            const y = startY + row * (boxSize + spacing);
            const box = this.add.rectangle(x, y, boxSize, boxSize, UI_STYLES.mainBoxColor).setOrigin(0);
            box.setStrokeStyle(2, 0xffffff);
        }
    }*/







    }
} // MainScene

// Export default MainScene;
export default MainScene;