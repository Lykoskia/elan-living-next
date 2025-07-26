// Validation utilities for form submissions

export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

export const validatePhoneNumber = (phone: string): boolean => {
  const phonePattern = /^\+?[1-9]\d{6,14}$/
  return phonePattern.test(phone)
}

export const sanitizeInput = (input: string): string => {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}
