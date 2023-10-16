
export type MonthlyRentRecord = {
    vacancy: boolean,
    rentAmount: number,
    rentDueDate: Date
}

export type MonthlyRentRecords = Array<MonthlyRentRecord>;

/**
 * Determines the vacancy, rent amount and due date for each month in a given time window
 * 
 * @param baseMonthlyRent : The base or starting monthly rent for unit (Number)
 * @param leaseStartDate : The date that the tenant's lease starts (Date)
 * @param windowStartDate : The first date of the given time window (Date)
 * @param windowEndDate : The last date of the given time window (Date)
 * @param dayOfMonthRentDue : The day of each month on which rent is due (Number)
 * @param rentRateChangeFrequency : The frequency in months the rent is changed (Number)
 * @param rentChangeRate : The rate to increase or decrease rent, input as decimal (not %), positive for increase, negative for decrease (Number),
 * @returns Array<MonthlyRentRecord>;
 */

export function calculateMonthlyRent(
    baseMonthlyRent: number, leaseStartDate: Date, windowStartDate: Date,
    windowEndDate: Date, dayOfMonthRentDue: number, rentRateChangeFrequency: number, rentChangeRate: number
): MonthlyRentRecords {

    const monthlyRentRecords: MonthlyRentRecords = [];
    let currentRent = baseMonthlyRent;
    let currentDate = new Date(windowStartDate);
    let monthsSinceRentChange = 0;

    // Loop through all the months in the provided time window
    while (currentDate <= windowEndDate) {
        let rentDueDate = getNextRentDueDate(currentDate, dayOfMonthRentDue);

        // Handle months before the lease starts
        if (currentDate < leaseStartDate) {  
            // Set vacancy to true and rent amount to 0 for months before lease starts
            monthlyRentRecords.push({
                rentAmount: 0,
                rentDueDate: rentDueDate,
                vacancy: true,
            });
            currentDate = getNextMonthStart(currentDate);
            continue;
        }

        // Handle the month when the lease starts
        if (currentDate.getFullYear() === leaseStartDate.getFullYear() && currentDate.getMonth() === leaseStartDate.getMonth()) {
            rentDueDate = getNextRentDueDate(currentDate, dayOfMonthRentDue);

            // IF's considering the lease scenarios and calculate prorated rent
            // If lease starts on the 1st and rent is due later that month
            if (leaseStartDate.getDate() === 1 && dayOfMonthRentDue > getDaysInMonth(currentDate)) {
                monthlyRentRecords.push({
                    rentAmount: parseFloat(currentRent.toFixed(2)),
                    rentDueDate: rentDueDate,
                    vacancy: false,
                });
            } 
            // If lease starts on the 1st, but rent is due on the 1st of next month
            else if (leaseStartDate.getDate() === 1 && rentDueDate.getDate() !== 1) {
                const proratedRentBeforeDueDate = currentRent * (rentDueDate.getDate() - leaseStartDate.getDate()) / 30;
                monthlyRentRecords.push({
                    rentAmount: parseFloat(proratedRentBeforeDueDate.toFixed(2)),
                    rentDueDate: new Date(leaseStartDate),
                    vacancy: false,
                });
                monthlyRentRecords.push({
                    rentAmount: parseFloat(currentRent.toFixed(2)),
                    rentDueDate: rentDueDate,
                    vacancy: false,
                });
            } 
            // If lease starts before the rent due date in the month
            else if (leaseStartDate.getDate() < rentDueDate.getDate()) {
                const proratedRentBeforeDueDate = currentRent * (rentDueDate.getDate() - leaseStartDate.getDate()) / 30;
                
                monthlyRentRecords.push({
                    rentAmount: parseFloat(proratedRentBeforeDueDate.toFixed(2)),
                    rentDueDate: new Date(leaseStartDate),
                    vacancy: false,
                });
                
                monthlyRentRecords.push({
                    rentAmount: parseFloat(currentRent.toFixed(2)),
                    rentDueDate: rentDueDate,
                    vacancy: false,
                });
            } 
            // For other scenarios in the month, just calculate prorated rent for the month
            else {
                const proratedRent = currentRent * (30 - (leaseStartDate.getDate() - dayOfMonthRentDue)) / 30;
                
                monthlyRentRecords.push({
                    rentAmount: parseFloat(proratedRent.toFixed(2)),
                    rentDueDate: new Date(leaseStartDate),
                    vacancy: false,
                });
            }
            
            currentDate = getNextMonthStart(currentDate);
            continue;
        }

        // Handle rent changes based on defined frequency and rate
        monthsSinceRentChange++;
        if (monthsSinceRentChange === rentRateChangeFrequency) {
            currentRent += currentRent * rentChangeRate;
            monthsSinceRentChange = 0;
        }

        // Create a regular monthly rent record
        monthlyRentRecords.push({
            rentAmount: parseFloat(currentRent.toFixed(2)),
            rentDueDate: rentDueDate,
            vacancy: false,
        });
        
        currentDate = getNextMonthStart(currentDate);
    }
  
    return monthlyRentRecords;
}

/**
 * Calculates the start of the next month.
 * 
 * @param date - The current date.
 * @returns Date - The first day of the next month.
 */

function getNextMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}
  
/**
 * Calculates the rent due date for a given month.
 * 
 * @param currentDate - Current date within the desired month.
 * @param dayOfMonthRentDue - The day of the month when the rent is due.
 * @returns Date - The exact rent due date for the month.
 */

function getNextRentDueDate(currentDate: Date, dayOfMonthRentDue: number): Date {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);

    // If rent is due after the last day of the month, set it to the last day
    if (dayOfMonthRentDue > daysInMonth) {
        return new Date(year, month, daysInMonth);
    }

    return new Date(year, month, dayOfMonthRentDue);
}

/**
 * Determines how many days are in a given month.
 * 
 * @param date - A date within the desired month.
 * @returns number - The number of days in that month.
 */

function getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}


/**
 * Calculates the new monthly rent
 * 
 * @param baseMonthlyRent : the base amount of rent
 * @param rentChangeRate : the rate that rent my increase or decrease (positive for increase, negative for decrease)
 * @returns number
 * 
 */
function calculateNewMonthlyRent(baseMonthlyRent: number, rentChangeRate: number) {
    return baseMonthlyRent * (1 + rentChangeRate);
}

/**
 * Determines if the year is a leap year
 * 
 * @param year 
 * @returns boolean
 * 
 */
function isLeapYear(year: number) {
    return (year % 4 == 0 && year % 100 != 0);
}
