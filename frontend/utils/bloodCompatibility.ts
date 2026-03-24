
const COMPATIBILITY_MAP: Record<string, string[]> = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],
    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],
    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],
    "AB-": ["O-", "A-", "B-", "AB-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

/**
 * Checks if a donor with `donorGroup` can give blood to a patient with `patientGroup`.
 */
export const isCompatible = (donorGroup: string, patientGroup: string): boolean => {
    if (!donorGroup || !patientGroup) return false;

    // Normalize (strip extra spaces/caps)
    const normalizedDonor = donorGroup.trim().toUpperCase();
    const normalizedPatient = patientGroup.trim().toUpperCase();

    const allowedDonors = COMPATIBILITY_MAP[normalizedPatient];
    return allowedDonors ? allowedDonors.includes(normalizedDonor) : false;
};
