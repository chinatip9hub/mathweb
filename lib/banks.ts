export const DEFAULT_BANKS = [
  "ธนาคารออมสิน",
  "ธนาคารอาคารสงเคราะห์",
  "ธนาคารกรุงศรีอยุธยา",
  "ธนาคารกรุงไทย",
  "ธนาคารกสิกรไทย",
  "ธนาคารไทยพาณิชย์",
  "ธนาคารกรุงเทพ",
  "ธนาคารทหารไทยธนชาต",
] as const;

export type BankName = (typeof DEFAULT_BANKS)[number];

export const BANK_ABBREVIATIONS: Record<BankName, string> = {
  ธนาคารออมสิน: "ออมสิน",
  ธนาคารอาคารสงเคราะห์: "อาคารสงเคราะห์",
  ธนาคารกรุงศรีอยุธยา: "กรุงศรี",
  ธนาคารกรุงไทย: "กรุงไทย",
  ธนาคารกสิกรไทย: "กสิกร",
  ธนาคารไทยพาณิชย์: "ไทยพาณิชย์",
  ธนาคารกรุงเทพ: "กรุงเทพ",
  ธนาคารทหารไทยธนชาต: "ทีทีบี",
};

export function getBankAbbreviation(bankName: string): string {
  if (bankName in BANK_ABBREVIATIONS) {
    return BANK_ABBREVIATIONS[bankName as BankName];
  }

  return bankName;
}
