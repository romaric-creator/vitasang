import { DeviceEventEmitter } from "react-native";

export const ANALYTICS_EVENT = "ANALYTICS_EVENT";

export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
}

/**
 * Analytics Service
 * Permet d'émettre des événements de tracking depuis n'importe où (même hors composants React)
 */
export const analyticsService = {
    /**
     * Capturer un événement
     */
    trackEvent: (name: string, properties?: Record<string, any>) => {
        DeviceEventEmitter.emit(ANALYTICS_EVENT, { name, properties });
        if (__DEV__) {
            console.log(`[Analytics] Event: ${name}`, properties);
        }
    },

    /**
     * Événements prédéfinis pour assurer la cohérence des noms
     */
    events: {
        // Auth
        LOGIN_STARTED: "login_started",
        LOGIN_SUCCESS: "login_success",
        LOGIN_FAILED: "login_failed",
        REGISTER_SUCCESS: "register_success",
        LOGOUT: "logout",

        // Alerts
        ALERT_CREATION_STARTED: "alert_creation_started",
        ALERT_CREATED: "alert_created",
        ALERT_FAILED: "alert_failed",
        ALERT_ACCEPTED: "alert_accepted",
        ALERT_IGNORED: "alert_ignored",

        // Appointments
        APPOINTMENT_BOOKED: "appointment_booked",

        // Errors
        API_ERROR: "api_error",
        RUNTIME_ERROR: "runtime_error",

        // Map
        MAP_MARKER_SELECTED: "map_marker_selected",
        MAP_SEARCH_RADIUS_CHANGED: "map_radius_changed",
    },
};
