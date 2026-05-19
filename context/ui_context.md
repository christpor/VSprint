# 🎨 UI & Design Context

## Visual Identity
- **Vibe:** "Elite Tech" meets "Cinematic Depth".
- **Primary Colors:** Sky Blue (#0ea5e9) to Indigo (#6366f1) gradients.
- **Dark Mode:** Deep slate backgrounds with cyan/blue accents and subtle glassmorphism.
- **Shapes:** Large border-radii (2xl, 3xl) and consistent padding (p-4, p-6, p-8).

## Component Design Tokens
- **Cards/Items:** White/80 (light) or Zinc/90 (dark) with backdrop-blur-2xl.
- **Borders:** Slate-200/50 (light) or White/10 (dark).
- **Shadows:** Soft Indigo/Blue glows for interactive elements.
- **Buttons:** Gradient backgrounds with hover scaling (1.05) and active scaling (0.95).

## Animation Rules (Motion 12)
- **Entrance:** Staggered fade-in/y-axis slide (y: 20 to 0).
- **Glow System:** Dynamic mouse-following radial gradients to provide depth.
- **Typing Effect:** AI explanations must type out character-by-character (approx. 15ms per char) to simulate a real-time coach experience.

## Layout Logic
- **Responsiveness:** Mobile-first approach. Sidebar is hidden on mobile and transforms into a slide-over menu.
- **Density:** High-density logic views. Use tabs (HTML, CSS, JS, Preview) to keep the UI clean while providing deep content.
