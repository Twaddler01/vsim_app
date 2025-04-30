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

        // Scroll setup
        this.scrollContainer = scene.add.container(0, 0);
        this.container.add(this.scrollContainer);

        // Create mask based on desired visible area
        const visibleHeight = container.height || 400; // fallback value
        const maskGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRect(startX, startY, width, visibleHeight - startY); // mask only from content start
        const mask = maskGraphics.createGeometryMask();
        this.scrollContainer.setMask(mask);

        // Dragging state
        this.isDragging = false;
        this.dragStartY = 0;
        this.containerStartY = 0;

scene.input.on('pointerdown', (pointer) => {
    const inBounds = this.isPointerInBounds(pointer);
    this.scene.isPointerInGatherContainer = inBounds;

    if (inBounds) {
        this.isDragging = true;
        this.dragStartY = pointer.y;
        this.containerStartY = this.scrollContainer.y;
    }
});
/*
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
*/

        scene.input.on('pointermove', (pointer) => {
            if (!this.isDragging) return;

            const deltaY = pointer.y - this.dragStartY;
            let newY = this.containerStartY + deltaY;

            const contentHeight = this.getContentHeight();
            const minY = Math.min(0, this.container.height - contentHeight - this.startY);
            const maxY = 0;

            this.scrollContainer.y = Phaser.Math.Clamp(newY, minY, maxY);
        });

scene.input.on('pointerup', () => {
    this.isDragging = false;
    this.scene.isPointerInGatherContainer = false;
});
/*
        scene.input.on('pointerup', () => {
            this.isDragging = false;
            this.scene.isPointerInGatherContainer = false;
        });
*/
        scene.add.existing(this);
    }

    isPointerInBounds(pointer) {
        const localY = pointer.y;
        const containerBounds = this.container.getBounds();
        return (
            pointer.x >= containerBounds.x &&
            pointer.x <= containerBounds.x + containerBounds.width &&
            localY >= containerBounds.y + this.startY &&
            localY <= containerBounds.y + containerBounds.height
        );
    }

    getContentHeight() {
        return this.boxes.length * (150 + this.spacing);
    }

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
        }
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
    }
}