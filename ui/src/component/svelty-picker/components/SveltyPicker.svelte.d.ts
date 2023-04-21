export const config: {
    theme: string;
    mode: string;
    format: string;
    formatType: string;
    minuteIncrement: number;
    weekStart: number;
    inputClasses: string;
    todayBtnClasses: string;
    clearBtnClasses: string;
    todayBtn: boolean;
    clearBtn: boolean;
    autoclose: boolean;
    clearToggle: boolean;
    i18n: {
        days: string[];
        daysShort: string[];
        daysMin: string[]; /** @type {number} */
        months: string[];
        monthsShort: string[];
        meridiem: string[];
        suffix: string[];
        todayBtn: string;
        clearBtn: string;
        timeView: string;
        backToDate: string;
    };
};
/** @typedef {typeof __propDef.props}  SveltyPickerProps */
/** @typedef {typeof __propDef.events}  SveltyPickerEvents */
/** @typedef {typeof __propDef.slots}  SveltyPickerSlots */
export default class SveltyPicker extends SvelteComponentTyped<{
    startDate?: string | Date | null | undefined;
    endDate?: Date | null | undefined;
    weekStart?: number | undefined;
    i18n?: i18nType | undefined;
    minuteIncrement?: number | undefined;
    inputId?: string | undefined;
    name?: string | undefined;
    disabled?: boolean | undefined;
    placeholder?: string | null | undefined;
    required?: boolean | undefined;
    inputElement?: HTMLInputElement | null | undefined;
    value?: string | null | undefined;
    initialDate?: Date | null | undefined;
    pickerOnly?: boolean | undefined;
    startView?: number | undefined;
    theme?: string | undefined;
    mode?: string | undefined;
    format?: string | undefined;
    formatType?: string | undefined;
    inputClasses?: string | undefined;
    todayBtnClasses?: string | undefined;
    clearBtnClasses?: string | undefined;
    todayBtn?: boolean | undefined;
    clearBtn?: boolean | undefined;
    clearToggle?: boolean | undefined;
    autoclose?: boolean | undefined;
    positionFn?: typeof usePosition | undefined;
    validatorAction?: any[] | null | undefined;
    setDateValue?: ((val: string) => void) | undefined;
}, {
    input: Event;
    change: CustomEvent<any>;
    mousedown: MouseEvent;
    blur: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
    get setDateValue(): (val: string) => void;
}
export type SveltyPickerProps = typeof __propDef.props;
export type SveltyPickerEvents = typeof __propDef.events;
export type SveltyPickerSlots = typeof __propDef.slots;
import { usePosition } from "../utils/utils";
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        startDate?: string | Date | null | undefined;
        endDate?: Date | null | undefined;
        weekStart?: number | undefined;
        i18n?: i18nType | undefined;
        minuteIncrement?: number | undefined;
        inputId?: string | undefined;
        name?: string | undefined;
        disabled?: boolean | undefined;
        placeholder?: string | null | undefined;
        required?: boolean | undefined;
        inputElement?: HTMLInputElement | null | undefined;
        value?: string | null | undefined;
        initialDate?: Date | null | undefined;
        pickerOnly?: boolean | undefined;
        startView?: number | undefined;
        theme?: string | undefined;
        mode?: string | undefined;
        format?: string | undefined;
        formatType?: string | undefined;
        inputClasses?: string | undefined;
        todayBtnClasses?: string | undefined;
        clearBtnClasses?: string | undefined;
        todayBtn?: boolean | undefined;
        clearBtn?: boolean | undefined;
        clearToggle?: boolean | undefined;
        autoclose?: boolean | undefined;
        positionFn?: typeof usePosition | undefined;
        validatorAction?: any[] | null | undefined;
        setDateValue?: ((val: string) => void) | undefined;
    };
    events: {
        input: Event;
        change: CustomEvent<any>;
        mousedown: MouseEvent;
        blur: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
