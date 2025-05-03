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







export default class ActionBox extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height, config) {
        super(scene, x, y);
        this.config = { ...config };

        this.bg = scene.add.rectangle(0, 0, width, height, 0x333333).setOrigin(0);
        this.add(this.bg);

        this.titleText = scene.add.text(10, 10, config.title || '', { fontSize: '20px', color: '#fff' });
        this.add(this.titleText);

        this.descText = scene.add.text(10, 40, config.description || '', { fontSize: '14px', color: '#ccc' });
        this.add(this.descText);

        this.gainText = scene.add.text(10, 70, config.gain || '', { fontSize: '14px', color: '#aaffaa' });
        this.add(this.gainText);

        if (config.showButton) {
            this.button = scene.add.text(10, 110, config.buttonLabel || 'Do', {
                fontSize: '16px',
                backgroundColor: '#444',
                color: '#fff',
                padding: { x: 10, y: 5 }
            }).setInteractive();

            this.button.on('pointerdown', config.onAction);
            this.add(this.button);
        }

        scene.add.existing(this);
    }

    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);

        if (newConfig.title !== undefined) this.titleText.setText(newConfig.title);
        if (newConfig.description !== undefined) this.descText.setText(newConfig.description);
        if (newConfig.gain !== undefined) this.gainText.setText(newConfig.gain);

        if (newConfig.showButton !== undefined) {
            if (newConfig.showButton && !this.button) {
                this.button = this.scene.add.text(10, 110, newConfig.buttonLabel || 'Do', {
                    fontSize: '16px',
                    backgroundColor: '#444',
                    color: '#fff',
                    padding: { x: 10, y: 5 }
                }).setInteractive();
                this.button.on('pointerdown', newConfig.onAction || (() => {}));
                this.add(this.button);
            } else if (!newConfig.showButton && this.button) {
                this.button.destroy();
                this.button = null;
            }
        } else if (this.button && newConfig.buttonLabel) {
            this.button.setText(newConfig.buttonLabel);
        }

        if (this.button && newConfig.onAction) {
            this.button.removeAllListeners('pointerdown');
            this.button.on('pointerdown', newConfig.onAction);
        }
    }
}

/* USAGE
boxList.updateBoxById("test_3", box => {
    box.updateConfig({
        title: "Updated Title",
        description: "New description",
        gain: "+3",
        showButton: true,
        buttonLabel: "Collect",
        onAction: () => console.log("Updated Action")
    });
});
*/


updateConfig(newConfig, persist = true) {
    const prevId = this.config.id;
    const updated = { ...this.config, ...newConfig };
    this.config = updated;

    if (updated.title !== undefined) this.titleText.setText(updated.title);
    if (updated.description !== undefined) this.descText.setText(updated.description);
    if (updated.gain !== undefined) this.gainText.setText(updated.gain);

    if (updated.showButton !== undefined) {
        if (updated.showButton && !this.button) {
            this.button = this.scene.add.text(10, 110, updated.buttonLabel || 'Do', {
                fontSize: '16px',
                backgroundColor: '#444',
                color: '#fff',
                padding: { x: 10, y: 5 }
            }).setInteractive();
            this.button.on('pointerdown', updated.onAction || (() => {}));
            this.add(this.button);
        } else if (!updated.showButton && this.button) {
            this.button.destroy();
            this.button = null;
        }
    } else if (this.button && updated.buttonLabel) {
        this.button.setText(updated.buttonLabel);
    }

    if (this.button && updated.onAction) {
        this.button.removeAllListeners('pointerdown');
        this.button.on('pointerdown', updated.onAction);
    }

    // Optionally persist to localStorage
    if (persist && updated.id) {
        const overrides = JSON.parse(localStorage.getItem('savedOverrides') || '{}');
        overrides[updated.id] = { ...overrides[updated.id], ...newConfig };
        localStorage.setItem('savedOverrides', JSON.stringify(overrides));
    }
}







export default class ActionBox extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height, config = {}) {
        super(scene, x, y);

        const {
            id = '',
            title = "Untitled",
            description = "",
            gain = "",
            showButton = false,
            buttonLabel = "Do It",
            onAction = () => {}
        } = config;

        // mutable states
        this._count = 0;
        // get/set
        this._id = id;
        this._gainTextValue = gain;

        // Background
        const bg = scene.add.rectangle(0, 0, width, height, STYLES.actionBoxColor).setOrigin(0);
        this.add(bg);

        // Title
        this.titleText = scene.add.text(width / 2, 15, title, {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0);
        this.add(this.titleText);

        // Description
        this.descText = scene.add.text(10, 50, description, {
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: width - 20 }
        });
        this.add(this.descText);

