// scripts/portrait-spotlight.js

Hooks.once('ready', () => {
    class PortraitSpotlight {
        constructor() {
            // Fetch the current log level from settings
            this.logLevel = game.settings.get("narrative-portrait-spotlight", "logLevel");
        }

        /**
         * Logs messages based on the current log level.
         * @param {string} message - The message to log.
         * @param {object} data - Additional data to log.
         * @param {string} level - The level of the log ('debug', 'info', 'warn', 'error').
         */
        log(message, data = '', level = 'debug') {
            const levels = ['debug', 'info', 'warn', 'error'];
            const currentLevelIndex = levels.indexOf(this.logLevel);
            const messageLevelIndex = levels.indexOf(level);

            if (messageLevelIndex >= currentLevelIndex) {
                const formattedMessage = `Narrative Portrait Spotlight | ${message}`;
                switch (level) {
                    case 'debug':
                        console.debug(formattedMessage, data);
                        break;
                    case 'info':
                        console.info(formattedMessage, data);
                        break;
                    case 'warn':
                        console.warn(formattedMessage, data);
                        break;
                    case 'error':
                        console.error(formattedMessage, data);
                        break;
                    default:
                        console.log(formattedMessage, data);
                }
            }
        }

        /**
         * Preloads an image to retrieve its dimensions.
         * @param {string} url - The URL of the image to preload.
         * @returns {Promise<object>} - An object containing the width and height of the image.
         */
        preloadImage(url) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve({ width: img.width, height: img.height });
                img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
                img.src = url;
            });
        }

        /**
         * Calculates the position for a portrait based on configuration settings.
         * @param {boolean} isPC - Indicates if the token is a Player Character.
         * @param {number} screenWidth - The width of the screen.
         * @param {number} screenHeight - The height of the screen.
         * @param {number} count - The number of existing portraits.
         * @returns {object} - An object containing the x and y coordinates.
         */
        getPortraitPosition(isPC, screenWidth, screenHeight, count) {
            const pcPosition = game.settings.get("narrative-portrait-spotlight", "pcPosition");
            const npcPosition = game.settings.get("narrative-portrait-spotlight", "npcPosition");
            const verticalPosition = game.settings.get("narrative-portrait-spotlight", "verticalPosition");
            const offsetStep = game.settings.get("narrative-portrait-spotlight", "offsetStep");

            const baseX = screenWidth * (isPC ? pcPosition : npcPosition);
            const baseY = screenHeight * verticalPosition;
            const offset = count * (isPC ? -offsetStep : offsetStep) * screenWidth;
            return { x: baseX + offset, y: baseY };
        }

        /**
         * Retrieves the portrait URL from a token.
         * @param {object} token - The token object.
         * @returns {string|null} - The URL of the portrait image or null if not found.
         */
        getPortraitUrl(token) {
            return token.texture?.src || token.actor?.img || token.actor?.prototypeToken?.texture?.src || null;
        }

        /**
         * Displays or hides a portrait for a given token.
         * @param {object} token - The token object.
         * @param {boolean} show - Whether to show or hide the portrait.
         */
        async displayPortrait(token, show = true) {
            const portraitUrl = this.getPortraitUrl(token);
            if (!portraitUrl) {
                this.log(game.settings.get("narrative-portrait-spotlight", "noPortraitFoundMessage").replace("{tokenName}", token.name), '', 'warn');
                return;
            }

            const isPC = token.actor?.hasPlayerOwner;
            const effectNamePrefix = game.settings.get("narrative-portrait-spotlight", "effectNamePrefix");
            const effectName = `${effectNamePrefix}-${isPC ? 'pc' : 'npc'}-${token.id}`;

            if (!show) {
                await Sequencer.EffectManager.endEffects({ name: effectName });
                this.log(game.settings.get("narrative-portrait-spotlight", "hidingPortraitMessage").replace("{tokenName}", token.name), '', 'info');
                return;
            }

            try {
                const { width, height } = await this.preloadImage(portraitUrl);
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;

                const maxHeightPercent = game.settings.get("narrative-portrait-spotlight", "maxHeightPercent");
                const maxWidthPercent = game.settings.get("narrative-portrait-spotlight", "maxWidthPercent");
                const fadeTime = game.settings.get("narrative-portrait-spotlight", "fadeTime");

                const scale = Math.min(
                    (screenHeight * maxHeightPercent) / height,
                    (screenWidth * maxWidthPercent) / width
                );

                const existingCount = Sequencer.EffectManager.getEffects()
                    .filter(effect => effect.data.name.startsWith(`${effectNamePrefix}-${isPC ? 'pc' : 'npc'}-`)).length;

                const position = this.getPortraitPosition(isPC, screenWidth, screenHeight, existingCount);

                const anchorPoint = {
                    x: game.settings.get("narrative-portrait-spotlight", "anchorPointX"),
                    y: game.settings.get("narrative-portrait-spotlight", "anchorPointY")
                };
                const screenSpaceAboveUI = game.settings.get("narrative-portrait-spotlight", "screenSpaceAboveUI");
                const activeUsersFilter = true;

                await new Sequence()
                    .effect()
                        .name(effectName)
                        .file(portraitUrl)
                        .screenSpace()
                        .screenSpacePosition(position)
                        .screenSpaceScale({ x: scale, y: scale })
                        .screenSpaceAnchor(anchorPoint)
                        .screenSpaceAboveUI(screenSpaceAboveUI)
                        .fadeIn(fadeTime)
                        .fadeOut(fadeTime)
                        .zIndex(0) 
                        .persist()
                        .forUsers(activeUsersFilter 
                            ? game.users.filter(u => u.active).map(u => u.id) 
                            : game.users.map(u => u.id))
                    .play();

                this.log(game.settings.get("narrative-portrait-spotlight", "displayingPortraitMessage").replace("{tokenName}", token.name), { position, scale }, 'info');
            } catch (error) {
                console.error('Narrative Portrait Spotlight Error:', error);
                ui.notifications.error(`Failed to display portrait: ${error.message}`);
            }
        }

        /**
         * Toggles the portrait spotlight for all selected tokens.
         */
        async togglePortraitsForSelectedTokens() {
            const selectedTokens = canvas.tokens.controlled;
            if (!selectedTokens.length) {
                ui.notifications.warn(game.settings.get("narrative-portrait-spotlight", "noTokenSelectedMessage"));
                return;
            }

            for (const token of selectedTokens) {
                const isPC = token.actor?.hasPlayerOwner;
                const effectNamePrefix = game.settings.get("narrative-portrait-spotlight", "effectNamePrefix");
                const effectName = `${effectNamePrefix}-${isPC ? 'pc' : 'npc'}-${token.id}`;
                const isShowing = Sequencer.EffectManager.getEffects({
                    name: effectName
                }).length > 0;
                await this.displayPortrait(token, !isShowing);
            }
        }

        /**
         * Adds a background image to the screen.
         */
        async addBackground(imageUrl = null) {


            // If imageUrl is not provided, use the one from settings
            const backgroundUrl = imageUrl;

            const fadeTime = 2000;
            const zIndex = -10;
            const effectName = "background-image";

            // Check if background is already active
            const isActive = Sequencer.EffectManager.getEffects({ name: effectName }).length > 0;
            if (isActive) {
                this.log("Background image is already active.", '', 'info');
                return;
            }

            try {
                // Preload the background image to ensure it's valid
                const { width: imgWidth, height: imgHeight } = await this.preloadImage(imageUrl);

                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;

                // Calculate scale to ensure the image covers the entire screen
                const scaleX = screenWidth / imgWidth;
                const scaleY = screenHeight / imgHeight;
                const scale = Math.max(scaleX, scaleY); // Use the larger scale to cover the screen

                await new Sequence()
                    .effect()
                        .name(effectName)
                        .file(backgroundUrl)
                        .screenSpace()
                        .screenSpacePosition({ x: 0.5, y: 0.5 })
                        .screenSpaceScale({ x: scale, y: scale})
                        .screenSpaceAnchor({ x: 0.5, y: 0.5 })
                        .screenSpaceAboveUI(false) // Ensure it's below UI
                        .fadeIn(fadeTime)
                        .fadeOut(fadeTime)
                        .persist()
                        .zIndex(zIndex)
                        .forUsers(game.users.map(u => u.id))
                    .play();

                this.log("Background image added successfully.", '', 'info');
            } catch (error) {
                this.log(`Failed to add background image: ${error.message}`, '', 'error');
                ui.notifications.error(`Failed to add background image: ${error.message}`);
            }
        }

        /**
         * Removes the background image from the screen.
         */
        async removeBackground() {
            const effectName = "background-image";

            const isActive = Sequencer.EffectManager.getEffects({ name: effectName }).length > 0;
            if (!isActive) {
                this.log("Background image is not active.", '', 'info');
                return;
            }

            try {
                await Sequencer.EffectManager.endEffects({ name: effectName });
                this.log("Background image removed successfully.", '', 'info');
            } catch (error) {
                this.log(`Failed to remove background image: ${error.message}`, '', 'error');
                ui.notifications.error(`Failed to remove background image: ${error.message}`);
            }
        }
    }

    
    // Initialize the PortraitSpotlight instance
    game.narrativePortraitSpotlight = new PortraitSpotlight();

    // Example: Bind the toggle function to a hotkey or a UI button as needed
    // For instance, you can create a macro that calls:
    // game.narrativePortraitSpotlight.togglePortraitsForSelectedTokens();
});
