// Register socket for player visibility on all clients
Hooks.once('ready', () => {
    game.socket.on('module.portrait-display', PortraitDisplay.handlePortraitDisplay);
});

// Define your module namespace
const PortraitDisplay = (() => {

    function handlePortraitDisplay(data) {
        if (data.sceneId !== canvas.scene.id) return;

        const existingDisplay = document.querySelector(`#portrait-display-${data.tokenId}`);
        if (existingDisplay) {
            existingDisplay.style.animation = 'portraitFadeOut 1s';
            setTimeout(() => existingDisplay.remove(), 1000);
            if (!data.show) return;
        }

        if (!data.show) return;

        const portraitDiv = document.createElement('div');
        portraitDiv.id = `portrait-display-${data.tokenId}`;
        portraitDiv.innerHTML = `
            <style>
                /* Your CSS styles here */
            </style>
        `;

        const container = document.createElement('div');
        container.className = 'portrait-container';

        const img = document.createElement('img');
        img.src = data.portraitUrl;

        container.appendChild(img);
        portraitDiv.appendChild(container);
        document.body.appendChild(portraitDiv);
    }

    async function displayPortrait(tokenId, portraitUrl, show = true) {
        await game.socket.emit('module.portrait-display', {
            tokenId: tokenId,
            portraitUrl: portraitUrl,
            show: show,
            sceneId: canvas.scene.id
        });
        // Optionally handle local display
        PortraitDisplay.handlePortraitDisplay({
            tokenId: tokenId,
            portraitUrl: portraitUrl,
            show: show,
            sceneId: canvas.scene.id
        });
    }

    // Expose public methods
    return {
        displayPortrait,
        handlePortraitDisplay
    };

})();
