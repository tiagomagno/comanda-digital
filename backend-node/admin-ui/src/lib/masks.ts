/**
 * Máscaras e validações para campos de formulário.
 * Sempre avaliar e aplicar a máscara adequada a cada tipo de campo.
 *
 * Disponíveis:
 * - Telefone BR: applyTelefoneMask, formatTelefoneBR, telefoneToDigits
 * - E-mail: isValidEmail (validação); use type="email" + inputMode="email" no input
 * - Outros: onlyDigits (base para CPF, CEP etc. se necessário no futuro)
 */

/** Retorna apenas dígitos da string */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Máscara de telefone BR: (00) 00000-0000 (celular) ou (00) 0000-0000 (fixo).
 * Aceita até 11 dígitos.
 */
export function formatTelefoneBR(value: string): string {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Aplica máscara de telefone ao valor digitado (para uso em onChange). */
export function applyTelefoneMask(raw: string): string {
  return formatTelefoneBR(raw)
}

/**
 * Validação básica de e-mail (formato).
 */
export function isValidEmail(value: string): boolean {
  if (!value || !value.trim()) return false
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(value.trim())
}

/**
 * Remove formatação do telefone para armazenar apenas dígitos (opcional).
 */
export function telefoneToDigits(value: string): string {
  return onlyDigits(value)
}
