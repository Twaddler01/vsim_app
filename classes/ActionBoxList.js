import ActionBox from './ActionBox.js';

export default class ActionBoxList extends Phaser.GameObjects.Container {
    constructor(scene, container, startX, startY, width, spacing = 4) {
        super(scene);
        this.scene = scene;
        this.container = container;
        this.startX = startX;
        this.startY = startY;
        this.width = width;
        this.spacing = spacing;
        this.boxes = []; // Array of { id, box }
        this.boxMap = new Map(); // ID to box map

        scene.add.existing(this);
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
        this.container.add(box);
    
        const entry = { id, box };
        this.boxes.push(entry);
        if (id) this.boxMap.set(id, entry);
        this.repositionBoxes();
    
        return box;
    }

    removeBoxById(id) {
        const entry = this.boxMap.get(id);
        if (entry) {
            this.container.remove(entry.box, true);
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
            this.container.remove(box, true);
        }
        this.boxes = [];
        this.boxMap.clear();
    }

    repositionBoxes() {
        let currentY = this.startY;
        for (const { box } of this.boxes) {
            box.setPosition(this.startX, currentY);
            currentY += box.displayHeight + this.spacing;
        }
    }
}