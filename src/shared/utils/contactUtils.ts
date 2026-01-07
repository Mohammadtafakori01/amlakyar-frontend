import { PropertyFileZone } from '../../domains/property-files/types';
import { CreateContactRequest } from '../../domains/contacts/types';

/**
 * استخراج نام و نام خانوادگی از رشته owner
 * @param owner - رشته حاوی نام مالک
 * @returns شیء شامل firstName و lastName
 * 
 * @example
 * extractNameParts("علی احمدی") // { firstName: "علی", lastName: "احمدی" }
 * extractNameParts("محمد") // { firstName: "محمد", lastName: "" }
 * extractNameParts("سید حسین موسوی") // { firstName: "سید", lastName: "حسین موسوی" }
 */
export function extractNameParts(owner: string): { firstName: string; lastName: string } {
  const trimmed = owner.trim();
  const parts = trimmed.split(/\s+/);
  
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  
  return { firstName, lastName };
}

/**
 * ایجاد داده مخاطب از اطلاعات فایل ملکی
 * @param owner - نام مالک
 * @param phone - شماره تماس
 * @param address - آدرس (اختیاری)
 * @param zone - نوع زونکن فایل ملکی
 * @param estateId - شناسه آژانس کاربر فعلی (اختیاری)
 * @returns داده آماده برای ایجاد مخاطب
 */
export function createContactDataFromPropertyFile(
  owner: string,
  phone: string,
  zone: PropertyFileZone,
  address?: string,
  estateId?: string
): CreateContactRequest {
  const { firstName, lastName } = extractNameParts(owner);
  const isEstateContact = zone === PropertyFileZone.OFFICE_MASTER;
  
  return {
    firstName: firstName || 'بدون نام',
    lastName: lastName || '',
    phoneNumber: phone,
    address: address || undefined,
    isEstateContact,
    ...(isEstateContact && estateId ? { estateId } : {}),
  };
}

