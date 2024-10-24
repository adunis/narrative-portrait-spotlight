# Narrator Portrait Spotlight

**Narrator Portrait Spotlight** is a Foundry VTT module designed to enhance your tabletop role-playing experience by dynamically displaying character portraits on the screen. This module distinguishes between Player Characters (PCs) and Non-Player Characters (NPCs), positioning their portraits strategically to provide clear visual cues during gameplay.


https://github.com/user-attachments/assets/9b46d134-84dc-445d-9bb5-3ff819ba8ba3


---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Adding a Portrait to the Spotlight](#adding-a-portrait-to-the-spotlight)
  - [Removing a Portrait from the Spotlight](#removing-a-portrait-from-the-spotlight)
- [Support](#support)
- [License](#license)

---

## Features

- **Dynamic Portrait Display**: Automatically displays portraits for selected tokens.
- **PC and NPC Differentiation**:
  - **Player Characters (PCs)**: Defined as tokens with at least one user player owner, displayed on the **left** side of the screen.
  - **Non-Player Characters (NPCs)**: All other tokens, displayed on the **right** side of the screen.
- **Multiple Portrait Management**: Supports multiple PCs or NPCs by slightly offsetting their portraits to prevent overlap.
- **Toggle Functionality**: Easily add or remove portraits from the spotlight using a simple macro.

---

### Prerequisites

- **Sequencer**: This module requires the [Sequencer](https://foundryvtt.com/packages/sequencer/) module to function properly. Make sure Sequencer is installed and enabled before installing Narrator Portrait Spotlight.

---

## Installation

**Narrator Portrait Spotlight** can be installed by copying the `module.json` link from the [Releases](https://github.com/your-repo/narrator-portrait-spotlight/releases) in Foundry VTT.

1. **Copy the Module URL**:
   - Navigate to the [Releases](https://github.com/your-repo/narrator-portrait-spotlight/releases) page of the module.
   - Locate the latest release and copy the direct link to the `module.json` file.

2. **Install via Foundry VTT Interface**:
   - Open Foundry VTT and navigate to **Settings** > **Manage Modules**.
   - Click on **Install Module**.
   - Paste the copied `module.json` link into the URL field.
   - Click **Install**.

3. **Enable the Module**:
   - After installation, enable **Narrator Portrait Spotlight** in your game by checking the box next to the module in **Manage Modules**.
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

---

## Support

If you encounter any issues or have suggestions for improvement, please create an issue here:

- **GitHub Issues**: [[[narrator-portrait-spotlight/issues]([https://github.com/your-repo/narrator-portrait-spotlight/issues)](https://github.com/adunis/narrative-portrait-spotlight/issues))](https://github.com/adunis/narrative-portrait-spotlight/issues)](https://github.com/adunis/narrative-portrait-spotlight/issues)

---

## License

**Narrator Portrait Spotlight** is released under the [MIT License](LICENSE).

---

*Enhance your storytelling and keep track of your characters effortlessly with Narrator Portrait Spotlight!*
