const STYLES = {
    actionBoxColor: 0x000000,
};

export default class ActionBox extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height, config = {}) {
        super(scene, x, y);

        const {
            id = "",
            title = "Untitled",
            description = "",
            gain = "Gain",
            showButton = false,
            buttonLabel = "Do It",
            onAction = () => {}
        } = config;

        // Mutable states
        this._count = 0;
        // get/set variables
        this._id = id;
        this._gainTextValue = gain;

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

    get id() {
        return this._id;
    }

    get count() {
        return this._count;
    }

    set count(val) {
        this._count = val;
        this.updateGainText();
    }

    get gainTextValue() {
        return this._gainTextValue;
    }

    set gainTextValue(val) {
        this._gainTextValue = val;
        this.updateGainText();
    }

    updateGainText() {
        this.gainText.setText(`+${this._count} ${this._gainTextValue}`);
    }
}