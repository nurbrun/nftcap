export function accountURL(accountInput) {
  const URLSchematic = "https://wax.api.atomicassets.io/atomicassets/v1/accounts?match={{walletAddres}}";
  return URLSchematic.replace('{{walletAddres}}',accountInput)
}
export function baseURL(accountInput) {
  const URLSchematic = "https://wax.api.atomicassets.io/atomicassets/v1/assets?owner={{walletAddres}}";
  return URLSchematic.replace('{{walletAddres}}',accountInput)
}

export function templateSalesURL(templateInput) {
  const URLSchematic = "https://wax.api.atomicassets.io/atomicmarket/v1/prices/sales?template_id={{templateID}}";
  return URLSchematic.replace('{{templateID}}',templateInput)
}

export function templateDataURL(templateInput) {
  const URLSchematic = "https://wax.api.atomicassets.io/atomicassets/v1/assets?template_id={{templateID}}&page=1&limit=1&order=desc&sort=asset_id";
  return URLSchematic.replace('{{templateID}}',templateInput)
}