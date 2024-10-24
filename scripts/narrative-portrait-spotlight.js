// Constants for module configuration
const MODULE_NAME = 'narrative-portrait-spotlight';
const SOCKET_EVENT = `module.${MODULE_NAME}`;
const ANIMATION_DURATION = 1000;

// Initialize the module when Foundry is ready
Hooks.once('ready', () => {
    // Attach methods to the game object using the correct namespace
    game.NarrativePortraitSpotlight = {
        displayPortrait: async (tokenId, portraitUrl, show = true) => {
            try {
                const data = {
                    tokenId,
                    portraitUrl,
                    show,
                    sceneId: canvas.scene?.id
                };

                // Emit socket event to all clients
                game.socket.emit(SOCKET_EVENT, data);
                
                // Handle local display
                handlePortraitDisplay(data);

            } catch (error) {
                console.error('Error displaying portrait:', error);
            }
        }
    };

    // Register socket listener
    game.socket.on(SOCKET_EVENT, handlePortraitDisplay);
});

/**
 * Creates the CSS styles for the portrait display
 * @returns {HTMLStyleElement}
 */
function createStyles() {
    const style = document.createElement('style');
    style.textContent = `
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
            animation: portraitFadeIn ${ANIMATION_DURATION}ms ease;
            box-shadow: 0 0 30px rgba(0,0,0,0.8);
            border-radius: 15px;
            pointer-events: none;
            background-color: rgba(0, 0, 0, 0.8);
            padding: 10px;
        }
        
        .portrait-container.fadeout {
            animation: portraitFadeOut ${ANIMATION_DURATION}ms ease;
        }
        
        .portrait-container img {
            max-width: 800px;
            max-height: 800px;
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 10px;
        }
    `;
    return style;
}

/**
 * Creates the portrait display element
 * @param {string} tokenId - The ID of the token
 * @param {string} portraitUrl - The URL of the portrait image
 * @returns {HTMLElement}
 */
function createPortraitElement(tokenId, portraitUrl) {
    const portraitDiv = document.createElement('div');
    portraitDiv.id = `portrait-display-${tokenId}`;
    
    const container = document.createElement('div');
    container.className = 'portrait-container';
    
    const img = document.createElement('img');
    img.src = portraitUrl;
    img.alt = 'Character Portrait';
    
    // Add error handling for image loading
    img.onerror = () => {
        console.error(`Failed to load portrait image: ${portraitUrl}`);
        portraitDiv.remove();
    };
    
    container.appendChild(img);
    portraitDiv.appendChild(createStyles());
    portraitDiv.appendChild(container);
    
    return portraitDiv;
}