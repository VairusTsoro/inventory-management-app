import { useState } from 'react';

function LightDarkSwitch() {
    const [theme, setTheme] = useState(document.documentElement.getAttribute('data-bs-theme') || 'light');

    return (
        <div className="form-check form-switch">
            <input
                className="form-check-input dark-light-theme-switch"
                type="checkbox"
                id="checkNativeSwitch"
                checked={theme === 'light'}
                onChange={e => {
                    const newTheme = e.target.checked ? 'light' : 'dark';
                    setTheme(newTheme);
                    document.documentElement.setAttribute('data-bs-theme', newTheme);
                }}
            />
            <label className="form-check-label" htmlFor="checkNativeSwitch">
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </label>
        </div>
    );
}

export default LightDarkSwitch;