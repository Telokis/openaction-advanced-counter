import { useState, useEffect, useRef } from "preact/hooks";

export function App() {
  const [pluginData, setPluginData] = useState(window.connectionData);
  const [value, setValue] = useState(0);
  const [step, setStep] = useState(1);

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
  }, [setValue, setStep, pluginData]);

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
    <div class="bg-gray-900 text-gray-200 p-4 font-sans text-base">
      <div class="flex flex-col gap-4">
        <div class="flex items-center">
          <label for="value" class="mr-1">
            Current value:
          </label>
          <input
            id="value"
            value={value}
            onInput={handleValueChange}
            type="number"
            class="p-1 bg-gray-800 border border-gray-600 rounded w-24 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div class="flex items-center">
          <label for="step" class="mr-1">
            Step:
          </label>
          <input
            id="step"
            value={step}
            onInput={handleStepChange}
            type="number"
            class="p-1 bg-gray-800 border border-gray-600 rounded w-24 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
