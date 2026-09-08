"use client"

import type React from "react"

interface InputProps {
  type?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  maxLength?: number
  disabled?: boolean
  id?: string
  step ?: string
  min ?: string
  max ?: string
}

export function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  maxLength,
  disabled = false,
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      disabled={disabled}
      className={`
        w-full px-3 py-2 border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}
      `}
    />
  )
}
