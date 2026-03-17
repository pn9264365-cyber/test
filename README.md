# TileVision AI Interiors

A premium interior design application using Google Gemini 2.5 Flash and Gemini 3 Pro to visualize flooring and tile changes in real-time.

## Project Workflow

The application follows a linear, user-friendly flow designed to guide a homeowner or designer from concept to visualization:

1.  **Onboarding**: 
    - The user defines the room type (e.g., "Living Room").
    - Selects a design aesthetic (e.g., "Modern Minimalist").
    - Chooses an initial color palette based on that aesthetic.
2.  **Image Upload**:
    - The user uploads a photo of their existing room.
    - **Note**: Large images are automatically resized client-side to prevent API payload errors.
3.  **AI Estimation**:
    - `gemini-2.5-flash` analyzes the uploaded image to estimate the visible floor area in square feet automatically.
4.  **Visualization (The Core)**:
    - `gemini-3-pro-image-preview` is used to generate a photorealistic version of the room with the new flooring applied.
    - The prompt is dynamically constructed using the user's preferences (Finish, Grout Style, Color).
5.  **Refinement**:
    - Users can switch colors using the "Recommended" vs "All Others" tabs.
    - Users can change finishes (Matte, Glossy, etc.).
    - A comparison slider allows checking the Before vs After state.
6.  **Cost Estimation**:
    - Based on the AI-estimated area and selected materials, a price estimation is shown (in INR).

## File Structure & Responsibilities

### Core Components
*   **`App.tsx`**: The main entry point. Handles routing (Home, Collections, Visualizer) and checks for the Google API Key.
*   **`components/VisualizerTool.tsx`**: The brain of the application. Manages state for the image upload, color selection, and orchestrates the AI generation calls. It contains the logic for splitting colors into "Recommended" and "All Others".
*   **`components/Onboarding.tsx`**: A multi-step wizard collecting user preferences before the main visualizer loads.
*   **`components/ComparisonSlider.tsx`**: A UI component that overlays the generated image on the original with a draggable handle.
*   **`components/CostEstimator.tsx`**: A calculator component that takes the AI-derived area and applies pricing logic.

### Services
*   **`services/geminiService.ts`**: Handles all interactions with the Google GenAI SDK.
    *   `fileToBase64`: resizing logic.
    *   `estimateFloorArea`: Text generation call.
    *   `generateTilePreview`: Image generation call.

### Static Data
*   **`types.ts`**: TypeScript definitions for consistent data modeling.
*   **`metadata.json`**: Configuration for the sandbox environment.

## Technical Challenges & Solutions

### 1. "RPC Failed / XHR Error" (Payload Too Large)
**Problem**: Sending raw 4K or high-res images from modern smartphones directly to the Gemini API often triggers a `400 Bad Request` or a network drop because the base64 payload exceeds the allowable request size limits (approx 4MB for standard requests, though theoretically higher, browser/network constraints often interfere).

**Solution**: implemented in `services/geminiService.ts`:
```typescript
const MAX_SIZE = 800; // Resize max dimension to 800px
// ... canvas scaling logic ...
const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Compress to 70% quality
```
We aggressively resize the image on the client side using an HTML Canvas before sending it to the API. This ensures the payload is small enough for a fast response while maintaining enough detail for the AI to understand the room structure.

### 2. Intelligent Color Sorting
**Problem**: Users were overwhelmed by seeing 50+ color shades in a single list, many of which clashed with their chosen design style.

**Solution**:
We implemented a dynamic categorization system in `VisualizerTool.tsx`.
- **Logic**: When onboarding is complete, we capture the `designStyle`.
- **Mapping**: We define a `STYLE_COLOR_MAP` that associates styles with specific colors.
- **Set Theory**: 
    - `Recommended` = `STYLE_COLOR_MAP[userStyle]`
    - `All Others` = `MASTER_PALETTE` (all colors) minus `Recommended`.
- **UI**: Displayed as two simple tabs, defaulting to "Recommended" for a streamlined experience.

### 3. Cost Estimation Input
**Problem**: Users rarely know the exact square footage of their room just by looking at a photo.
**Solution**: We utilize `gemini-2.5-flash` to "look" at the image and estimate the floor area. This provides a starting number for the Cost Estimator, which the user can then fine-tune manually.

## API Usage
This project uses the `@google/genai` SDK.
- **Flash 2.5**: Used for fast text reasoning (Area estimation).
- **Pro 3.0 Image Preview**: Used for the high-fidelity image editing tasks.
