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
                @keyframes portraitFadeIn {
                    from { 
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.9);
                    }
                    to { 
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                @keyframes portraitFadeOut {
                    from { 
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    to { 
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.9);
                    }
                }
                .portrait-container {
                    position: fixed;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 100000;
                    animation: portraitFadeIn 1s ease;
                    box-shadow: 0 0 30px rgba(0,0,0,0.8);
                    border-radius: 15px;
                    pointer-events: none;
                }
                .portrait-container.fadeout {
                    animation: portraitFadeOut 1s ease;
                }
                .portrait-container img {
                    width: 1000px;
                    height: 1000px;
                    object-fit: cover;
                    border-radius: 15px;
                }
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
