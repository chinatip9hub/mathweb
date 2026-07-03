const thaiDateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "long",
});

const thaiDateTimeFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatThaiDate(value: string | Date) {
  return thaiDateFormatter.format(
    typeof value === "string" ? new Date(value) : value,
  );
}

export function formatThaiDateTime(value: string | Date) {
  return thaiDateTimeFormatter.format(
    typeof value === "string" ? new Date(value) : value,
  );
}
