class LayoutBox {
    constructor(scene, x, y, width, height, title, layoutManager) {
        this.scene = scene;
        this.container = scene.add.container(x, y);
        this.titleHeight = 40;
        this.contentHeight = height - this.titleHeight;
        this.isExpanded = false;
        this.layoutManager = layoutManager;
        this.contentItems = []; // Store added content elements

        // Background box -- ref only
        this.boxRect = scene.add.rectangle(0, 0, width, height, 0x333333).setOrigin(0).setVisible(false);
        this.boxRect.setStrokeStyle(2, 0xffffff);

        // Title bar
        this.titleBar = scene.add.rectangle(0, 0, width, this.titleHeight, 0x555555).setOrigin(0);
        this.titleBar.setStrokeStyle(2, 0xffffff);

        // Title text
        this.titleText = scene.add.text(width / 2, 10, title, {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5, 0);

        // Content (placeholder box)
        this.content = scene.add.rectangle(0, this.titleHeight, width, this.contentHeight, 0x777777).setOrigin(0);
        this.content.setStrokeStyle(2, 0xffffff);
        this.content.setVisible(false);

        this.container.add([this.boxRect, this.titleBar, this.titleText, this.content]);

        this.titleBar.setInteractive();
        this.titleBar.on('pointerdown', () => this.toggleVisibility());
    }

    toggleVisibility() {
        this.isExpanded = !this.isExpanded;
        this.content.setVisible(this.isExpanded);
        const newHeight = this.isExpanded ? this.contentHeight : this.titleHeight;
        this.content.height = newHeight;
        const border = this.isExpanded ? 2 : 0;
        this.content.setStrokeStyle(border, 0xffffff);
        this.layoutManager.repositionBoxes();
    }

    getHeight() {
        return this.isExpanded ? this.titleHeight + this.contentHeight : this.titleHeight;
    }

    setY(y) {
        this.container.y = y;
    }

    addContent(child) {
        const offsetY = this.contentItems.length * 50;
        child.setPosition(1, this.content.y + offsetY); // align with content area
        this.container.add(child);
        this.contentItems.push(child);
    
        // Update content height
        this.contentHeight = this.contentItems.length * 50;
        this.content.height = this.contentHeight;
    
        // Update total boxRect height if expanded
        if (this.isExpanded) {
            this.boxRect.height = this.titleHeight + this.contentHeight;
        }
    
        this.layoutManager.repositionBoxes();
    }

}

class LayoutScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LayoutScene' });
    }

    preload() {}

    create() {
        this.boxes = [];

        const width = 300;
        const startX = 50;
        const startY = 50;
        const spacing = 10;

        const box1 = new LayoutBox(this, startX, startY, width, 291, 'Gather Area', this);
        const box2 = new LayoutBox(this, startX, startY, width, 200, 'Craft Area', this);
        const box3 = new LayoutBox(this, startX, startY, width, 200, 'Another Area', this);

        this.boxes.push(box1, box2, box3);

        this.repositionBoxes();
        
// Add 5 rectangles to box1
for (let i = 0; i < 3; i++) {
    const item = this.add.rectangle(0, 0, width - 2, 50, 0x0000ff).setOrigin(0);
    box1.addContent(item);
}

    }

    repositionBoxes() {
        let currentY = 50;
        for (const box of this.boxes) {
            box.setY(currentY);
            currentY += box.getHeight() + 10;
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1d1d1d',
    scene: [LayoutScene]
};

const game = new Phaser.Game(config);