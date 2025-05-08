import ActionBox from './ActionBox.js';

export default class ActionBoxList extends Phaser.GameObjects.Container {
    constructor(scene, container, startX, startY, width, spacing = 4) {
        super(scene);

        this.scene = scene;
        this.container = container; // Outer Phaser container holding the scrollable area
        this.startX = startX;
        this.startY = startY;
        this.width = width;
        this.spacing = spacing;
        this.boxes = []; // Array of { id, box }
        this.boxMap = new Map(); // ID to box map
        this.isExpanded = true;
        
        // Scroll setup
        this.scrollContainer = scene.add.container(0, 0);
        this.container.add(this.scrollContainer);

        this.updateMask();
        
        // Dragging state
        this.isDragging = false;
        this.dragStartY = 0;
        this.containerStartY = 0;

        scene.input.on('pointerdown', (pointer) => {
            if (this.isPointerInBounds(pointer)) {
                this.scene.isPointerInGatherContainer = true;
                this.isDragging = true;
                this.dragStartY = pointer.y;
                this.containerStartY = this.scrollContainer.y;
            } else {
                this.scene.isPointerInGatherContainer = false;
            }
        });

        scene.input.on('pointermove', (pointer) => {
            if (!this.isDragging) return;
        
            const deltaY = pointer.y - this.dragStartY;
            let newY = this.containerStartY + deltaY;
        
            const contentHeight = this.getContentHeight();
            const visibleHeight = this.maskHeight; // Use the dynamic mask height
        
            const minY = Math.min(0, visibleHeight - contentHeight); // Updated to use visible height dynamically
            const maxY = 0;
        
            this.scrollContainer.y = Phaser.Math.Clamp(newY, minY, maxY);
        });

        scene.input.on('pointerup', () => {
            this.isDragging = false;
            this.scene.isPointerInGatherContainer = false;
        });

        scene.add.existing(this);
    }

    toggleVisibility() {
        this.isExpanded = !this.isExpanded;
        this.scrollContainer.setVisible(this.isExpanded);
    }

    isPointerInBounds(pointer) {
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const bounds = this.container.getBounds(); // Still in world space
    
        return (
            worldPoint.x >= bounds.x &&
            worldPoint.x <= bounds.x + bounds.width &&
            worldPoint.y >= bounds.y &&
            worldPoint.y <= bounds.y + bounds.height
        );
    }

    getContentHeight() {
        if (this.boxes.length === 0) return 0;
    
        const totalBoxHeight = this.boxes.length * 150;
        const totalSpacing = (this.boxes.length - 1) * this.spacing;
        return totalBoxHeight + totalSpacing;
    }

    // Manually add boxes without JSON
    addBox(config) {
        const { id } = config;
        if (id && this.boxMap.has(id)) {
            console.warn(`Box with ID '${id}' already exists.`);
            return null;
        }

        const boxWidth = this.width;
        const boxHeight = 150;

        const box = new ActionBox(this.scene, 0, 0, boxWidth, boxHeight, config);
        this.scrollContainer.add(box);

        const entry = { id, box };
        this.boxes.push(entry);
        if (id) this.boxMap.set(id, entry);
        this.repositionBoxes();

        return box;
    }

    removeBoxById(id) {
        const entry = this.boxMap.get(id);
        if (entry) {
            this.scrollContainer.remove(entry.box, true);
            this.boxes = this.boxes.filter(e => e.id !== id);
            this.boxMap.delete(id);
            this.repositionBoxes();

            // Prevent leftover scroll space if too short now
            const contentHeight = this.getContentHeight();
            const visibleHeight = this.maskHeight;
            const minY = Math.min(0, visibleHeight - contentHeight);
            if (this.scrollContainer.y < minY) {
                this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y, minY, 0);
            }
        }
    }

    // Mark JSON boxes active and add them to UI
    activateBox(id, uiArea) {
        if (this.boxMap.has(id)) {
            console.warn(`Box '${id}' already active.`);
            return this.boxMap.get(id).box;
        }
    
        if (!this.boxConfigs) {
            console.error('boxConfigs not loaded. Run loadLayoutFromJson first.');
            return null;
        }
    
        const config = this.boxConfigs.find(c => c.id === id);
        if (!config) {
            console.error(`Box config for '${id}' not found in layout.`);
            return null;
        }
    
        // Clone config and ensure it's marked active
        const boxData = { ...config, active: true };
        const box = this.addBox(boxData);
        if (box) {
            box.active = true;
        }

        // Add inventory row and link it
        if (!box._targetRow) {
            const row = uiArea.addInventoryRow({
                label: box.gainTextValue + 's',
                count: box.count,
                rate: "+1/sec"
            });
            box._targetRow = row;
        }

        return box;
    }

    getBoxById(id) {
        const entry = this.boxMap.get(id);
        return entry ? entry.box : null;
    }

    updateBoxById(id, updateFn) {
        const box = this.getBoxById(id);
        if (box && typeof updateFn === 'function') {
            updateFn(box);
        }
    }
    // USAGE
    //actionBoxList.updateBoxById("twigs", (box) => {
    //    box.gain = 2;
    //    box.gainTextValue = 'Gold';
    //});

    updateAllBoxes(updateFn) {
        for (const { box } of this.boxes) {
            if (typeof updateFn === 'function') {
                updateFn(box);
            }
        }
    }
    // USAGE
    //actionBoxList.updateAllBoxes((box) => {
    //    box.gain = 2;
    //    box.gainTextValue = 'Gold';
    //});

    clearAll() {
        for (const { box } of this.boxes) {
            this.scrollContainer.remove(box, true);
        }
        this.boxes = [];
        this.boxMap.clear();
    }

    repositionBoxes() {
        let currentY = this.startY;
        for (const { box } of this.boxes) {
            box.setPosition(this.startX, currentY);
            currentY += 150 + this.spacing;
        }

this.graphicsTest = this.add.graphics();
this.graphicsTest.fillStyle(0xffffff, 1);
this.graphicsTest.fillRect(0, 0, 100, 30);
//this.graphicsTest.setDepth(1);


    }

    updateMask() {
        const bounds = this.container.getBounds(); // gatherContainer or the clipping region
    
        // Dynamically calculate the visible mask height
        this.maskHeight = bounds.height - this.scene.gatherBoxRectTitleSpace; // This is the visible height of the gatherContainer
    
        // Create mask
        const maskShape = this.scene.make.graphics({ x: 0, y: 0, add: false });
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(bounds.x, this.startY + 10, bounds.width, this.maskHeight); // Updated with dynamic height
        const mask = maskShape.createGeometryMask();
    
        this.scrollContainer.setMask(mask);
    }
}