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
                    await Sequencer.EffectManager.endEffects({ name: `portrait-pc-${tokenId}` });
                    await Sequencer.EffectManager.endEffects({ name: `portrait-npc-${tokenId}` });
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

                        // Define maximum height in pixels based on percentage
               const maxHeight = screenHeight * 0.7;

                // Calculate the scale factor to ensure the image does not exceed maxHeight
                let scaleValue = 0.5; 

                if (img.height > maxHeight) {
                    scaleValue = maxHeight / img.height;
                    if (this.debug) console.log(`Image height (${img.height}px) exceeds maxHeight (${maxHeight}px). Scaling by ${scaleValue}.`);
                } else {

                    const scaleUpFactor = maxHeight / img.height;
                    scaleValue = scaleUpFactor;
                    if (this.debug) console.log(`Image height (${img.height}px) is below maxHeight (${maxHeight}px). Scaling up by ${scaleValue}.`);
                }

                // Determine if the token is a PC or NPC
                const isPC = token.actor?.hasPlayerOwner; // Adjust based on your game system

                // Set horizontal position and anchor based on PC or NPC
                let typeStr;
                let basePositionX;
                let anchorX;

                if (isPC) {
                    typeStr = 'pc';
                    basePositionX = screenWidth * 0.2; // 20% from the left
                    anchorX = 0; // Anchor to the left edge of the image
                } else {
                    typeStr = 'npc';
                    basePositionX = screenWidth * 0.7; // 80% from the left (20% from the right)
                    anchorX = 0; // Anchor to the right edge of the image
                }

                // Get existing portraits of this type
                const allEffects = Sequencer.EffectManager.getEffects();
                const existingPortraits = allEffects.filter(effect => effect.data.name.startsWith(`portrait-${typeStr}-`));
                const count = existingPortraits.length;

                // Determine horizontal shift based on count
                let shiftPercent = 0;
                switch (count) {
                    case 0:
                        shiftPercent = 0;
                        break;
                    case 1:
                        shiftPercent = isPC ? -0.15 : 0.15; // Slightly left for PC, slightly right for NPC
                        break;
                    case 2:
                        shiftPercent = isPC ? 0.15 : -0.15; // Slightly right for PC, slightly left for NPC
                        break;
                    case 3:
                        shiftPercent = isPC ? -0.15 : 0.15; // Greatly left for PC, greatly right for NPC
                        break;
                    case 4:
                        shiftPercent = isPC ? 0.15 : -0.15; // Greatly right for PC, greatly left for NPC
                        break;
                    default:
                        // For more than 4, cycle or set a default shift
                        shiftPercent = isPC ? 0.10 : -0.10;
                        break;
                }

                // Calculate final positionX with shift
                const positionX = basePositionX + (screenWidth * shiftPercent);
                const positionY = this.determinePositionY(img.width, img.height, screenHeight, scaleValue);                const anchorY = 0.2; // Center vertically

                // Determine effect name
                const effectName = `portrait-${typeStr}-${tokenId}`;

                // Create and play the sequence
                await new Sequence()
                    // Portrait image
                    .effect()
                        .name(effectName)
                        .file(portraitUrl)
                        .screenSpace()
                        .screenSpacePosition({ x: positionX, y: positionY })
                        .screenSpaceScale({ scale: scaleValue })
                        .screenSpaceAnchor({ x: anchorX, y: anchorY })
                        .screenSpaceAboveUI(false)
                        .fadeIn(500)
                        .fadeOut(500) 
                        .persist()
                        .forUsers(userIds)
                    .play();

                if (this.debug) console.log(`Sequence for ${effectName} played successfully at (${positionX}, ${positionY})`);

            } catch (error) {
                console.error('Error displaying portrait:', error);
                ui.notifications.error(`Failed to display portrait: ${error.message}`);
            }
        }

/**
 * Determines the vertical position based on the image aspect ratio and scaled height.
 * @param {number} width - Image width in pixels.
 * @param {number} height - Image height in pixels.
 * @param {number} screenHeight - Height of the screen in pixels.
 * @param {number} scaleValue - Scaling factor applied to the image.
 * @returns {number} - Y position for the portrait in pixels.
 */
determinePositionY(width, height, screenHeight, scaleValue) {
    const aspectRatio = width / height;
    const scaledHeight = height * scaleValue;

    // Define a reference height for adjustment (you can tweak this value)
    const referenceHeight = 500; // pixels

    // Calculate the difference between scaled height and reference height
    const heightDifference = scaledHeight - referenceHeight;

    // Define maximum and minimum adjustments
    const maxAdjustment = 1000;  // pixels upward
    const minAdjustment = -1000; // pixels downward

    // Calculate adjustment proportional to height difference
    const adjustment = (heightDifference / referenceHeight) * -300; // Multiplier can be adjusted

    // Clamp the adjustment to prevent excessive movement
    const clampedAdjustment = Math.min(Math.max(adjustment, minAdjustment), maxAdjustment);

    // Determine base Y position based on aspect ratio
    let baseY;
    if (aspectRatio > 0.9 && aspectRatio < 1.1) {
        // Square image: place higher
        baseY = screenHeight * 0.3; // 30% from the top
    } else if (aspectRatio < 0.9) {
        // Portrait image: place centered
        baseY = screenHeight * 0.5; // 50% from the top
    } else {
        // Landscape or other aspect ratios: place slightly lower
        baseY = screenHeight * 0.4; // 40% from the top
    }

    // Adjust Y position based on image height
    const finalY = baseY - clampedAdjustment;

    if (this.debug) {
        console.log(`Aspect Ratio: ${aspectRatio.toFixed(2)}, Scaled Height: ${scaledHeight}px, Adjustment: ${clampedAdjustment}px, Final Y: ${finalY}px`);
    }

    return finalY;
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

                    // Determine if the token is a PC or NPC
                    const isPC = token.actor?.hasPlayerOwner;
                    const typeStr = isPC ? 'pc' : 'npc';

                    // Check if a portrait is already displayed for this token
                    const effectName = `portrait-${typeStr}-${tokenId}`;
                    const existingPortrait = Sequencer.EffectManager.getEffects({ name: effectName });
                    const isShowing = existingPortrait && existingPortrait.length > 0;

                    // Display or hide the portrait
                    await this.displayPortrait(tokenId, portraitUrl, !isShowing);

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


