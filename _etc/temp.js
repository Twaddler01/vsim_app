Great! Here’s how you can wrap everything into an ActionBars manager class that handles adding/removing ActionBox instances and automatically repositions them.


---

1. Create the ActionBars class

export default class ActionBars {
    constructor(scene, container, startX, startY, spacing = 4) {
        this.scene = scene;
        this.container = container;
        this.startX = startX;
        this.startY = startY;
        this.spacing = spacing;
        this.boxes = [];
    }

    addBox(config) {
        const width = config.width || this.container.width;
        const height = config.height || 150;

        const box = new ActionBox(this.scene, 0, 0, width, height, config);
        this.container.add(box);
        this.boxes.push(box);
        this.repositionBoxes();
        return box;
    }

    removeBox(box) {
        const index = this.boxes.indexOf(box);
        if (index !== -1) {
            this.container.remove(box, true); // true = destroy
            this.boxes.splice(index, 1);
            this.repositionBoxes();
        }
    }

    repositionBoxes() {
        let currentY = this.startY;
        for (const box of this.boxes) {
            box.setPosition(this.startX, currentY);
            currentY += box.displayHeight + this.spacing;
        }
    }

    clearAll() {
        for (const box of this.boxes) {
            this.container.remove(box, true);
        }
        this.boxes = [];
    }
}


---

2. Using ActionBars in your scene

// After creating gatherContainer
this.actionBars = new ActionBars(this, gatherContainer, gatherBarStackX, gatherBarStackY);

// Add a box
this.actionBars.addBox({
    title: "Gather Twigs",
    description: "Collect nearby twigs from the ground.",
    gain: "Twigs",
    showButton: true,
    buttonLabel: "Gather",
    onAction: () => console.log("Gathering..."),
    width: gatherBarStackW,
    height: gatherBarStackH
});


---

This setup gives you an easy way to add or remove ActionBoxes dynamically while keeping everything clean and stacked correctly.

Would you like to also support updating or refreshing a specific box by ID or label?





Perfect — to support tracking ActionBox instances by id or label, we can enhance the ActionBars class to:

1. Accept a unique id or label when creating a box.


2. Store each box with that identifier.


3. Provide lookup/update/remove functions by id or label.




---

Updated ActionBars class with ID support

export default class ActionBars {
    constructor(scene, container, startX, startY, spacing = 4) {
        this.scene = scene;
        this.container = container;
        this.startX = startX;
        this.startY = startY;
        this.spacing = spacing;
        this.boxes = []; // Array of { id, box }
        this.boxMap = new Map(); // Fast lookup by id
    }

    addBox(config) {
        const { id, width, height } = config;
        if (id && this.boxMap.has(id)) {
            console.warn(`Box with ID '${id}' already exists.`);
            return null;
        }

        const box = new ActionBox(this.scene, 0, 0, width || this.container.width, height || 150, config);
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

    repositionBoxes() {
        let currentY = this.startY;
        for (const { box } of this.boxes) {
            box.setPosition(this.startX, currentY);
            currentY += box.displayHeight + this.spacing;
        }
    }

    clearAll() {
        for (const { box } of this.boxes) {
            this.container.remove(box, true);
        }
        this.boxes = [];
        this.boxMap.clear();
    }
}


---

Usage Example

this.actionBars.addBox({
    id: "gather_twigs",
    title: "Gather Twigs",
    description: "Collect twigs from the ground.",
    gain: "Twigs",
    showButton: true,
    buttonLabel: "Gather",
    onAction: () => console.log("Gathering twigs..."),
    width: gatherBarStackW,
    height: gatherBarStackH
});

// Update the box later
this.actionBars.updateBoxById("gather_twigs", box => {
    box.setDescription("You already collected twigs.");
});


---

Let me know if you’d like to add a category/tag system for bulk operations or filtering next.







Great! Here's how to split the code into two clean files/classes:


---

1. ActionBox.js

This file defines a single action box UI.

// ActionBox.js
const STYLES = {
    actionBoxColor: 0x000000,
};

export default class ActionBox extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height, config = {}) {
        super(scene, x, y);

        const {
            title = "Untitled",
            description = "",
            gain = "",
            showButton = false,
            buttonLabel = "Do It",
            onAction = () => {}
        } = config;

        // Background
        const bg = scene.add.rectangle(0, 0, width, height, STYLES.actionBoxColor).setOrigin(0);
        this.add(bg);

        // Title
        const titleText = scene.add.text(width / 2, 15, title, {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0);
        this.add(titleText);

        // Description
        const descText = scene.add.text(10, 50, description, {
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: width - 20 }
        });
        this.add(descText);

        // Gain
        const gainY = descText.y + descText.height + 10;
        const gainText = scene.add.text(20, gainY, gain, {
            fontSize: '14px',
            color: 'lightgreen'
        });
        this.add(gainText);

        // Action Button
        if (showButton) {
            const buttonY = height - 30;
            const btn = scene.add.text(width / 2, buttonY, buttonLabel, {
                fontSize: '16px',
                backgroundColor: '#e74c3c',
                padding: { x: 10, y: 5 },
                color: '#ffffff'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerdown', onAction);
            this.add(btn);
        }

        scene.add.existing(this);
    }
}


---

2. ActionBoxList.js

This file manages a list of ActionBox instances.

// ActionBoxList.js
import ActionBox from './ActionBox.js';

export default class ActionBoxList extends Phaser.GameObjects.Container {
    constructor(scene, container, startX, startY, spacing = 4) {
        super(scene);
        this.scene = scene;
        this.container = container;
        this.startX = startX;
        this.startY = startY;
        this.spacing = spacing;
        this.boxes = []; // Array of { id, box }
        this.boxMap = new Map(); // ID to box map

        scene.add.existing(this);
    }

    addBox(config) {
        const { id, width, height } = config;
        if (id && this.boxMap.has(id)) {
            console.warn(`Box with ID '${id}' already exists.`);
            return null;
        }

        const box = new ActionBox(this.scene, 0, 0, width || this.container.width, height || 150, config);
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


---

Usage Example

In your scene:

import ActionBoxList from './ActionBoxList.js';

const boxList = new ActionBoxList(this, gatherContainer, 5, 5, 6);

boxList.addBox({
    id: "twigs",
    title: "Gather Twigs",
    description: "Collect nearby twigs.",
    gain: "+1 Twig",
    showButton: true,
    buttonLabel: "Gather",
    onAction: () => console.log("Gathering twigs...")
});

Let me know if you want optional size/position logic or want to center content inside each box automatically.