        // Gain (mutable)
        const gainY = this.descText.y + this.descText.height + 10;
        this.gainText = scene.add.text(20, gainY, gain, {
            fontSize: '14px',
            color: 'lightgreen'
        });
        this.add(this.gainText);

        // Button
        if (showButton) {
            const buttonY = height - 30;
            this.button = scene.add.text(width / 2, buttonY, buttonLabel, {
                fontSize: '16px',
                backgroundColor: '#e74c3c',
                padding: { x: 10, y: 5 },
                color: '#ffffff'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            this.button.on('pointerdown', onAction);
            this.add(this.button);
        }

        scene.add.existing(this);
    }

removeBoxById(id) {
    const entry = this.boxMap.get(id);
    if (entry) {
        this.scrollContainer.remove(entry.box, true);
        this.boxes = this.boxes.filter(e => e.id !== id);
        this.boxMap.delete(id);
        this.repositionBoxes();
        this.updateMask(); // reapply mask to recalculate height

        // Prevent leftover scroll space if too short now
        const contentHeight = this.getContentHeight();
        const visibleHeight = this.maskHeight;
        const minY = Math.min(0, visibleHeight - contentHeight);
        if (this.scrollContainer.y < minY) {
            this.scrollContainer.y = minY;
        }
    }
}



Yes, absolutely — get count() simply provides access to an internal value (this._count), so when you're ready to save your boxes to localStorage, you can easily build an array like this:

const savedData = boxList.map(box => ({
    id: box.id,
    count: box.count, // uses the getter
    // include any other values you want to track
}));

localStorage.setItem('boxState', JSON.stringify(savedData));

When reloading, you'd loop through that saved array and apply the values using the corresponding set count(val) if you have it:

const data = JSON.parse(localStorage.getItem('boxState') || '[]');
data.forEach(entry => {
    const box = boxList.find(b => b.id === entry.id);
    if (box) {
        box.count = entry.count; // uses the setter
    }
});

So yes — using getters/setters is perfectly compatible with saving to and loading from localStorage, and they help keep your class logic clean and centralized.

Would you like help setting up this save/load pattern?




To access and update the ActionBox settings from your ActionBoxList class (either individually or all at once), your setup is already close. However, there are a few enhancements you’ll need:

1. Store gainText in a property

Right now gainText is not assigned to this.gainText, so updateGainText() will fail. Add this line in the constructor where you create gainText:

this.gainText = gainText;

2. Allow updates to individual ActionBoxes

This is already handled with:

updateBoxById(id, updateFn) {
    const box = this.getBoxById(id);
    if (box && typeof updateFn === 'function') {
        updateFn(box);
    }
}

Example usage:

actionBoxList.updateBoxById('box1', (box) => {
    box.gain = 3;
    box.gainTextValue = 'Coin';
});

3. Add method to update all boxes

Add this method to ActionBoxList:

updateAllBoxes(updateFn) {
    for (const { box } of this.boxes) {
        if (typeof updateFn === 'function') {
            updateFn(box);
        }
    }
}

Usage example:

actionBoxList.updateAllBoxes((box) => {
    box.gain = 2;
    box.gainTextValue = 'Gold';
});

Optional: Add .setTitle(), .setDescription(), etc.

If you want more convenience, you can add methods in ActionBox like:

setTitle(newTitle) {
    this.titleText.setText(newTitle);
}

…but that’s only needed if you plan to make changes often and want clearer APIs.

Would you like a method to dynamically update the ActionBox’s button as well (label, callback, or visibility)?




addBox(config) {
    const { id } = config;
    if (id && this.boxMap.has(id)) {
        console.warn(`Box with ID '${id}' already exists.`);
        return null;
    }

    const boxWidth = this.width;
    const boxHeight = 150;

    // Clone and normalize config to ensure defaults match constructor behavior
    const normalizedConfig = {
        gain: "+1 Gain",  // fallback default gain string
        showButton: false,
        ...config
    };

    // Only add default onAction if not already provided
    if (!normalizedConfig.onAction) {
        normalizedConfig.onAction = () => {
            // ActionBox constructor will set _gain and _gainTextValue
            const boxEntry = this.boxMap.get(id);
            if (boxEntry) {
                const box = boxEntry.box;
                box._count += box._gain;
                console.log(`Gathered +${box._gain} ${box._gainTextValue}, count is now ${box._count}`);
                box.updateGainText?.(); // optional if you later show count
            }
        };
    }

    const box = new ActionBox(this.scene, 0, 0, boxWidth, boxHeight, normalizedConfig);
    this.scrollContainer.add(box);

    const entry = { id, box };
    this.boxes.push(entry);
    if (id) this.boxMap.set(id, entry);
    this.repositionBoxes();

    return box;
}





async function loadLayoutFromJson(object, section) {
    const response = await fetch('assets/data/layout.json');
    const data = await response.json();
    const loadedData = data[section] || [];

    // Load saveData
    const saveData = JSON.parse(localStorage.getItem('gameState')) || [];
    console.log('saveData: ' + JSON.stringify(saveData));

    // Add boxes from saveData
    saveData.forEach(save => {
        // Try to find matching data from original layout (optional)
        const baseData = loadedData.find(d => d.id === save.id) || {};
        object.addBox({
            id: save.id,
            active: save.active,
            gain: save.gain ?? baseData.gain ?? 1,
            count: save.count ?? baseData.count ?? 0,
            ...baseData // merge any extra data from layout.json
        });
    });
}




Perfect — since your layout is already working and the "gather" section is defined, here's a complete working setup that:

Loads from layout.json,

Checks both active: true in JSON and active in saved data,

Uses activateBox(id) to load by id and mark it active for saving,

Preserves saved gain and count values.



---

loadLayoutFromJson function

async function loadLayoutFromJson(object, section) {
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
            const box = object.activateBox(jsonBox.id);

            if (box && saveBox) {
                // Apply save state (like gain/count) to the box
                box.gain = saveBox.gain ?? box.gain;
                box.count = saveBox.count ?? box.count;
            }
        }
    });
}


