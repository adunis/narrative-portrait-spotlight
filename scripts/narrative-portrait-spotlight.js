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
                    sceneId: canvas.scene?.id,
                    userId: game.user.id  // Add user ID for permission checking
                };

                // If user is GM, emit to all clients, otherwise request GM to emit
                if (game.user.isGM) {
                    // Emit directly as GM
                    game.socket.emit(SOCKET_EVENT, {
                        ...data,
                        gmApproved: true
                    });
                    // Handle local display
                    handlePortraitDisplay(data);
                } else {
                    // Players send a request to GM
                    game.socket.emit(SOCKET_EVENT, {
                        ...data,
                        type: 'request'
                    });
                }

            } catch (error) {
                console.error('Error displaying portrait:', error);
            }
        }
    };

    // Register socket listener
    game.socket.on(SOCKET_EVENT, (data) => {
        // Handle player requests (GM only)
        if (data.type === 'request' && game.user.isGM) {
            // GM validates and broadcasts to all clients
            const token = canvas.tokens.get(data.tokenId);
            if (token && token.actor && game.users.get(data.userId)?.character?.id === token.actor.id) {
                // Player owns this token, approve and broadcast
                game.socket.emit(SOCKET_EVENT, {
                    ...data,
                    type: undefined,
                    gmApproved: true
                });
                handlePortraitDisplay(data);
            }
            return;
        }

        // Handle approved displays
        if (data.gmApproved) {
            handlePortraitDisplay(data);
        }
    });
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

/**
 * Fades out and removes an element
 * @param {HTMLElement} element - The element to remove
 * @returns {Promise} Resolves when the animation is complete
 */
function fadeOutAndRemove(element) {
    return new Promise(resolve => {
        const container = element.querySelector('.portrait-container');
        container.classList.add('fadeout');
        setTimeout(() => {
            element.remove();
            resolve();
        }, ANIMATION_DURATION);
    });
}

/**
 * Handles the display of the portrait based on the socket event data
 * @param {Object} data - Data received from the socket event
 */
async function handlePortraitDisplay(data) {
    try {
        // Validate data
        if (!data || !data.tokenId || !data.portraitUrl) {
            console.error('Invalid portrait data received:', data);
            return;
        }

        // Check if we're in the correct scene
        if (data.sceneId !== canvas.scene?.id) {
            return;
        }

        // Handle existing portrait
        const existingDisplay = document.querySelector(`#portrait-display-${data.tokenId}`);
        if (existingDisplay) {
            await fadeOutAndRemove(existingDisplay);
            if (!data.show) return;
        }

        // Return if we're hiding the portrait
        if (!data.show) return;

        // Create and display new portrait
        const portraitElement = createPortraitElement(data.tokenId, data.portraitUrl);
        document.body.appendChild(portraitElement);

    } catch (error) {
        console.error('Error handling portrait display:', error);
    }
}