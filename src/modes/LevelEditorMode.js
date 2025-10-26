import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * LevelEditorMode Component
 * Create and share custom puzzle levels
 */
import { useGameStore } from '../hooks/useGameStore';
const LevelEditorMode = () => {
    const returnToMenu = useGameStore((state) => state.returnToMenu);
    return (_jsxs("div", { className: "coming-soon", children: [_jsx("h1", { children: "Level Editor" }), _jsx("p", { children: "Coming Soon: Create Your Own Challenges" }), _jsx("p", { children: "Build and share custom puzzle levels with the community" }), _jsx("button", { onClick: returnToMenu, children: "Return to Menu" })] }));
};
export default LevelEditorMode;