---

activateBox(id) method

Add this to your boxList or layout manager class:

activateBox(id) {
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
    return box;
}


---

Example usage

// On scene create/init
await loadLayoutFromJson(boxList, 'gather');

Now, all active boxes in layout.json or saved as active: true will load correctly, and future saves will preserve their status.

Would you like help adding a dev button like “Activate Box: twigs” using activateBox()?




export default class CatBox extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height, config = {}) {
        super(scene, x, y);

        const {
            id = "",
            catBoxX = x || 0,
            catBoxY = y || 0,
            catBoxWidth = width || 400, 
            catBoxHeight = height || 600,
            title = "",
            contentPadding = 10,
        } = config;

        this.id = id;
        this._title = title;

        // Background
        const bg = scene.add.rectangle(0, 0, catBoxWidth, catBoxHeight, STYLES.catBoxColor).setOrigin(0);
        this.add(bg);

        // Title
        this.titleText = scene.add.text(catBoxWidth / 2, 15, title, {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0);
        this.add(this.titleText);

        // Content area starts below title
        this.contentArea = scene.add.container(0, 50); // y-offset below title
        this.add(this.contentArea);

        scene.add.existing(this);
    }

    addContent(child) {
        this.contentArea.add(child);
    }

    get title() {
        return this._title;
    }

    set title(val) {
        this._title = val;
        this.updateTitle();
    }

    updateTitle() {
        this.titleText.setText(this._title);
    }
}






Perfect — here's how to wire the ActionBox click so it automatically updates the corresponding inventory row's count visually and internally.

Step-by-Step Integration

Assuming you already created a row like:

const twigsRow = catbox.addInventoryRow({ label: "Twigs", count: 0, rate: "+1/sec" });

You’ll pass this row to ActionBox through the config object so it knows what to update:


---

1. Modify the ActionBox constructor to accept targetRow:

Update this in the constructor:

const {
    ...
    targetRow = null,  // <- this is your inventory row (optional)
    onAction = () => {
        this._count += this._gain;

        // Update the row’s display, if linked
        if (targetRow) targetRow.count = this._count;

        console.log(`Gathering +${this._gain} ${this._gainTextValue}. Count: ${this._count}`);
    }
} = config;


---

2. Set the row’s count in the setter

You're already exposing this._count through a set count(val) — just update the row visually if one is linked:

Add this to your ActionBox class (after this._count = 0):

this._targetRow = config.targetRow || null;

Then update the count setter:

set count(val) {
    this._count = val;
    if (this._targetRow) {
        this._targetRow.count = val;
    }
}


---

3. Creating your ActionBox

Now when creating an ActionBox, just pass the row:

const twigsRow = catbox.addInventoryRow({ label: "Twigs", count: 0, rate: "+1/sec" });

const twigsBox = new ActionBox(this, 50, 300, 200, 150, {
    title: "Gather Twigs",
    description: "Click to gather sticks.",
    gain: "Twig",
    showButton: true,
    targetRow: twigsRow // <- key part
});


---

Now when you click the button in ActionBox, it updates twigsRow.count automatically, keeping it aligned and consistent.

Would you like me to help support multiple actions adding to the same row, or auto-generating ActionBoxes from config?

