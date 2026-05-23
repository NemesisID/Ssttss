interface TLV {
  tag: string;
  length: string;
  value: string;
}

function parseTLV(data: string): TLV[] {
  const result: TLV[] = [];
  let i = 0;
  while (i < data.length) {
    const tag = data.substring(i, i + 2);
    i += 2;
    const length = parseInt(data.substring(i, i + 2), 10);
    i += 2;
    const value = data.substring(i, i + length);
    i += length;
    result.push({ tag, length: length.toString().padStart(2, "0"), value });
  }
  return result;
}

function encodeTLV(tlvs: TLV[]): string {
  return tlvs.map((t) => `${t.tag}${t.value.length.toString().padStart(2, "0")}${t.value}`).join("");
}

function crc16CCITT(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function injectAmountToQRIS(staticQris: string, amount: number): string {
  const withoutCRC = staticQris.slice(0, -4);
  let tlvs = parseTLV(withoutCRC);

  // Tag 01: change "11" (static) to "12" (dynamic)
  tlvs = tlvs.map((t) => {
    if (t.tag === "01" && t.value === "11") {
      return { ...t, value: "12" };
    }
    return t;
  });

  // Remove existing Tag 54 (transaction amount) if present
  tlvs = tlvs.filter((t) => t.tag !== "54");

  // Remove CRC (Tag 63)
  tlvs = tlvs.filter((t) => t.tag !== "63");

  // Insert Tag 54 with amount
  const amountStr = amount.toString();
  const tag54: TLV = { tag: "54", length: amountStr.length.toString().padStart(2, "0"), value: amountStr };

  // Insert Tag 54 before Tag 58 (country code) or at end
  const tag58Index = tlvs.findIndex((t) => t.tag === "58");
  if (tag58Index !== -1) {
    tlvs.splice(tag58Index, 0, tag54);
  } else {
    tlvs.push(tag54);
  }

  // Re-encode and calculate CRC
  const encoded = encodeTLV(tlvs);
  const withCRCPlaceholder = encoded + "6304";
  const crc = crc16CCITT(withCRCPlaceholder);

  return withCRCPlaceholder + crc;
}

export function parseQRISInfo(qrisString: string): Record<string, string> {
  const tlvs = parseTLV(qrisString);
  const info: Record<string, string> = {};

  for (const tlv of tlvs) {
    switch (tlv.tag) {
      case "00": info.formatIndicator = tlv.value; break;
      case "01": info.pointOfInitiation = tlv.value; break;
      case "52": info.merchantCategoryCode = tlv.value; break;
      case "53": info.currencyCode = tlv.value; break;
      case "54": info.transactionAmount = tlv.value; break;
      case "58": info.countryCode = tlv.value; break;
      case "59": info.merchantName = tlv.value; break;
      case "60": info.merchantCity = tlv.value; break;
      case "63": info.crc = tlv.value; break;
    }
  }

  return info;
}

export function validateQRIS(qrisString: string): boolean {
  if (qrisString.length < 10) return false;
  const dataWithoutCRC = qrisString.slice(0, -4);
  const existingCRC = qrisString.slice(-4);
  const placeholder = dataWithoutCRC.slice(0, -4) + "6304";
  const calculatedCRC = crc16CCITT(placeholder);
  return calculatedCRC === existingCRC;
}
