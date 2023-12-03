export default class GlobalState{
    public static is_license_valid = true;
    public static license_message = "Valid";
    public static license_data = {};

    public static UserSession: Map<string, string> = new Map();
    public static SESSIONS: Map<string, Record<string, any>> = new Map();
}