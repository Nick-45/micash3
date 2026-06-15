export const PAYBILL_NUMBER = "522522";
export const MAX_USERS = 2;

export const MEDICAL_FACILITIES = [
  { id: 1, name: "REFERRAL", bank: "KCB Nyamira", account: "PATIENT104" ,paybill: "4115263" },
  { id: 2, name: "Medical Superintendent Ekerenyo", bank: "KCB Nyamira", account: "PATIENT12" ,paybill: "4129819 "  },
  { id: 3, name: "Medical Superintendent Keroka", bank: "KCB Keroka", account: "7615358" ,paybill: "522533"  },
  { id: 4, name: "Manga District Hospital", bank: "KCB Nyamira", account: "PATIENT405", paybill: "4100821"  },
  { id: 5, name: "Nyangena Sub-District Hospital", bank: "KCB Nyamira", account: "PATIENT203",  paybill: "4133413" },
  { id: 6, name: "Medical Superintendent Nyamusi", bank: "KCB Nyamira", account: "PATIENT56" , paybill: "4122725" }
];

export const PAYMENT_CHANNELS = [
  { value: "Pesalink", label: "Pesalink (2-5s)", delay: "2-5 seconds" },
  { value: "EFT", label: "EFT (30-120s)", delay: "30-120 seconds" },
  { value: "RTGS", label: "RTGS (10-30s)", delay: "10-30 seconds" }
];

export const TRANSACTION_STATUS = {
  INITIATED: 'initiated',
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESSFUL: 'successful',
  FAILED: 'failed'
};

export const MOCK_TRANSACTIONS = [
  {
    date: "2026-06-10",
    amount: 12500.00,
    recipient: "Medical Superintendent Nyamira",
    account: "1152757091",
    bank: "KCB Nyamira",
    channel: "Pesalink",
    status: "successful",
    description: "Monthly disbursement"
  },
  {
    date: "2026-06-08",
    amount: 8450.50,
    recipient: "Manga District Hospital",
    account: "1152782088",
    bank: "KCB Nyamira",
    channel: "EFT",
    status: "successful",
    description: "Facility upgrade funds"
  },
  {
    date: "2026-06-05",
    amount: 3200.00,
    recipient: "Medical Superintendent Keroka",
    account: "1152777661",
    bank: "KCB Keroka",
    channel: "RTGS",
    status: "successful",
    description: "Emergency allocation"
  }
];
