# Narrative Portrait Spotlight

**Narrative Portrait Spotlight** is a Foundry VTT module designed to enhance your tabletop role-playing experience by dynamically displaying character portraits on the screen. This module distinguishes between Player Characters (PCs) and Non-Player Characters (NPCs), positioning their portraits strategically to provide clear visual cues during gameplay. Additionally, you can set a **custom background image** for added visual ambiance, enhancing immersion in key narrative moments.

![Screenshot 2024-10-25 131918](https://github.com/user-attachments/assets/0172a53b-7a9d-4bea-b0cf-d189dde3a788)

https://github.com/user-attachments/assets/402399d1-76a7-4787-b571-7957e20ecd14

https://github.com/user-attachments/assets/ec8e417e-0eef-4449-bfcc-354fb30d59bc


---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Adding a Portrait to the Spotlight](#adding-a-portrait-to-the-spotlight)
  - [Removing a Portrait from the Spotlight](#removing-a-portrait-from-the-spotlight)
  - [Toggling the Background Image](#toggling-the-background-image)
  - [Removing All Portrait Effects](#removing-all-portrait-effects)
- [Configuration](#configuration)
- [Support](#support)
- [License](#license)

---

## Features

- **Dynamic Portrait Display**: Automatically displays portraits for selected tokens.
- **PC and NPC Differentiation**:
  - **Player Characters (PCs)**: Defined as tokens with at least one user player owner, displayed on the **left** side of the screen.
  - **Non-Player Characters (NPCs)**: All other tokens, displayed on the **right** side of the screen.
- **Multiple Portrait Management**: Supports multiple PCs or NPCs by slightly offsetting their portraits to prevent overlap.
- **Custom Background Image**: Optionally set a custom background image to enhance the ambiance of scenes and key moments.
- **Resizing of Low-Resolution Images**: Automatically resizes low-resolution images to maintain clarity and consistency in portrait display.
- **Toggle Functionality**: Easily add or remove portraits and background images with a simple macro.
- **Remove All Portrait Effects**: Quickly remove all active portrait effects with a dedicated macro, useful for clearing the screen or troubleshooting.
- **Advanced Settings**: Configure various aspects of portrait display, including maximum size percentages, fade times, and logging verbosity.

---

## Installation

**Narrative Portrait Spotlight** can be installed by copying the `module.json` link from the [Releases](https://github.com/adunis/narrative-portrait-spotlight/releases) in Foundry VTT.

1. **Copy the Module URL**:
   - Navigate to the [Releases](https://github.com/adunis/narrative-portrait-spotlight/releases) page of the module.
   - Locate the latest release and copy the direct link to the `module.json` file.

2. **Install via Foundry VTT Interface**:
   - Open Foundry VTT and navigate to **Settings** > **Manage Modules**.
   - Click on **Install Module**.
   - Paste the copied `module.json` link into the URL field.
   - Click **Install**.

3. **Enable the Module**:
   - After installation, enable **Narrative Portrait Spotlight** in your game by checking the box next to the module in **Manage Modules**.
   - Click **Save Changes**.

---

## Usage

### Adding a Portrait to the Spotlight

1. **Select a Token**:
   - In your game scene, click on the token you wish to spotlight. This can be a **PC** (Player Character) or an **NPC** (Non-Player Character).

2. **Run the Macro**:
   - Open your **Compendium** or **Macros Directory**.
   - Locate the **"Toggle Portrait Spotlight"** macro included with the module.
   - Drag the macro to your **Hotbar** for easy access.
   - Click the macro button while the token is selected to add its portrait to the spotlight.

3. **Portrait Positioning**:
   - **Player Characters (PCs)**:
     - Portraits of PCs will appear on the **left** side of the screen.
     - If multiple PCs are spotlighted, their portraits will be slightly **offset vertically** to prevent overlap.
   - **Non-Player Characters (NPCs)**:
     - Portraits of NPCs will appear on the **right** side of the screen.
     - Multiple NPC portraits will also be **offset vertically** for clarity.

### Removing a Portrait from the Spotlight

1. **Select the Spotlighted Token**:
   - Click on the token whose portrait you wish to remove from the spotlight.

2. **Run the Macro Again**:
   - Click the **"Toggle Portrait Spotlight"** macro button while the token is selected.
   - The portrait will **fade out** and be removed from the spotlight display.

### Toggling the Background Image

1. **Run the Toggle Background Macro**:
   - Locate and run the **"Toggle Background Image"** macro.
   - If no background image is set, a file picker will appear, allowing you to select an image file to set as the background.
   - If a background is already set, running the macro will remove it, restoring the default view.

2. **Using the File Picker**:
   - Select an image through the file picker to set as the background.
   - Once chosen, the background image will immediately display, adding a custom visual effect to your scene.

### Removing All Portrait Effects

1. **Run the Macro**:
   - Locate the **"Remove All Portrait Effects"** macro in your **Macros Directory**.
   - Drag the macro to your **Hotbar** for easy access.
   - Click the macro button to remove all active portrait and background effects from the screen.

3. **Outcome**:
   - All portraits and the background image managed by **Narrative Portrait Spotlight** will be removed, clearing the screen of any spotlighted visuals.

---

## Configuration

**Narrative Portrait Spotlight** offers a variety of settings to customize the behavior and appearance of character portraits. These settings can be accessed and modified via the Foundry VTT **Settings** menu.

### Accessing Settings

1. **Navigate to Settings**:
   - In Foundry VTT, go to **Settings** > **Configure Settings** > **Module**.

2. **Locate Narrative Portrait Spotlight Settings**:
   - Find **Narrative Portrait Spotlight** in the list of modules.
   - Click on **Configure Narrative Portrait Spotlight** to open the configuration dialog.

### Available Settings

- **Max Height Percentage**:
  - **Description**: Sets the maximum portrait height as a percentage of the screen height.
  - **Range**: 0.1 to 1 (increments of 0.05)
  - **Default**: 0.7

- **Max Width Percentage**:
  - **Description**: Sets the maximum portrait width as a percentage of the screen width.
  - **Range**: 0.1 to 1 (increments of 0.05)
  - **Default**: 0.2

- **Fade Time**:
  - **Description**: Duration of fade-in and fade-out animations in milliseconds.
  - **Range**: 100 to 2000 (increments of 100)
  - **Default**: 500

- **PC Base Position**:
  - **Description**: Base X-position multiplier for player character (PC) portraits (0 to 1).
  - **Range**: 0 to 1 (increments of 0.05)
  - **Default**: 0.3

- **NPC Base Position**:
  - **Description**: Base X-position multiplier for non-player character (NPC) portraits (0 to 1).
  - **Range**: 0 to 1 (increments of 0.05)
  - **Default**: 0.6

- **Vertical Position**:
  - **Description**: Base Y-position multiplier for all portraits (0 to 1).
  - **Range**: 0 to 1 (increments of 0.05)
  - **Default**: 0.5

- **Offset Step**:
  - **Description**: Offset multiplier for arranging multiple portraits horizontally.
  - **Range**: 0.05 to 0.5 (increments of 0.05)
  - **Default**: 0.10

- **Anchor Point X**:
  - **Description**: Anchor point X for portrait positioning (0 to 1).
  - **Range**: 0 to 1 (increments of 0.1)
  - **Default**: 0

- **Anchor Point Y**:
  - **Description**: Anchor point Y for portrait positioning (0 to 1).
  - **Range**: 0 to 1 (increments of 0.1)
  - **Default**: 0.2

- **Portrait Above UI**:
  - **Description**: Determines whether portraits appear above the UI.
  - **Type**: Boolean
  - **Default**: false

- **Effect Name Prefix**:
  - **Description**: Prefix for naming portrait effects.
  - **Type**: String
  - **Default**: "portrait"

- **Log Level**:
  - **Description**: Controls the verbosity of logging.
  - **Choices**:
    - "debug": Debug
    - "info": Info
    - "warn": Warn
    - "error": Error
  - **Default**: "debug"

### Resizing Low-Resolution Images

**Narrative Portrait Spotlight** automatically handles the resizing of low-resolution images to ensure that portraits appear clear and consistent. The resizing parameters can be adjusted via the following settings:

- **Max Height Percentage**: Adjusts the maximum height of the portrait relative to the screen height.
- **Max Width Percentage**: Adjusts the maximum width of the portrait relative to the screen width.

### Adjusting Log Level

Control the verbosity of logs generated by the module:

- **Debug**: Detailed logs for development and troubleshooting.
- **Info**: General informational logs.
- **Warn**: Warning messages indicating potential issues.
- **Error**: Only error messages are logged.

---

## Support

If you encounter any issues or have suggestions for improvement, please create an issue here:

- **GitHub Issues**: [https://github.com/adunis/narrative-portrait-spotlight/issues](https://github.com/adunis/narrative-portrait-spotlight/issues)

---

## License

**Narrative Portrait Spotlight** is released under the [MIT License](LICENSE).

---
