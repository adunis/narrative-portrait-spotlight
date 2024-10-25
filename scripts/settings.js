
Hooks.once('init', () => {
    // Define the module namespace

    console.log("Narrative Portrait Spotlight: Initializing settings...");

    const MODULE_NAME = "narrative-portrait-spotlight";

    // Register module settings
    game.settings.register(MODULE_NAME, "maxHeightPercent", {
        name: "Max Height Percentage",
        hint: "Maximum portrait height as a percentage of screen height (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0.7,
        range: {
            min: 0.1,
            max: 1,
            step: 0.05
        }
    });

    game.settings.register(MODULE_NAME, "maxWidthPercent", {
        name: "Max Width Percentage",
        hint: "Maximum portrait width as a percentage of screen width (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0.5,
        range: {
            min: 0.1,
            max: 1,
            step: 0.05
        }
    });

    game.settings.register(MODULE_NAME, "fadeTime", {
        name: "Fade Time",
        hint: "Duration of fade-in and fade-out animations in milliseconds.",
        scope: "world",
        config: true,
        type: Number,
        default: 500,
        range: {
            min: 100,
            max: 2000,
            step: 100
        }
    });

    game.settings.register(MODULE_NAME, "pcPosition", {
        name: "PC Base Position",
        hint: "Base X-position multiplier for player character (PC) portraits (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0.3,
        range: {
            min: 0,
            max: 1,
            step: 0.05
        }
    });

    game.settings.register(MODULE_NAME, "npcPosition", {
        name: "NPC Base Position",
        hint: "Base X-position multiplier for non-player character (NPC) portraits (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0.6,
        range: {
            min: 0,
            max: 1,
            step: 0.05
        }
    });

    game.settings.register(MODULE_NAME, "verticalPosition", {
        name: "Vertical Position",
        hint: "Base Y-position multiplier for all portraits (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0.5,
        range: {
            min: 0,
            max: 1,
            step: 0.05
        }
    });

    game.settings.register(MODULE_NAME, "offsetStep", {
        name: "Offset Step",
        hint: "Offset multiplier for arranging multiple portraits horizontally.",
        scope: "world",
        config: true,
        type: Number,
        default: 0.15,
        range: {
            min: 0.05,
            max: 0.25,
            step: 0.01
        }
    });

    game.settings.register(MODULE_NAME, "anchorPointX", {
        name: "Anchor Point X",
        hint: "Anchor point X for portrait positioning (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0,
        range: {
            min: 0,
            max: 1,
            step: 0.1
        }
    });

    game.settings.register(MODULE_NAME, "anchorPointY", {
        name: "Anchor Point Y",
        hint: "Anchor point Y for portrait positioning (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0.2,
        range: {
            min: 0,
            max: 1,
            step: 0.1
        }
    });

    game.settings.register(MODULE_NAME, "screenSpaceAboveUI", {
        name: "Portrait Above UI",
        hint: "Determine whether portraits appear above the UI.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register(MODULE_NAME, "effectNamePrefix", {
        name: "Effect Name Prefix",
        hint: "Prefix for naming portrait effects.",
        scope: "world",
        config: true,
        type: String,
        default: "portrait"
    });

    game.settings.register(MODULE_NAME, "logLevel", {
        name: "Log Level",
        hint: "Control the verbosity of logging.",
        scope: "client",
        config: true,
        type: String,
        choices: {
            "debug": "Debug",
            "info": "Info",
            "warn": "Warn",
            "error": "Error"
        },
        default: "debug"
    });

    // Custom Messages
    game.settings.register(MODULE_NAME, "noTokenSelectedMessage", {
        name: "No Token Selected Message",
        hint: "Message displayed when no token is selected.",
        scope: "client",
        config: true,
        type: String,
        default: "Please select at least one token!"
    });

    game.settings.register(MODULE_NAME, "noPortraitFoundMessage", {
        name: "No Portrait Found Message",
        hint: "Message displayed when no portrait image is found for a token.",
        scope: "client",
        config: true,
        type: String,
        default: "No portrait image found for {tokenName}"
    });

    game.settings.register(MODULE_NAME, "hidingPortraitMessage", {
        name: "Hiding Portrait Message",
        hint: "Message displayed when hiding a portrait.",
        scope: "client",
        config: true,
        type: String,
        default: "Hiding portrait for {tokenName}"
    });

    game.settings.register(MODULE_NAME, "displayingPortraitMessage", {
        name: "Displaying Portrait Message",
        hint: "Message displayed when displaying a portrait.",
        scope: "client",
        config: true,
        type: String,
        default: "Portrait displayed for {tokenName}"
    });

    console.log("Narrative Portrait Spotlight: All settings registered successfully.");

    // Register Handlebars helper outside of the init hook
    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });
});


