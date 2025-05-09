    createActionBoxList(startX, startY) {
        //const startX = this.uiRightSide.x - 1; // ContainerX
        //const startY = 100; // ContainerY
        const width = this.uiRightSide.width + 2;
        const height = this.worldHeight - 99;
        const titleHeight = 50;

        // Create the container to group the box and its contents
        const container = this.add.container(startX, startY);
        
        // Box background
        const boxRect = this.add.rectangle(0, 0, width, height, UI_STYLES.mainBoxColor)
            .setOrigin(0);
        boxRect.setStrokeStyle(2, 0xffffff);
        
        // Box title
        const boxRectTitle = this.add.rectangle(boxRect.x, boxRect.y, width, titleHeight, UI_STYLES.titleBoxColor)
            .setOrigin(0);
        boxRectTitle.setStrokeStyle(2, 0xffffff);
       
        // Title text centered at the top
        const titleText = this.add.text(
            width / 2, 15, // X centered, Y a bit down from top
            "Gather Area",
            {
                fontSize: UI_STYLES.fontSizeLarge,
                color: UI_STYLES.textColor,
                align: 'center'
            }
        ).setOrigin(0.5, 0); // Center X, top Y

        // Add everything to container
        container.add([boxRect, boxRectTitle, titleText]);
        
        // Add boxes to gatherBox
        const stackX = 1;
        const stackY = titleHeight + 2;
        const stackW = width - 4;

        const boxList = new ActionBoxList(this, container, stackX, stackY, stackW, 6);

        // Toggle contents
        boxRectTitle.setInteractive();
        titleText.setInteractive();
        
        const toggle = () => {
            boxList.toggleVisibility();
        };
        
        boxRectTitle.on('pointerdown', toggle);
        titleText.on('pointerdown', toggle);

        this.uiRightElements.add(container);

        return boxList;
    }