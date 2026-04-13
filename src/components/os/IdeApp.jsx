import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import World2D from './World2D';

export default function IdeApp() {
    const files = {
        'NexusAPI.java': { name: 'NexusAPI.java', language: 'java', value: `// Sistema DB Hospital\npublic class NexusAPI {\n  // Analizando datos...\n}` },
        'PromptEngine.py': { name: 'PromptEngine.py', language: 'python', value: `def ia_core():\n    return "Esperando input en el mundo 2D..."` },
        'App.jsx': { name: 'App.jsx', language: 'javascript', value: `// Arcade Mode Activo\nconsole.log("Insert Coin");` }
    };

    const [activeFile, setActiveFile] = useState(files['PromptEngine.py']);
    const [aiResponse, setAiResponse] = useState("");
    const handleWorldInteraction = async (mapObject) => {
        if (files[mapObject.file]) {
            setActiveFile(files[mapObject.file]);
            setAiResponse("K-Bot está analizando el código... 🧠");

            try {
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

                // Llamada a Gemini 1.5 Flash (la versión más rápida y gratuita)
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: `Analiza este código de Khaled: ${files[mapObject.file].value}. Explica en 2 frases qué hace y por qué es profesional.` }]
                        }]
                    })
                });

                const data = await response.json();

                // Verificamos que la IA respondió bien
                if (data.candidates && data.candidates[0].content.parts[0].text) {
                    const text = data.candidates[0].content.parts[0].text;

                    // Efecto máquina de escribir
                    let i = 0;
                    setAiResponse("");
                    const typing = setInterval(() => {
                        setAiResponse((prev) => prev + text[i]);
                        i++;
                        if (i >= text.length - 1) clearInterval(typing);
                    }, 30);
                } else {
                    setAiResponse("K-Bot: No he podido procesar el código. Revisa la API Key.");
                }

            } catch (err) {
                console.error("ERROR IA:", err);
                setAiResponse("K-Bot: Error de conexión con el satélite.");
            }
        }
    };

    return (
        <div className="ide-app" style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', overflow: 'hidden' }}>

            {/* PANEL IZQUIERDO: Editor + K-BOT */}
            <div style={{ flex: '1 1 50%', borderRight: '2px solid #333', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                
                {/* Cabecera del archivo */}
                <div style={{ background: '#1e1e1e', padding: '10px 15px', color: '#4fc1ff', borderBottom: '1px solid #333', fontFamily: 'monospace' }}>
                    📄 {activeFile.name}
                </div>

                {/* Zona de Código (70%) */}
                <div style={{ flex: '0 0 70%', position: 'relative' }}>
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        language={activeFile.language}
                        value={activeFile.value}
                        options={{ minimap: { enabled: false }, fontSize: 14, readOnly: true }}
                    />
                </div>

                {/* ZONA K-BOT (30%) - AQUÍ ES DONDE SALE LA IA */}
                <div style={{ flex: '1 1 30%', background: '#0a0a0f', borderTop: '2px solid #333', padding: '15px', color: '#4af626', fontFamily: 'monospace', overflowY: 'auto' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '5px', color: '#888' }}>
                        [SISTEMA_IA_K-BOT_ACTIVO]
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4', color: '#4af626' }}>
                        {aiResponse || "> Esperando interacción en el Mundo 2D..."}
                    </p>
                </div>
            </div>

            {/* PANEL DERECHO: Mundo 2D */}
            <div style={{ flex: '1 1 50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, overflow: 'hidden' }}>
                <World2D onInteract={handleWorldInteraction} />
            </div>

        </div>
    );
}