async function showPortraitSpotlightConfig() {

    const MODULE_NAME = "narrative-portrait-spotlight";
    // Retrieve current settings
    const settings = {
        maxHeightPercent: game.settings.get(MODULE_NAME, "maxHeightPercent"),
        maxWidthPercent: game.settings.get(MODULE_NAME, "maxWidthPercent"),
        fadeTime: game.settings.get(MODULE_NAME, "fadeTime"),
        pcPosition: game.settings.get(MODULE_NAME, "pcPosition"),
        npcPosition: game.settings.get(MODULE_NAME, "npcPosition"),
        verticalPosition: game.settings.get(MODULE_NAME, "verticalPosition"),
        offsetStep: game.settings.get(MODULE_NAME, "offsetStep"),
        anchorPointX: game.settings.get(MODULE_NAME, "anchorPointX"),
        anchorPointY: game.settings.get(MODULE_NAME, "anchorPointY"),
        screenSpaceAboveUI: game.settings.get(MODULE_NAME, "screenSpaceAboveUI"),
        effectNamePrefix: game.settings.get(MODULE_NAME, "effectNamePrefix"),
        logLevel: game.settings.get(MODULE_NAME, "logLevel"),
        noTokenSelectedMessage: game.settings.get(MODULE_NAME, "noTokenSelectedMessage"),
        noPortraitFoundMessage: game.settings.get(MODULE_NAME, "noPortraitFoundMessage"),
        hidingPortraitMessage: game.settings.get(MODULE_NAME, "hidingPortraitMessage"),
        displayingPortraitMessage: game.settings.get(MODULE_NAME, "displayingPortraitMessage")
    };

    // Render the HTML template with current settings
    const template = "modules/portrait-spotlight/templates/config.html";
    const html = await renderTemplate(template, settings);

    // Create and display the dialog
    new Dialog({
        title: "Portrait Spotlight Configuration",
        content: html,
        buttons: {
            save: {
                icon: '<i class="fas fa-check"></i>',
                label: "Save",
                callback: (html) => {
                    // Extract form data
                    const form = html[0].querySelector("form");
                    const formData = new FormData(form);

                    // Iterate through form data and update settings
                    for (let [key, value] of formData.entries()) {
                        // Handle checkboxes
                        if (key === "screenSpaceAboveUI") {
                            value = form.querySelector(`input[name="${key}"]`).checked;
                        }
                        // Handle numerical inputs
                        else if ([
                            "maxHeightPercent",
                            "maxWidthPercent",
                            "fadeTime",
                            "pcPosition",
                            "npcPosition",
                            "verticalPosition",
                            "offsetStep",
                            "anchorPointX",
                            "anchorPointY"
                        ].includes(key)) {
                            value = parseFloat(value);
                        }

                        // Update the setting
                        game.settings.set(MODULE_NAME, key, value);
                    }

                    ui.notifications.info("Portrait Spotlight settings saved.");
                }
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
            }
        },
        default: "save",
        close: () => {}
    }).render(true);
}

// Optionally, register a settings menu to open the configuration dialog
Hooks.once('ready', () => {
    const MODULE_NAME = "portrait-spotlight";

    game.settings.registerMenu(MODULE_NAME, "configMenu", {
        name: "Portrait Spotlight Configuration",
        label: "Configure Portrait Spotlight",
        hint: "Adjust settings for Portrait Spotlight.",
        type: Object,
        restricted: false,
        config: false
    });

    Hooks.on("renderSettingsConfig", (app, html, data) => {
        if (app.object.object.name === MODULE_NAME) {
            // You can inject a button or link to open the custom config dialog
            const button = $(`<button class="configure-button">Open Portrait Spotlight Config</button>`);
            button.on('click', () => showPortraitSpotlightConfig());
            html.find('.settings-content').append(button);
        }
    });
});
