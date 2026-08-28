// Mini utilidad para concatenar clases condicionales sin dependencia externa.
export function clsx(...args) {
  return args.flat().filter(Boolean).join(" ");
}
