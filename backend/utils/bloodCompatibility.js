/**
 * Blood compatibility rules for the backend
 */
const BLOOD_COMPATIBILITY = {
    "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"],
};

/**
 * Checks if a donor with `donorGroup` can give blood to a patient with `patientGroup`.
 * @param {string} donorGroup - The blood group of the donor
 * @param {string} patientGroup - The blood group required by the patient
 * @returns {boolean}
 */
const isCompatible = (donorGroup, patientGroup) => {
    if (!donorGroup || !patientGroup) return false;
    const allowedRecipients = BLOOD_COMPATIBILITY[donorGroup];
    return allowedRecipients ? allowedRecipients.includes(patientGroup) : false;
};

module.exports = {
    BLOOD_COMPATIBILITY,
    isCompatible,
};
