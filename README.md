# Model Vista Interactive React

## Project Overview

This project is a 3D model viewer built with React, Vite, TypeScript, Three.js, and shadcn-ui.
It allows you to load, view, and interactively explore `.gltf` 3D models, including highlighting sub-parts of each model.

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or newer recommended)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

### Running the Development Server

Start the app in development mode (with hot reload):

```sh
npm run dev
```

- The app will be available at [http://localhost:8080](http://localhost:8080) (or the port shown in your terminal).

### Building for Production

To build the app for production:

```sh
npm run build
```

To preview the production build locally:

```sh
npm run preview
```

---

## 3D Model Usage

### Model File Structure

- Place your `.gltf` and corresponding `.bin` files in the `public/models/` directory.
- Example:
  ```
  public/models/
    model1.gltf
    model1.bin
    model21.gltf
    model21.bin
    model3.gltf
    model3.bin
  ```

### Converting CAD/STEP Files to `.gltf`

If you have CAD or STEP files, convert them to `.gltf` using a tool like [Blender](https://www.blender.org/) or [FreeCAD](https://www.freecad.org/):

1. **Open your CAD/STEP file in Blender or FreeCAD.**
2. **Export as `.gltf` (GL Transmission Format):**
   - In Blender: `File > Export > glTF 2.0 (.gltf/.glb)`
   - In FreeCAD: Use the `File > Export` dialog and select `.gltf`
3. **Copy the exported `.gltf` and `.bin` files to `public/models/`**

---

## Project Structure

- `src/` — React source code
- `public/models/` — Place your `.gltf` and `.bin` model files here
- `vite.config.ts` — Vite configuration (port 8080 by default)
- `tailwind.config.ts` — Tailwind CSS config

---

## Troubleshooting

- If models do not appear, ensure your `.gltf` and `.bin` files are correctly placed in `public/models/` and referenced in the UI.
- If you change model files, restart the dev server to clear cache.

---

## Technologies Used

- React, Vite, TypeScript
- Three.js, @react-three/fiber, @react-three/drei
- shadcn-ui, Tailwind CSS

---

## License

This project is for internal/demo use.
For questions or contributions, please open an issue or pull request.
