import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function CustomInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  name,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative w-full group">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            transition-all duration-300
            placeholder-gray-400
            ${isPassword ? "pr-10" : ""}
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 transition-transform duration-300"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 transform scale-100 group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <Eye className="w-5 h-5 transform scale-100 group-hover:scale-110 transition-transform duration-300" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
