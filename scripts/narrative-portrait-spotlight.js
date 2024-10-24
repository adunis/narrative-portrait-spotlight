// narrative-portrait-spotlight.js

Hooks.once('ready', () => {
    console.log("Narrator Portrait Spotlight module initializing.");

    class PortraitSpotlight {
        constructor() {
            this.debug = true;
        }

        /**
         * Displays or hides a portrait for a given token.
         * @param {string} tokenId - The ID of the token.
         * @param {string} portraitUrl - The URL of the portrait image.
         * @param {boolean} show - Whether to show or hide the portrait.
         */
        async displayPortrait(tokenId, portraitUrl, show = true) {
            try {
                const token = canvas.tokens.get(tokenId);
                if (!token) {
                    console.error('Token not found:', tokenId);
                    return;
                }

                const userIds = game.users.filter(user => user.active).map(user => user.id);

                if (!show) {
                    // Remove existing sequences for this token
                    await Sequencer.EffectManager.endEffects({ name: `portrait-${tokenId}` });
                    await Sequencer.EffectManager.endEffects({ name: `portrait-${tokenId}-bg` }); // End the background effect
                    if (this.debug) console.log(`Hiding portrait for token ${token.name}`);
                    return;
                }

                if (this.debug) {
                    console.log('Displaying portrait for token:', {
                        tokenId,
                        tokenName: token.name,
                        portraitUrl
                    });
                }

                // Verify the image exists and can be loaded
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = () => reject(new Error(`Failed to load image: ${portraitUrl}`));
                    img.src = portraitUrl;
                });

                if (this.debug) console.log('Image pre-loaded successfully');

                // Preload the image for all clients
                try {
                    await Sequencer.Preloader.preloadForClients(portraitUrl);
                    if (this.debug) console.log('Image preloaded for clients');
                } catch (error) {
                    console.error('Failed to preload image for clients:', error);
                    // Decide whether to proceed without preloading
                }

                // Calculate screen dimensions
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;

                // Calculate scale to fit within 60% of screen dimensions
                const scaleValue = 0.6; // Adjust as needed

                // Determine if the token is a PC or NPC
                const isPC = token.actor?.hasPlayerOwner; // Adjust based on your game system

                // Set horizontal position and anchor based on PC or NPC
                let positionX;
                let anchorX;

                if (isPC) {
                    // PC: Left side
                    positionX = screenWidth * 0.2; // 20% from the left
                    anchorX = 0; // Anchor to the left edge of the image
                } else {
                    // NPC: Right side
                    positionX = screenWidth * 0.8; // 80% from the left (20% from the right)
                    anchorX = 0; // Anchor to the right edge of the image
                }

                // Determine positionY based on image aspect ratio
                let positionY;
                const aspectRatio = img.width / img.height;

                if (aspectRatio > 0.9 && aspectRatio < 1.1) {
                    // Square image: place higher
                    positionY = screenHeight * 0.3; // 30% from the top
                    if (this.debug) console.log(`Aspect Ratio: ${aspectRatio.toFixed(2)} (Square) - Position Y set to ${positionY}`);
                } else if (aspectRatio < 0.9) {
                    // Portrait image: taller than wide
                    positionY = screenHeight * 0.5; // Center vertically
                    if (this.debug) console.log(`Aspect Ratio: ${aspectRatio.toFixed(2)} (Portrait) - Position Y set to ${positionY}`);
                } else {
                    // Landscape or other aspect ratios: adjust as needed
                    positionY = screenHeight * 0.4; // 40% from the top
                    if (this.debug) console.log(`Aspect Ratio: ${aspectRatio.toFixed(2)} (Landscape/Other) - Position Y set to ${positionY}`);
                }

                const anchorY = 0.3; // Center vertically

                // Create and play the sequence
                await new Sequence()
                    // Portrait image
                    .effect()
                        .name(`portrait-${tokenId}`)
                        .file(portraitUrl)
                        .screenSpace()
                        .screenSpacePosition({ x: positionX, y: positionY })
                        .screenSpaceScale({ scale: scaleValue })
                        .screenSpaceAnchor({ x: anchorX, y: anchorY })
                        .screenSpaceAboveUI()
                        .fadeIn(500)
                        .persist()
                        .forUsers(userIds)
                    .play();

                if (this.debug) console.log('Sequence played successfully');

            } catch (error) {
                console.error('Error displaying portrait:', error);
                ui.notifications.error(`Failed to display portrait: ${error.message}`);
            }
        }

        /**
         * Toggles portraits for all selected tokens.
         */
        async togglePortraitsForSelectedTokens() {
            try {
                if (this.debug) console.log('Toggling portraits for selected tokens');

                const selectedTokens = canvas.tokens.controlled;
                if (selectedTokens.length === 0) {
                    ui.notifications.warn("Please select at least one token!");
                    return;
                }

                for (const token of selectedTokens) {
                    const tokenId = token.id;

                    // Get the portrait URL with fallbacks
                    const portraitUrl = (() => {
                        // Check token texture first
                        if (token.texture?.src) {
                            return token.texture.src;
                        }

                        // Then check actor's image
                        if (token.actor?.img) {
                            return token.actor.img;
                        }

                        // Finally check prototype token image
                        if (token.actor?.prototypeToken?.texture?.src) {
                            return token.actor.prototypeToken.texture.src;
                        }

                        return null;
                    })();

                    if (!portraitUrl) {
                        ui.notifications.warn(`No portrait image found for ${token.name}`);
                        if (this.debug) console.log(`No portrait URL for token ${token.name}`);
                        continue;
                    }

                    // Check if a portrait is already displayed for this token
                    const existingPortrait = Sequencer.EffectManager.getEffects({ name: `portrait-${tokenId}` });
                    const isShowing = existingPortrait && existingPortrait.length > 0;

                    // Display or hide the portrait
                    await this.displayPortrait(tokenId, portraitUrl, !isShowing);

                    // Show feedback
                    ui.notifications.info(
                        isShowing
                            ? `Hiding portrait for ${token.name || 'selected token'}`
                            : `Showing portrait for ${token.name || 'selected token'}`
                    );
                }
            } catch (error) {
                console.error("Portrait Spotlight Error:", error);
                ui.notifications.error("An error occurred while toggling the portrait. Check the console for details.");
            }
        }
    }

    // Register the class instance globally
    game.PortraitSpotlight = new PortraitSpotlight();

    if (game.PortraitSpotlight.debug) {
        console.log("Portrait Spotlight initialized with debugging enabled");
    }
});
