// Constants for module configuration
const MODULE_NAME = 'narrative-portrait-spotlight';
const SOCKET_EVENT = `module.${MODULE_NAME}`;
const ANIMATION_DURATION = 1000;

/**
 * Class to handle portrait display functionality
 */
class NarrativePortraitSpotlight {
    static initialize() {
        // Initialize the module when Foundry is ready
        Hooks.once('ready', () => {
            // Attach instance to game object
            game.portraitSpotlight = new NarrativePortraitSpotlight();
            
            // Register socket listener
            game.socket.on(SOCKET_EVENT, (data) => game.portraitSpotlight.handlePortraitDisplay(data));
        });
    }

    /**
     * Creates the CSS styles for the portrait display
     * @returns {HTMLStyleElement}
     */
    createStyles() {
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
    createPortraitElement(tokenId, portraitUrl) {
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
        portraitDiv.appendChild(this.createStyles());
        portraitDiv.appendChild(container);
        
        return portraitDiv;
    }

    /**
     * Handles the display of the portrait based on the socket event data
     * @param {Object} data - Data received from the socket event
     */
    async handlePortraitDisplay(data) {
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
                await this.fadeOutAndRemove(existingDisplay);
                if (!data.show) return;
            }

            // Return if we're hiding the portrait
            if (!data.show) return;

            // Create and display new portrait
            const portraitElement = this.createPortraitElement(data.tokenId, data.portraitUrl);
            document.body.appendChild(portraitElement);

        } catch (error) {
            console.error('Error handling portrait display:', error);
        }
    }

    /**
     * Fades out and removes an element
     * @param {HTMLElement} element - The element to remove
     * @returns {Promise} Resolves when the animation is complete
     */
    fadeOutAndRemove(element) {
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
     * Displays a portrait to all connected clients
     * @param {string} tokenId - The ID of the token
     * @param {string} portraitUrl - The URL of the portrait image
     * @param {boolean} show - Whether to show or hide the portrait
     */
    async displayPortrait(tokenId, portraitUrl, show = true) {
        try {
            const data = {
                tokenId,
                portraitUrl,
                show,
                sceneId: canvas.scene?.id
            };

            // Emit socket event to all clients
            await game.socket.emit(SOCKET_EVENT, data);
            
            // Handle local display
            await this.handlePortraitDisplay(data);

        } catch (error) {
            console.error('Error displaying portrait:', error);
        }
    }
}

// Initialize the module
NarrativePortraitSpotlight.initialize();

// Export for module use
export const portraitSpotlight = NarrativePortraitSpotlight;