const STYLES = {
    actionBoxColor: 0x000000,
};

export default class ActionBox extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height, config = {}) {
        super(scene, x, y);

        const {
            active = false,
            id = "",
            title = "Untitled",
            description = "",
            gain = "Gain",
            showButton = false,
            buttonLabel = "Do It",
            targetRow = null,
            onAction = null,
        } = config;

        // Mutable states
        this._gain = 1;
        this._count = 0;
        this._targetRow = config.targetRow || null;
        // get/set variables
        this._id = id;
        this._gainTextValue = gain;
        this._active = active;

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
        this.gainText = scene.add.text(20, gainY, gain, {
            fontSize: '14px',
            color: 'lightgreen'
        });
        this.gainText.setText(`+${this._gain} ${this._gainTextValue}`);
        this.add(this.gainText);

        // Action Button
        if (showButton) {
            const buttonY = height - 30;
            const btn = scene.add.text(width / 2, buttonY, buttonLabel, {
                fontSize: '16px',
                backgroundColor: '#e74c3c',
                padding: { x: 10, y: 5 },
                color: '#ffffff'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => this.handleAction());
            this.add(btn);
        }

        scene.add.existing(this);
    }

    handleAction() {
        this._count += this._gain;
        if (this._targetRow) {
            this._targetRow.count = this._count;
        }
        console.log(`Gathering +${this._gain} ${this._gainTextValue} Count: ${this._count}`);
    }

    get id() {
        return this._id;
    }

    get gain() {
        return this._gain;
    }
    
    get count() {
        return this._count;
    }
    
    get active() {
        return this._active;
    }

    get gainTextValue() {
        return this._gainTextValue;
    }

    set gain(val) {
        this._gain = val;
        this.updateGainText();
    }

    set gainTextValue(val) {
        this._gainTextValue = val;
        this.updateGainText();
    }
    
    set count(val) {
        this._count = val;
        if (this._targetRow) {
            this._targetRow.count = val;
        }
    }
    
    set active(val) {
        this._active = true;
    }

    updateGainText() {
        let label = this._gainTextValue;
        if (this._gain > 1) {
            label += 's';
        }
        this.gainText.setText(`+${this._gain} ${label}`);
    }
}