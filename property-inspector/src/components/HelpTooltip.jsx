import clsx from "clsx";

const HelpTooltip = ({ children, position = "right" }) => {
  const positions = {
    top: "left-1/2 -translate-x-1/2 bottom-full mb-2",
    bottom: "left-1/2 -translate-x-1/2 top-full mt-2",
    right: "top-1/2 -translate-y-1/2 left-full ml-2",
    left: "top-1/2 -translate-y-1/2 right-full mr-2",
  };

  return (
    <div class="relative inline group">
      <div class="w-5 h-5 rounded-full flex items-center justify-center cursor-help border border-gray-600 text-gray-400 text-sm font-semibold hover:border-gray-500 transition-colors">
        ?
      </div>
      <div
        class={clsx(
          "invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute transform w-64 bg-gray-800 text-gray-200 text-sm rounded-lg p-3 shadow-xl/80 border border-steel-400 z-50 text-left",
          positions[position]
        )}
      >
        <div class="text-sm leading-relaxed flex flex-col gap-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HelpTooltip;
