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

export const DEFAULT_BANK_RATE = 0;
