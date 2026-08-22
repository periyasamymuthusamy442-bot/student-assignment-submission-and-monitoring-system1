package util;

import java.util.HashMap;
import java.util.Map;

// Very small JSON helper written from scratch (no external library needed,
// since the project must not use any complex framework).
// It only supports FLAT json objects: {"key":"value","key2":"value2"}
// which is enough for this project's login/create-assignment/etc. requests.
public class JsonUtil {

    // Escapes special characters so strings don't break the JSON format
    public static String escape(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                     .replace("\"", "\\\"")
                     .replace("\n", "\\n")
                     .replace("\r", "");
    }

    public static String pair(String key, String value) {
        return "\"" + key + "\":\"" + escape(value) + "\"";
    }

    public static String pair(String key, int value) {
        return "\"" + key + "\":" + value;
    }

    public static String pair(String key, boolean value) {
        return "\"" + key + "\":" + value;
    }

    // Parses a flat JSON object body sent from the frontend fetch() call
    // into a simple Map<String,String>. Handles strings, numbers, booleans.
    public static Map<String, String> parseFlat(String body) {
        Map<String, String> map = new HashMap<>();
        if (body == null || body.trim().isEmpty()) return map;

        String trimmed = body.trim();
        if (trimmed.startsWith("{")) trimmed = trimmed.substring(1);
        if (trimmed.endsWith("}")) trimmed = trimmed.substring(0, trimmed.length() - 1);

        // Split on commas that are outside quotes
        java.util.List<String> parts = new java.util.ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean insideQuotes = false;
        for (char c : trimmed.toCharArray()) {
            if (c == '"') insideQuotes = !insideQuotes;
            if (c == ',' && !insideQuotes) {
                parts.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        if (current.length() > 0) parts.add(current.toString());

        for (String part : parts) {
            int colonIndex = part.indexOf(':');
            if (colonIndex == -1) continue;
            String key = cleanToken(part.substring(0, colonIndex));
            String value = cleanToken(part.substring(colonIndex + 1));
            map.put(key, value);
        }

        return map;
    }

    private static String cleanToken(String token) {
        token = token.trim();
        if (token.startsWith("\"") && token.endsWith("\"") && token.length() >= 2) {
            token = token.substring(1, token.length() - 1);
        }
        return token.replace("\\\"", "\"").replace("\\\\", "\\");
    }
}
