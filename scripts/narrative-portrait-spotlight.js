// Constants for module configuration
const MODULE_NAME = 'narrative-portrait-spotlight';
const ANIMATION_DURATION = 1000;

// Initialize the module when Foundry is ready
Hooks.once('ready', () => {
    // Attach methods to the game object using the correct namespace
    game.NarrativePortraitSpotlight = {
        displayPortrait: async (tokenId, portraitUrl, show = true) => {
            try {
                const token = canvas.tokens.get(tokenId);
                if (!token) {
                    console.error('Token not found:', tokenId);
                    return;
                }

                // Get all users to show the effect to
                const users = game.users.filter(user => user.active);

                // If we're hiding an existing portrait
                if (!show) {
                    // Remove existing sequences for this token
                    Sequencer.EffectManager.endEffects({ name: `portrait-${tokenId}` });
                    return;
                }

                // Calculate screen dimensions
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;

                // Create a rectangle shape for the portrait background
                const points = [
                    [0, 0],
                    [screenWidth, 0],
                    [screenWidth, screenHeight],
                    [0, screenHeight]
                ];

                await Sequencer.Preloader.preloadForClients(portraitUrl);

                // Create and play the sequence
                await new Sequence()
                    // Background overlay
                    .effect()
                    .name(`portrait-${tokenId}-bg`)
                    .shape("rectangle", {
                        points,
                        fillColor: "#000000",
                        fillAlpha: 0.7
                    })
                    .screenSpace()
                    .screenSpacePosition({ x: 0, y: 0 })
                    .screenSpaceScale({ x: 1, y: 1 })
                    .screenSpaceAboveUI()
                    .duration(ANIMATION_DURATION)
                    .fadeIn(500)
                    .fadeOut(500)
                    .forUsers(users)
                    // Portrait image
                    .effect()
                    .name(`portrait-${tokenId}`)
                    .file(portraitUrl)
                    .screenSpace()
                    .screenSpacePosition({ x: screenWidth / 2, y: screenHeight / 2 })
                    .screenSpaceScale(() => {
                        // Calculate scale to fit within 80% of screen height
                        const maxHeight = screenHeight * 0.8;
                        const maxWidth = screenWidth * 0.8;
                        return Math.min(maxHeight / screenHeight, maxWidth / screenWidth);
                    })
                    .screenSpaceAnchor({ x: 0.5, y: 0.5 })
                    .screenSpaceAboveUI()
                    .duration(ANIMATION_DURATION)
                    .fadeIn(500)
                    .fadeOut(500)
                    .forUsers(users)
                    .play();

            } catch (error) {
                console.error('Error displaying portrait:', error);
            }
        }
    };
});