export const Currencies = [
  {value: "USD", label: "$ Dollar", locale: "en-US"},
  {value: "SGD", label: "$ Singaporean Dollar", locale: "en-SG"},
  {value: "IDR", label: "Rp. Rupiah", locale: "id-ID"},
]

export type Currency = (typeof Currencies)[0];