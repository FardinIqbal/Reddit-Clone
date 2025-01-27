/**
 * Utility functions for timestamp formatting in Phreddit
 *
 * @module utils/timeUtils
 * @description Handles timestamp formatting according to assignment specifications
 */

/**
 * Calculate relative time from a given date
 * @param {Date} date - The date to format
 * @returns {string} Formatted relative time string
 *
 * Rules:
 * - Same day: seconds/minutes/hours ago
 * - Within a month: days ago
 * - Within a year: months ago
 * - More than a year: years ago
 */
export function formatTimestamp(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    // Check if dates are on the same day
    const sameDay = date.toDateString() === now.toDateString();

    if (sameDay) {
        if (minutes === 0) {
            return `${seconds} seconds ago`;
        }
        if (hours === 0) {
            return `${minutes} minutes ago`;
        }
        return `${hours} hours ago`;
    }

    if (days < 30) {
        return `${days} days ago`;
    }

    if (months < 12) {
        return `${months} month(s) ago`;
    }

    return `${years} year(s) ago`;
}

/**
 * Test cases based on assignment examples
 * const testCases = [
 *   // Same day tests
 *   { input: "Feb 9th, 2022, 09:20:22", view: "Feb 9th, 2022, 09:20:58" }, // "36 seconds ago"
 *   { input: "Feb 9th, 2022, 09:20:22", view: "Feb 9th, 2022, 09:25:58" }, // "5 minutes ago"
 *   { input: "Feb 9th, 2022, 09:20:22", view: "Feb 9th, 2022, 11:30:21" }, // "2 hours ago"
 *
 *   // Different timeframes
 *   { input: "Feb 9th, 2022, 09:20:22", view: "Mar 31, 2022, 09:20:58" }, // "1 month(s) ago"
 *   { input: "Feb 9th, 2022, 09:20:22", view: "Mar 31, 2023, 09:20:58" }, // "1 year(s) ago"
 * ];
 */
