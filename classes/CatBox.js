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
        this._width = width - contentPadding;
        
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
        // Overlay to hide bottom border (black)
        const borderOverlay = scene.add.rectangle(0, catBoxHeight - 1, catBoxWidth, 2, 0x000000).setOrigin(0);
        this.add(borderOverlay);

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

    addInventoryRow({ label, count = 0, rate = "", spacing = 10 }) {
        const labelText = this.scene.add.text(10, 0, label, {
            fontSize: '16px',
            color: '#ffffff'
        });
    
        let rateText = null;
        if (rate) {
            rateText = this.scene.add.text(150, 0, rate, {
                fontSize: '14px',
                color: '#aaaaaa'
            });
        }
    
        const countText = this.scene.add.text(0, 0, count.toString(), {
            fontSize: '16px',
            color: '#ffffff'
        });
    
        const updateCountText = (value) => {
            const textStr = value.toString();
            countText.setText(textStr);
    
            // Align to right within box
            const rightEdge = this._width - this._contentPadding;
            countText.x = rightEdge - countText.width;
        };
    
        updateCountText(count); // Initial alignment
    
        const rowHeight = Math.max(labelText.height, countText.height, rateText?.height || 0);
        const bg = this.scene.add.rectangle(5, this._currentY, this._width, rowHeight + 10, 0x1e1e1e)
            .setOrigin(0)
            .setStrokeStyle(1, 0x444444);
    
        labelText.y = this._currentY + 5;
        countText.y = labelText.y;
        if (rateText) rateText.y = labelText.y;
    
        this.contentArea.add([bg, labelText, countText]);
        if (rateText) this.contentArea.add(rateText);
    
        this._currentY += rowHeight + spacing;
    
        // Track internal value and expose with get/set
        let internalCount = count;
        return {
            labelText,
            countText,
            rateText,
            get count() {
                return internalCount;
            },
            set count(val) {
                internalCount = val;
                updateCountText(val);
            }
        };
    }

    updateInventoryCountText(countText, newValue) {
        countText.setText(newValue.toString());
    
        const newDigitLength = newValue.toString().length;
        if (newDigitLength > this._maxCountDigits) {
            this._maxCountDigits = newDigitLength;
            // Re-align all
            this._inventoryCountTexts.forEach(txt => {
                const charWidth = txt.width / txt.text.length;
                txt.x = this._width - this._contentPadding - charWidth * this._maxCountDigits;
            });
        } else {
            const charWidth = countText.width / newValue.toString().length;
            countText.x = this._width - this._contentPadding - charWidth * this._maxCountDigits;
        }
    }
}