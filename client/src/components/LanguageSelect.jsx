import { useState } from "react";

const autoTranslatePage = async (lang) => {
    const elements = document.querySelectorAll('[data-translate]');
    try {
        for (let el of elements) {
            const text = el.innerText;
            const res = await fetch(`/api/translate?text=${encodeURIComponent(text)}&lang=${lang}`);
            const data = await res.json();
            el.innerText = data.translatedText;
        }
    } catch (error) {
        console.error('Error during translation:', error);
    }
}

function LanguageSelect() {
    const [language, setLanguage] = useState('en');

    return (
        <div className="mb-3">
            <label htmlFor="languageSelect" className="form-label">Choose Language</label>
            <select className="form-select" id="languageSelect" aria-label="Language select" value={language} onChange={e => {
                setLanguage(e.target.value);
                autoTranslatePage(e.target.value);
            }}>
                <option value="en">English</option>
                <option value="zh">Chinese (Mandarin)</option>
                <option value="ja">Japanese</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="ar">Arabic</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
            </select>
        </div>
    )
}

export default LanguageSelect;