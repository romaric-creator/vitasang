export default {
    common: {
        seeAll: "See all",
        cancel: "Cancel",
        confirm: "Confirm",
        error: "Error",
        success: "Success",
        bloodGroup: "Blood group"
    },
    home: {
        profileLabel: "Profile",
        launchAlert: "Launch an Alert",
        urgentNeed: "Urgent Need?",
        urgentSection: "Urgent Needs",
        donate: "Donate",
        myStatus: "My Status",
        nextDonation: "Next donation",
        livesSaved: "Lives saved",
        tips: "Help & Advice",
        tipsData: {
            t1: "Why give?",
            d1: "One single donation can save up to three lives.",
            t2: "After donation",
            d2: "Stay hydrated and rest for 15 minutes.",
            t3: "Eligibility",
            d3: "Check conditions before you travel."
        }
    },
    profile: {
        title: "My Profile",
        edit: "Edit my profile",
        history: "Donation history",
        appointments: "My appointments",
        centers: "Donation centers",
        settings: "Settings",
        notifications: "Notifications",
        language: "Language",
        logout: "Logout",
        logoutConfirm: "Are you sure you want to log out?",
        defaultUser: "User",
        donations: "Donations",
        alerts: "Alerts",
        rating: "Rating",
        menu: "Menu"
    },
    centers: {
        title: "Health Centers",
        searchPlaceholder: "Search center...",
        nearby: "Nearby centers",
        noResults: "No center found",
        bookAppointment: "Book appointment",
        appointmentModal: {
            title: "Appointment",
            info: "Online appointment booking will be available soon for this center.",
            close: "CLOSE"
        },
        address: "Address:",
        phone: "Phone:"
    },
    history: {
        title: "Donation History",
        empty: "No donation recorded",
        createAlert: "Create an alert",
        date: "Date:",
        center: "Center:",
        city: "City:",
        defaultType: "Blood donation"
    },
    appointments: {
        title: "My Appointments",
        empty: "No appointment",
        book: "Book an appointment",
        cancel: "Cancel",
        canceled: "Appointment cancelled",
        cancelError: "Cancellation error",
        cancelGenericError: "Error during cancellation",
        date: "Date:",
        time: "Time:",
        type: "Type:",
        code: "Code:",
        phone: "Phone:",
        status: {
            confirmed: "Confirmed",
            completed: "Completed",
            cancelled: "Cancelled",
            pending: "Pending"
        }
    },
    editProfile: {
        title: "Settings",
        header: "Profile",
        subtitle: "Edit your personal information",
        save: "Save Changes",
        success: "Profile updated successfully",
        error: "Error updating profile",
        loadError: "Error loading profile",
        notFound: "Unable to load profile",
        image: {
            pick: "Change Photo",
            error: "Image upload failed",
            success: "Photo updated"
        },
        back: "BACK",
        fields: {
            lastName: "Last Name",
            firstName: "First Name",
            phone: "Phone",
            city: "City"
        },
        placeholders: {
            lastName: "e.g. Smith",
            firstName: "e.g. John",
            phone: "e.g. 6XXXXXXXX",
            city: "New York"
        }
    },
    notifications: {
        title: "Notifications",
        channels: "Notification channels",
        push: {
            title: "Push Notifications",
            desc: "Receive alerts on your phone"
        },
        email: {
            title: "Emails",
            desc: "Receive summaries by email"
        },
        sms: {
            title: "SMS",
            desc: "For extremely urgent alerts"
        },
        preferences: "Alert preferences",
        urgentOnly: {
            title: "Urgent only",
            desc: "Do not be notified for normal needs"
        },
        commitment: "VitaSang is committed to sending you only relevant notifications related to your blood group and geographical area."
    },
    login: {
        title: "VitaSang",
        subtitle: "Login to your account",
        forgotPassword: "Forgot password?",
        submit: "LOGIN",
        noAccount: "No account?",
        registerLink: "Register here",
        error: "An unexpected error occurred.",
        fields: {
            phone: "Phone",
            password: "Password"
        },
        placeholders: {
            phone: "e.g. +2376XXXXXXXX",
            password: "Your password"
        }
    },
    register: {
        title: "VitaSang",
        subtitle: "Create your donor profile",
        step1: {
            title: "Account Info"
        },
        step2: {
            title: "Donor Info",
            subtitle: "Your blood group helps us find the right alerts for you."
        },
        next: "Next",
        back: "Back",
        submit: "CREATE MY ACCOUNT",
        alreadyRegistered: "Already registered?",
        loginLink: "Login here",
        error: "An unexpected error occurred.",
        hintPhone: "Required format: +237 followed by 9 digits",
        fields: {
            lastName: "Last Name",
            firstName: "First Name",
            phone: "Phone",
            password: "Password",
            confirmPassword: "Confirm password",
            bloodGroup: "Blood group"
        },
        placeholders: {
            lastName: "e.g. Smith",
            firstName: "e.g. John",
            phone: "e.g. +2376XXXXXXXX",
            password: "Min 6 chars, uppercase, digit",
            confirmPassword: "Confirm your password"
        }
    },
    alert: {
        title: "New Alert",
        submit: "BROADCAST ALERT",
        donorFound: "{{count}} {{group}} donors found within 10km.",
        searchingDonors: "Searching for compatible donors...",
        locationError: "Location permission denied or unavailable",
        idError: "Error: Alert ID not received",
        genericError: "An error occurred while broadcasting.",
        fields: {
            location: "Location",
            quantity: "Required quantity (units)",
            urgency: "Urgency level",
            description: "Description (optional)"
        },
        placeholders: {
            location: "e.g. Central Hospital",
            quantity: "e.g. 5",
            description: "Additional details"
        },
        urgencyLevels: {
            NORMAL: "NORMAL",
            URGENT: "URGENT",
            TRES_URGENT: "VERY URGENT"
        },
        response: {
            title: "Blood Emergency",
            details: "Alert Details",
            distance: "{{distance}} km away",
            confirmTitle: "Can you help?",
            confirmDesc: "Your blood group is compatible. If you accept, your contact info will be shared with the requester.",
            yes: "I'm coming",
            no: "Not now",
            success: "Thank you! The requester has been notified.",
            contactInfo: "Requester Contact Info"
        },
        tabs: {
            myAlerts: "My Requests",
            myResponses: "My Responses"
        },
        status: {
            en_cours: "In progress",
            resolu: "Resolved",
            annule: "Cancelled"
        },
        actions: {
            accept: "Accept",
            ignore: "Ignore",
            call: "Call",
            close: "Close"
        },
        empty: {
            sent: "No alerts launched",
            accepted: "No accepted interventions",
            subSent: "Press 'Launch an alert' from home",
            subAccepted: "Alerts you respond to will appear here"
        }
    }
};
