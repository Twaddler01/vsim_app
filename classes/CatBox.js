const STYLES = {
    catBoxColor: 0x000000,
    titleBoxColor: 0x0000FF,
};

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

        this._contentPadding = contentPadding;
        this.catBoxWidth = catBoxWidth;
        
        // Content area starts below title + top padding
        this.contentArea = scene.add.container(
            contentPadding,         // x offset
            50 + contentPadding     // y offset (title height + top padding)
        );
        
        this._currentY = this._contentPadding; // Tracks vertical position within contentArea
        // Mutable states
        this._title = title;
        // Tracking
        this._id = id;

        // Background
        const bg = scene.add.rectangle(0, 0, catBoxWidth, catBoxHeight, STYLES.catBoxColor).setOrigin(0);
        bg.setStrokeStyle(2, 0xffffff);
        this.add(bg);

        // Title Box
        const titleRect = scene.add.rectangle(0, 0, catBoxWidth, 50, STYLES.titleBoxColor).setOrigin(0);
        titleRect.setStrokeStyle(2, 0xffffff);
        this.add(titleRect);

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
        this.updateTitle;
    }
    
    updateTitle() {
        this.titleText.setText(this._title);
    }
    
    addRow(objects = [], spacing = 10) {
        objects.forEach(obj => {
            obj.x = this._contentPadding;
            obj.y = this._currentY;
    
            this.contentArea.add(obj);
    
            this._currentY += (obj.height || 0) + spacing;
        });
    }

addColorRow(objects = [], spacing = 10, rowColor = 0x222222, rowPadding = 5) {
    let maxHeight = 0;
    let currentX = this._contentPadding;

    // Measure max height among objects for background sizing
    objects.forEach(obj => {
        maxHeight = Math.max(maxHeight, obj.height || 0);
    });

    const totalHeight = maxHeight + rowPadding * 2;

    // Background rectangle
    const bg = this.scene.add.rectangle(
        this._contentPadding,
        this._currentY,
        this.catBoxWidth - this._contentPadding * 2,
        totalHeight,
        rowColor
    ).setOrigin(0, 0);
    this.contentArea.add(bg);

    // Add each object on top of background, spaced horizontally
    objects.forEach(obj => {
        obj.x = currentX;
        obj.y = this._currentY + rowPadding;
        this.contentArea.add(obj);
        currentX += (obj.width || 0) + spacing;
    });

    // Increment stacking position
    this._currentY += totalHeight + spacing;
}


}