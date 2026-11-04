export function formatDay(iso) {
  if (!iso) return "-"
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function formatTime(time) {
  const match = typeof time === "string" && time.trim().match(/^(\d{1,2}):(\d{2})/)
  if (!match) return time || "-"

  const hours = Number(match[1])
  const period = hours >= 12 ? "PM" : "AM"
  return `${hours % 12 || 12}:${match[2]} ${period}`
}

export function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("en-US")} EGP`
}

export function formatDateTime(iso) {
  if (!iso) return "-"
  return new Date(iso).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}