/**
 * @typedef {Object} User
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {Object} Task
 * @property {string} task_id
 * @property {string} title
 * @property {string} [place_id]
 * @property {string} [constituency]
 * @property {string} [ward]
 * @property {number} priority
 * @property {number} duration_min
 * @property {string} [earliest]
 * @property {string} [latest]
 * @property {string} [window_from]
 * @property {string} [window_to]
 * @property {string[]} depends_on
 */

/**
 * @typedef {Object} Location
 * @property {Object.<string, string[]>} constituencies
 */

/**
 * @typedef {Object} ScheduleRequest
 * @property {string} date
 * @property {string} day_start
 * @property {string} day_end
 */

/**
 * @typedef {Object} ScheduleItem
 * @property {string} task_id
 * @property {string} title
 * @property {string} start
 * @property {string} end
 */

/**
 * @typedef {Object} ScheduleResponse
 * @property {ScheduleItem[]} items
 * @property {string[]} unscheduled
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} ok
 */

export {};
