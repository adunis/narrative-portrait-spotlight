Hooks.once('init', () => {
    console.log("Narrator Portrait Spotlight module initializing.");
  
class PortraitSpotlight {
    constructor() {
        // Initialize the portraitStageList as a module-level variable
        this.portraitStageList = [];
    }

    async displayPortrait(tokenId, portraitUrl) {
        try {
            const token = canvas.tokens.get(tokenId);
            if (!token) {
                console.error('Token not found:', tokenId);
                return;
            }

            const userIds = game.users.filter(user => user.active).map(user => user.id);

            await Sequencer.Preloader.preloadForClients(portraitUrl);

            // Create and play the sequence for the portrait
            await new Sequence()
                .effect()
                .name(`portrait-${tokenId}`)
                .file(portraitUrl)
                .screenSpace()
                .screenSpaceAnchor({ x: 0.5, y: 0.5 })
                .screenSpaceAboveUI()
                .fadeIn(500)
                .persist()
                .forUsers(userIds)
                .play();

        } catch (error) {
            console.error('Error displaying portrait:', error);
        }
    }

    async updatePortraitPositions() {
        try {
            // Get all currently displayed effects
            const allEffects = Sequencer.EffectManager.getEffects();

            // Filter the effects to get only portrait effects
            const portraitEffects = allEffects.filter(effect => /^portrait-\w+$/.test(effect.data.name));

            // Extract token IDs from the effect names
            const tokenIds = portraitEffects.map(effect => {
                const match = effect.data.name.match(/portrait-(\w+)$/);
                return match ? match[1] : null;
            }).filter(id => id != null);

            // Remove duplicates
            const uniqueTokenIds = [...new Set(tokenIds)];
            const numPortraits = uniqueTokenIds.length;
            const userIds = game.users.filter(user => user.active).map(user => user.id);

            // Handle background effect
            const bgEffect = Sequencer.EffectManager.getEffects({ name: 'portrait-background' });

            if (numPortraits === 0) {
                // No portraits displayed, remove background if it exists
                if (bgEffect && bgEffect.length > 0) {
                    Sequencer.EffectManager.endEffects({ name: 'portrait-background' });
                }
                return;
            } else {
                // Portraits are displayed, ensure background is present
                if (!bgEffect || bgEffect.length === 0) {
                    // Create the background effect
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;

                    new Sequence()
                        .effect()
                        .name('portrait-background')
                        .shape("rectangle", {
                            width: screenWidth,
                            height: screenHeight,
                            fillColor: "#000000",
                            fillAlpha: 0.7
                        })
                        .screenSpace()
                        .screenSpacePosition({ x: screenWidth / 2, y: screenHeight / 2 })
                        .screenSpaceAnchor({ x: 0.5, y: 0.5 })
                        .screenSpaceAboveUI()
                        .fadeIn(500)
                        .persist()
                        .forUsers(userIds)
                        .play();
                }
            }

            // Calculate positions
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            const VERTICAL_POSITION = 0.75; // 75% down the screen
            const yPos = screenHeight * VERTICAL_POSITION;

            let positions = [];
            let scales = [];

            if (numPortraits === 1) {
                // Full size at center
                positions.push({ x: screenWidth / 2, y: yPos });
                scales.push(1); // Full scale
            } else if (numPortraits === 2) {
                // Two portraits, left and right
                positions.push({ x: screenWidth / 3, y: yPos });
                positions.push({ x: (2 * screenWidth) / 3, y: yPos });
                scales.push(0.8, 0.8);
            } else {
                // More than two portraits
                const spacing = screenWidth / (numPortraits + 1);
                for (let i = 0; i < numPortraits; i++) {
                    const xPos = spacing * (i + 1);
                    positions.push({ x: xPos, y: yPos });
                    scales.push(0.6); // Smaller scale for more portraits
                }
            }

            // Update positions and scales of all portraits
            for (let i = 0; i < uniqueTokenIds.length; i++) {
                const tokenId = uniqueTokenIds[i];
                const position = positions[i];
                const scale = scales[i];

                const effects = portraitEffects.filter(effect => effect.data.name === `portrait-${tokenId}`);
                for (const effect of effects) {
                    effect.update({
                        screenSpacePosition: position,
                        screenSpaceScale: { scale: scale },
                    });
                }
            }

        } catch (error) {
            console.error('Error updating portrait positions:', error);
        }
    }

    async togglePortraitsForSelectedTokens() {
        try {
            // Get selected tokens
            const selectedTokens = canvas.tokens.controlled;

            if (selectedTokens.length === 0) {
                ui.notifications.warn("Please select at least one token!");
                return;
            }

            // Get all existing portrait effects
            const allEffects = Sequencer.EffectManager.getEffects();
            const existingPortraitEffects = allEffects.filter(effect => /^portrait-\w+$/.test(effect.data.name));
            const existingTokenIds = existingPortraitEffects.map(effect => {
                const match = effect.data.name.match(/portrait-(\w+)$/);
                return match ? match[1] : null;
            }).filter(id => id != null);

            // Initialize portraitStageList
            this.portraitStageList = [];

            // For each selected token
            for (const token of selectedTokens) {
                const tokenId = token.id;
                const index = existingTokenIds.indexOf(tokenId);
                if (index !== -1) {
                    // Token had a portrait displayed, remove it
                    Sequencer.EffectManager.endEffects({ name: `portrait-${tokenId}` });
                    existingTokenIds.splice(index, 1); // Remove from existingTokenIds
                    ui.notifications.info(`Hiding portrait for ${token.name || 'selected token'}`);
                } else {
                    // Token did not have a portrait, add it to portraitStageList
                    this.portraitStageList.push(tokenId);
                    ui.notifications.info(`Showing portrait for ${token.name || 'selected token'}`);
                }
            }

            // Add the remaining existingTokenIds to portraitStageList
            this.portraitStageList.push(...existingTokenIds);

            // Now for each tokenId in portraitStageList, display the portrait
            for (const tokenId of this.portraitStageList) {
                const token = canvas.tokens.get(tokenId);
                if (!token) {
                    console.error('Token not found:', tokenId);
                    continue;
                }

                // Check if the portrait is already displayed
                const isAlreadyDisplayed = allEffects.some(effect => effect.data.name === `portrait-${tokenId}`);
                if (isAlreadyDisplayed) continue; // Skip if already displayed

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
                    ui.notifications.error(`No valid portrait image found for the token ${token.name}!`);
                    continue;
                }

                // Display the portrait
                await this.displayPortrait(tokenId, portraitUrl);
            }

            // After updating the portraits, update positions
            await this.updatePortraitPositions();

        } catch (error) {
            console.error("Portrait Spotlight Error:", error);
            ui.notifications.error("An error occurred while showing the portrait. Check the console for details.");
        }
    }
}

  // Register the class instance globally so it can be accessed by macros
  game.PortraitSpotlight = new PortraitSpotlight();

  console.log("Narrator Portrait Spotlight module initialized.");
});