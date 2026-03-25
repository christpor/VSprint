export const DEMO_RESPONSES: Record<string, any> = {
  "react": {
    explanation: "Think of React like a Lego set. Instead of building one giant, solid castle, you build small, separate bricks (components) like windows, doors, and towers. Then, you snap them together to make your app.\n\nThis makes it super easy to fix one part without breaking the whole thing.",
    html: `<div id="root"></div>`,
    css: `body { 
  font-family: sans-serif; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  height: 100vh; 
  margin: 0; 
  background: #f0f2f5; 
}
#root { 
  background: white; 
  padding: 2rem; 
  border-radius: 1rem; 
  box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
}`,
    javascript: `// We're using React's "useState" to remember numbers
const { useState } = React;

function Counter() {
  const [count, setCount] = useState(0);

  return React.createElement('div', null, 
    React.createElement('p', null, 'You clicked ' + count + ' times'),
    React.createElement('button', { 
      onClick: () => setCount(count + 1),
      style: { padding: '10px 20px', cursor: 'pointer' }
    }, 'Click me')
  );
}

ReactDOM.render(React.createElement(Counter), document.getElementById('root'));`,
    logicBreakdown: "Step 1 — State Management\nWe use useState to create a count variable.\nThis tells React to watch this number and update the screen whenever it changes.\n\nStep 2 — User Interaction\nThe button has an onClick event that runs setCount.\nThis is how we tell React the user did something and the data needs to update.\n\nStep 3 — Rendering\nReact automatically re-draws the UI with the new number.\nYou don't have to manually change the text in the paragraph!",
    technicalWeakPoint: "A lot of beginners try to change the count directly like count = count + 1.\n\nWhat happens?\n→ The number changes in memory, but the screen stays the same.\n\nWhy?\n→ React only knows to re-draw when you use the setCount function.\n\nFix:\n→ Always use the setter function (setCount) to update your state.",
    drill: "Change the initial count from 0 to 10.\n\nWhat happens when you click the button now?\n\nDoes it start from 10 or 0?",
    nextSteps: ["How to add a reset button?", "What is useEffect?", "How to use props?"]
  },
  "flexbox": {
    explanation: "Think of Flexbox like a row of seats in a movie theater. You can tell the seats to spread out, bunch up in the middle, or align perfectly to the left or right.\n\nIt's the easiest way to make things sit exactly where you want them.",
    html: `<div class="container">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n</div>`,
    css: `.container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 200px;
  background: #e2e8f0;
  border-radius: 12px;
}

.item {
  width: 60px;
  height: 60px;
  background: #3b82f6;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  font-weight: bold;
}`,
    javascript: `// No JavaScript needed! Flexbox handles the layout all by itself.`,
    logicBreakdown: `Step 1 — The Container
We set display: flex on the parent div.
This turns on the "magic" that controls all the children inside.

Step 2 — Horizontal Alignment
justify-content: space-around spreads the items out evenly.
This makes sure there's equal breathing room between each box.

Step 3 — Vertical Alignment
align-items: center keeps everything perfectly centered from top to bottom.
This is usually the hardest thing to do without Flexbox!`,
    technicalWeakPoint: "A lot of beginners forget that justify-content depends on the flex-direction.\n\nWhat happens?\n→ You try to center things horizontally but they move vertically instead.\n\nWhy?\n→ If you set flex-direction: column, the main axis flips.\n\nFix:\n→ Remember that justify-content always follows the main axis of your container.",
    drill: "Change justify-content: space-around to justify-content: center.\n\nThen try justify-content: space-between.\n\nWhich one looks better for a navigation bar?",
    nextSteps: ["How to use CSS Grid?", "What is flex-wrap?", "How to center a div?"]
  }
};
