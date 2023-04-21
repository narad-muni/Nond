/**
 *
 * @param {Date} currentDate
 * @param {Date|null} selectedDate
 * @param {number} view
 * @param {i18nType} locale
 * @param {number} weekStart
 * @returns {datasetType}
 */
export function compute(currentDate: Date, selectedDate: Date | null, view: number, locale: i18nType, weekStart: number): datasetType;
/**
 *
 * @param {number} newPos
 * @param {number} view
 * @returns {GridPosition}
 */
export function moveGrid(newPos: number, view: number): GridPosition;
export function isLower(a: Date | string, b: Date): boolean;
export function isGreater(a: Date | string, b: Date): boolean;
/**
 *
 * @param {Date|string} date
 * @param {string} format
 * @param {i18nType} i18n
 * @param {string} type
 * @returns
 */
export function parseDate(date: Date | string, format: string, i18n: i18nType, type: string): Date;
/**
 * @param {Date} date
 * @param {string} format
 * @param {i18nType} i18n
 * @param {string} type
 * @returns {string}
 */
export function formatDate(date: Date, format: string, i18n: i18nType, type: string): string;
export const MODE_DECADE: 0;
export const MODE_YEAR: 1;
export const MODE_MONTH: 2;
