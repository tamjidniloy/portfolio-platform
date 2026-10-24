/**
 * Only a specifically configured private IPv4 CIDR can supply trusted proxy headers.
 * Never set Express trust proxy to true or trust arbitrary public forwarders.
 * Without a configured reverse proxy, Express uses the socket peer address.
 */
export function trustedProxySubnet(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !/^(?:\d{1,3}\.){3}\d{1,3}\/(?:\d|[12]\d|3[0-2])$/.test(value))
    throw new Error("TRUST_PROXY_CIDR must be an explicit IPv4 CIDR");
  const [address, prefix] = value.split("/");
  if (address.split(".").some(s => Number(s) > 255 || !/^\d{1,3}$/.test(s)))
    throw new Error("TRUST_PROXY_CIDR has invalid octets");
  if (Number(prefix) < 16 || Number(prefix) > 32)
    throw new Error("TRUST_PROXY_CIDR must be a scoped subnet, not a public network");
  const first = Number(address.split(".")[0]);
  if (first !== 10 && !(first === 172 && Number(address.split(".")[1]) >= 16 && Number(address.split(".")[1]) <= 31)
    && !(first === 192 && Number(address.split(".")[1]) === 168)
    && !(address === "127.0.0.1" && prefix === "32"))
    throw new Error("TRUST_PROXY_CIDR must use an authorized private subnet");
  return value;
}
