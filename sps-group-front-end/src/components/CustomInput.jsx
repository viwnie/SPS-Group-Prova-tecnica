import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function CustomInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300'
          }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
