const HelpTooltip = ({ children }) => {
  return (
    <div class="relative inline group">
      <div class="w-5 h-5 rounded-full flex items-center justify-center cursor-help border border-gray-600 text-gray-400 text-sm font-semibold hover:border-gray-500 transition-colors">
        ?
      </div>
      <div class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-64 bg-gray-800 text-gray-200 text-sm rounded-lg p-3 shadow-xl border border-steel-500 z-50 text-center">
        <p class="text-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
};

export default HelpTooltip;
