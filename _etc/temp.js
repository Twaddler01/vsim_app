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









To isolate the gatherContainer from the camera panning and allow its content to scroll internally (when overflowing), you’ll need to:

1. Prevent it from moving with the camera.


2. Add a scrollable mask to clip overflowed children.


3. Manually handle scrolling inside that box.



Here’s how to achieve that:


---

Step 1: Prevent it from moving with camera panning

By default, all Phaser objects scroll with the camera. To "fix" gatherContainer to the screen (like a UI HUD), set its scroll factor to 0:

gatherContainer.setScrollFactor(0);


---

Step 2: Add a mask for overflow clipping

Phaser containers don't automatically clip their contents. You must create a mask manually:

const maskShape = this.make.graphics({});
maskShape.fillStyle(0xffffff);
maskShape.fillRect(10, 10, gatherBoxWidth, gatherBoxHeight);
const mask = maskShape.createGeometryMask();
gatherContainer.setMask(mask);


---

Step 3: Add manual scroll logic to the container

You can use wheel input to scroll the contents vertically:

this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
    const bounds = gatherContainer.getBounds();
    const pointerX = pointer.x;
    const pointerY = pointer.y;

    // Only scroll if pointer is inside the gather container area
    if (pointerX >= bounds.x && pointerX <= bounds.right &&
        pointerY >= bounds.y && pointerY <= bounds.bottom) {
        
        gatherContainer.y -= deltaY * 0.5;

        // Clamp scroll
        const minY = 10; // top bound
        const maxY = 10 + Math.max(0, gatherBoxHeight - boxList.height); // bottom bound

        gatherContainer.y = Phaser.Math.Clamp(gatherContainer.y, minY - boxList.height + gatherBoxHeight, minY);
    }
});

> Replace boxList.height with the actual calculated height of the stacked boxes.




---

Would you like help modifying ActionBoxList so it returns its total height or emits an event when it overflows?







To enable internal scrolling within your gatherContainer and prevent it from being affected by camera panning, you can enhance your ActionBoxList class to calculate its total height and emit an event when its content exceeds the visible area.  Here's how you can achieve this:


---

1. Calculate Total Height in ActionBoxList

Modify your ActionBoxList class to compute the cumulative height of all its child boxes. This can be done by iterating over each child and summing their heights. 

class ActionBoxList extends Phaser.GameObjects.Container {
    constructor(scene, parentContainer, x, y, width, maxBoxes) {
        super(scene, x, y);
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.width = width;
        this.maxBoxes = maxBoxes;
        this.boxes = [];

        // Add this container to the parent
        this.parentContainer.add(this);
    }

    addBox(config) {
        const box = new ActionBox(this.scene, 0, this.getNextY(), this.width, 100, config);
        this.add(box);
        this.boxes.push(box);

        // After adding, check if overflow occurs
        this.checkOverflow();
    }

    getNextY() {
        let y = 0;
        this.boxes.forEach(box => {
            y += box.height + 10; // Assuming 10px spacing
        });
        return y;
    }

    getTotalHeight() {
        let totalHeight = 0;
        this.boxes.forEach(box => {
            totalHeight += box.height + 10; // Including spacing
        });
        return totalHeight;
    }

    checkOverflow() {
        const totalHeight = this.getTotalHeight();
        const containerHeight = this.parentContainer.height; // Assuming height is set

        if (totalHeight > containerHeight) {
            this.emit('overflow', { totalHeight, containerHeight });
        }
    }
}




---

2. Listen for Overflow Event in MainScene

In your MainScene, after creating the ActionBoxList, add an event listener to handle the overflow: 

boxList.on('overflow', ({ totalHeight, containerHeight }) => {
    console.log(`Overflow detected: totalHeight = ${totalHeight}, containerHeight = ${containerHeight}`);
    // Implement scroll logic here
});




---

3. Implement Scroll Logic

To allow users to scroll through the overflowing content within gatherContainer, you can add input listeners (e.g., mouse wheel or touch drag) to adjust the position of the ActionBoxList accordingly. 

this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
    const bounds = gatherContainer.getBounds();
    const pointerX = pointer.x;
    const pointerY = pointer.y;

    // Only scroll if pointer is inside the gather container area
    if (pointerX >= bounds.x && pointerX <= bounds.right &&
        pointerY >= bounds.y && pointerY <= bounds.bottom) {
        
        boxList.y -= deltaY * 0.5;

        // Clamp scroll
        const minY = 0; // Adjust as needed
        const maxY = Math.max(0, boxList.getTotalHeight() - gatherBoxHeight);

        boxList.y = Phaser.Math.Clamp(boxList.y, -maxY, minY);
    }
});



This approach ensures that the gatherContainer remains stationary during camera panning, and its internal content can be scrolled independently when it overflows. 


---

For more advanced UI components like scrollable panels, you might consider using plugins such as RexUI's ScrollablePanel, which provides built-in support for scrollable containers in Phaser 3. 

Let me know if you need further assistance with implementing the scroll logic or integrating additional features.





debugUI() {
    this.addTextButton(0, 0, 'Add Box', () => {
        const box = this.add.rectangle(0, this.debugContainer.length * 60, 100, 50, 0x8888ff);
        this.debugContainer.add(box);
    });

    this.addTextButton(0, 60, 'Clear All', () => {
        this.debugContainer.removeAll(true);
    });
}

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