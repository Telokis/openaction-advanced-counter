import { useState, useEffect, useRef } from "preact/hooks";
import HelpTooltip from "./components/HelpTooltip";

export function App() {
  const [pluginData, setPluginData] = useState(window.connectionData);
  const [value, setValue] = useState(0);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [pattern, setPattern] = useState("Counter value is {}");

  // Use Refs to store non-visual state that persists across renders
  const socketRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    window.registerCallback((data) => {
      setPluginData(data);
    });
  }, [setPluginData]);

  useEffect(() => {
    if (!pluginData) {
      return;
    }

    const {
      inPort,
      inPropertyInspectorUUID,
      inRegisterEvent,
      inInfo,
      inActionInfo,
    } = pluginData;

    const ws = new WebSocket(`ws://localhost:${inPort}`);
    socketRef.current = ws;

    const actionInfo = JSON.parse(inActionInfo);
    contextRef.current = actionInfo.context;

    const settings = actionInfo.payload.settings;

    if ("value" in settings) {
      setValue(settings.value);
    }
    if ("step" in settings) {
      setStep(settings.step);
    }
    if ("file" in settings) {
      setFile(settings.file);
    }
    if ("pattern" in settings) {
      setPattern(settings.pattern);
    }

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: inRegisterEvent,
          uuid: inPropertyInspectorUUID,
        })
      );

      ws.send(
        JSON.stringify({
          event: "getSettings",
          context: contextRef.current,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "didReceiveSettings") {
        const newSettings = data.payload.settings;

        if (newSettings.value !== undefined) {
          setValue(newSettings.value);
        }
      }
    };
  }, [setValue, setStep, setFile, setPattern, pluginData]);

  // Helper to send data to Stream Deck
  const saveSettings = (newValue, newStep) => {
    if (socketRef.current) {
      const payload = {
        event: "setSettings",
        context: contextRef.current,
        payload: {
          value: parseInt(newValue) || 0,
          step: parseInt(newStep) || 1,
        },
      };
      socketRef.current.send(JSON.stringify(payload));
    }
  };

  const handleValueChange = (e) => {
    const val = e.target.value;
    setValue(val);
    saveSettings(val, step);
  };

  const handleStepChange = (e) => {
    const val = e.target.value;
    setStep(val);
    saveSettings(value, val);
  };

  return (
    <div class="bg-gray-950 min-h-screen flex flex-col items-center">
      <div class="w-full text-center mb-10 py-6 relative">
        <div
          class="absolute inset-0"
          style="background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-steel-300), transparent 85%) 15%, color-mix(in srgb, var(--color-steel-300), transparent 75%) 50%, color-mix(in srgb, var(--color-steel-300), transparent 85%) 85%, transparent 100%);"
        ></div>

        <h1 class="text-4xl font-bold tracking-tight relative z-10">
          <span class="text-white">Advanced</span>
          <span class="ml-2 text-steel-300">Counter</span>
        </h1>
      </div>

      <div class="text-steel-300 max-w-lg w-full">
        <div class="text-center mb-8 bg-gray-900 p-4 rounded-2xl shadow-2xl border border-gray-800">
          <div class="flex items-center justify-center gap-2">
            <label
              for="value"
              class="text-base uppercase tracking-wider font-semibold"
            >
              Current Value
            </label>
            <HelpTooltip text="Change this to directly set the current value to whatever you want." />
          </div>
          <input
            id="value"
            type="number"
            value={value}
            onInput={handleValueChange}
            class="border-b-3 border-steel-500 hover:border-steel-400 focus:border-steel-400 text-steel-400 hover:text-steel-300 focus:text-steel-300 w-full text-7xl font-bold bg-transparent text-center focus:outline-none focus:ring-0"
          />
        </div>

        <div class="bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center justify-center gap-2">
                <label
                  for="step"
                  class="text-base font-semibold text-steel-300 block"
                >
                  Step Increment
                </label>
                <HelpTooltip text="Configure how the counter changes with each button press. Can be negative." />
              </div>
              <p class="text-sm text-gray-300 mt-1">Change per step</p>
            </div>
            <input
              id="step"
              type="number"
              value={step}
              onInput={handleStepChange}
              class="w-24 p-3 text-center font-bold focus:outline-none focus:ring-0 border-b-2 border-b-steel-500 hover:border-steel-400 focus:border-steel-400 text-steel-400 hover:text-steel-300 focus:text-steel-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
