import { useState, useEffect, useRef } from "preact/hooks";
import HelpTooltip from "./components/HelpTooltip";

export function App() {
  const [pluginData, setPluginData] = useState(window.connectionData);
  const [value, setValue] = useState(0);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [pattern, setPattern] = useState(null);
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);

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

    function updateValuesFromSettings(settings) {
      if ("value" in settings) {
        setValue(settings.value);
      }
      if ("step" in settings) {
        setStep(settings.step);
      }
      if ("file" in settings) {
        setFile(settings.file);

        if (typeof settings.file === "string" && settings.file.length > 0) {
          setIsOutputExpanded(true);
        }
      }
      if ("pattern" in settings) {
        setPattern(settings.pattern);
      }
    }

    updateValuesFromSettings(settings);

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

        updateValuesFromSettings(newSettings);
      }
    };
  }, [setValue, setStep, setFile, setPattern, pluginData]);

  // Helper to send data to Stream Deck
  const saveSettings = (value, step, file, pattern) => {
    if (socketRef.current) {
      const payload = {
        event: "setSettings",
        context: contextRef.current,
        payload: {
          value,
          step,
          file,
          pattern,
        },
      };
      socketRef.current.send(JSON.stringify(payload));
    }
  };

  const handleValueChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setValue(val);
    saveSettings(val, step, file, pattern);
  };

  const handleStepChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setStep(val);
    saveSettings(value, val, file, pattern);
  };

  const handleFileChange = (e) => {
    let val = e.target.value;

    if (val === "") {
      val = null;
    }

    setFile(val);
    saveSettings(value, step, val, pattern);
  };

  const handlePatternChange = (e) => {
    let val = e.target.value;

    if (val === "") {
      val = null;
    }

    setPattern(val);
    saveSettings(value, step, file, val);
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

      <div class="text-steel-300 max-w-lg w-full space-y-4">
        <div class="text-center bg-gray-900 p-4 rounded-2xl shadow-2xl border border-gray-800">
          <div class="flex items-center justify-center gap-2">
            <label
              for="value"
              class="text-base uppercase tracking-wider font-semibold"
            >
              Current Value
            </label>
            <HelpTooltip>
              Change this to directly set the current value to whatever you
              want.
            </HelpTooltip>
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
                <HelpTooltip>
                  Configure how the counter changes with each button press. Can
                  be negative.
                </HelpTooltip>
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

        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          <button
            onClick={() => setIsOutputExpanded((oldVal) => !oldVal)}
            className="hover:cursor-pointer w-full p-5 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-steel-300">
                Output to File
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-steel-400 transition-transform ${
                isOutputExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isOutputExpanded && (
            <div className="px-5 pb-5 space-y-4 border-t border-gray-800">
              <div className="pt-4">
                <label
                  htmlFor="file"
                  className="text-sm font-semibold text-steel-300 block mb-2"
                >
                  File Path
                </label>
                <input
                  id="file"
                  type="text"
                  value={file}
                  onInput={handleFileChange}
                  placeholder="/path/to/output.txt"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-steel-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent"
                />
              </div>

              <div>
                <div class="flex gap-2">
                  <label
                    htmlFor="pattern"
                    className="text-sm font-semibold text-steel-300 block mb-2"
                  >
                    Pattern
                  </label>
                  <HelpTooltip>
                    What should be written to the file. <br />
                    Use <strong>&#123;&#125;</strong> as placeholder for the
                    counter value
                  </HelpTooltip>
                </div>
                <input
                  id="pattern"
                  type="text"
                  value={pattern}
                  onInput={handlePatternChange}
                  placeholder="Counter value is {}"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-steel-100 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-400 mt-2 italic">
                  Example :{" "}
                  {(pattern ?? "Counter value is {}").replaceAll("{}", "15")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
